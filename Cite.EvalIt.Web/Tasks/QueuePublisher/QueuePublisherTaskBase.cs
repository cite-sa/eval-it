using Cite.EvalIt.Common;
using Cite.EvalIt.Data.Context;
using Cite.EvalIt.Query;
using Cite.Tools.Data.Query;
using Cite.Tools.Logging.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Cite.EvalIt.Web.Tasks.QueuePublisher
{
	public abstract class QueuePublisherTaskBase : Microsoft.Extensions.Hosting.BackgroundService
	{
		private readonly ILogger _logging;
		private readonly QueuePublisherConfigBase _publisherConfig;
		private readonly IServiceProvider _serviceProvider;
		private readonly Random _random = new Random();

		public QueuePublisherTaskBase(
			ILogger logging,
			IServiceProvider serviceProvider,
			QueuePublisherConfigBase publisherConfig)
		{
			this._logging = logging;
			this._publisherConfig = publisherConfig;
			this._serviceProvider = serviceProvider;
		}

		protected async Task Process()
		{
			try
			{
				//GOTCHA: Notifications with same createdat are ignored util other set to final state
				DateTime? lastCandidateCreationTimestamp = null;
				while (true)
				{
					CandidateInfo candidate = await this.CandidateToNotify(lastCandidateCreationTimestamp);
					if (candidate == null) break;
					lastCandidateCreationTimestamp = candidate.MessageCreatedAt;

					this._logging.Debug($"Processing notify message: {candidate.MessageId}");

					Boolean shouldOmit = await this.ShouldOmitNotify(candidate.MessageId);
					if (shouldOmit)
					{
						this._logging.Debug($"Omitting message {candidate.MessageId}");
						//skipping reprocessing for this iteration
						continue;
					}

					Boolean shouldWait = await this.ShouldWait(candidate);
					if (shouldWait)
					{
						this._logging.Debug($"Will no retry message {candidate.MessageId}");
						//skipping reprocessing for this iteration
						continue;
					}

					Boolean successfulyProcessed = await this.Notify(candidate.MessageId);
					if (!successfulyProcessed)
					{
						//skipping reprocessing for this iteration
					}
				}
			}
			catch (System.Exception ex)
			{
				this._logging.Error(ex, $"Problem processing messages. Breaking for next interval");
			}
		}

		protected async Task<Boolean> ShouldOmitNotify(Guid outboxMessageId)
		{
			using (var serviceScope = this._serviceProvider.CreateScope())
			{
				using (AppDbContext dbContext = serviceScope.ServiceProvider.GetService<AppDbContext>())
				{
					using (var transaction = await dbContext.Database.BeginTransactionAsync())
					{
						try
						{
							Data.QueueOutbox queueMessage = await dbContext.QueueOutboxes.FirstOrDefaultAsync(x => x.Id == outboxMessageId);


							TimeSpan age = DateTime.UtcNow - queueMessage.CreatedAt;
							if (!this._publisherConfig.Options.TooOldToSendSeconds.HasValue)
							{
								transaction.Commit();
								return false;
							}
							TimeSpan omitThreshold = TimeSpan.FromSeconds(this._publisherConfig.Options.TooOldToSendSeconds.Value);
							if (age < omitThreshold)
							{
								transaction.Commit();
								return false;
							}

							queueMessage.NotifyStatus = QueueOutboxNotifyStatus.Omitted;
							queueMessage.UpdatedAt = DateTime.UtcNow;
							dbContext.Update(queueMessage);
							await dbContext.SaveChangesAsync();

							transaction.Commit();
							return true;
						}
						catch (System.Exception ex)
						{
							this._logging.Error(ex, $"Could not mark message {outboxMessageId} as omitted");
							//Still want to skip it from processing
							transaction.Rollback();
							return true;
						}
					}
				}
			}
		}

		protected class CandidateInfo
		{
			public Guid MessageId { get; set; }
			public QueueOutboxNotifyStatus PreviousState { get; set; }
			public DateTime MessageCreatedAt { get; set; }
		}

		protected abstract void OnConfirmTimeout(Guid messageId);

		protected async Task<CandidateInfo> CandidateToNotify(DateTime? lastCandidateCreationTimestamp)
		{
			using (var serviceScope = this._serviceProvider.CreateScope())
			{
				using (AppDbContext dbContext = serviceScope.ServiceProvider.GetService<AppDbContext>())
				{
					using (var transaction = await dbContext.Database.BeginTransactionAsync())
					{
						try
						{
							QueryFactory queryFactory = serviceScope.ServiceProvider.GetService<QueryFactory>();

							List<Data.QueueOutbox> candidates = new List<Data.QueueOutbox>();


							Data.QueueOutbox item = await queryFactory.Query<QueueOutboxQuery>()
								.IsActive(IsActive.Active)
								.Status(new QueueOutboxNotifyStatus[] { QueueOutboxNotifyStatus.Pending, QueueOutboxNotifyStatus.WaitingConfirmation, QueueOutboxNotifyStatus.Error })
								.RetryThreshold(this._publisherConfig.Options.RetryThreashold)
								.ConfirmTimeout(this._publisherConfig.Options.ConfirmTimeoutSeconds)
								.CreatedAfter(lastCandidateCreationTimestamp)
								.Ordering(new Ordering().AddAscending(nameof(Data.QueueOutbox.CreatedAt)))
								.FirstAsync();

							if (item != null) candidates.Add(item);

							Data.QueueOutbox outboxMessage = candidates.OrderBy(x => x.CreatedAt).FirstOrDefault();

							if (outboxMessage == null)
							{
								transaction.Commit();
								return null;
							}

							bool confirmTimeout = (outboxMessage.PublishedAt.HasValue && !outboxMessage.ConfirmedAt.HasValue)
								&& outboxMessage.PublishedAt.Value.AddSeconds(this._publisherConfig.Options.ConfirmTimeoutSeconds) > DateTime.UtcNow;
							if (confirmTimeout) this.OnConfirmTimeout(outboxMessage.Id);

							QueueOutboxNotifyStatus prevState = outboxMessage.NotifyStatus;
							outboxMessage.NotifyStatus = QueueOutboxNotifyStatus.Processing;
							outboxMessage.UpdatedAt = DateTime.UtcNow;

							dbContext.Update(outboxMessage);
							await dbContext.SaveChangesAsync();

							transaction.Commit();

							return new CandidateInfo() { MessageId = outboxMessage.Id, MessageCreatedAt = outboxMessage.CreatedAt, PreviousState = prevState };
						}
						catch (DbUpdateConcurrencyException ex)
						{
							// we get this if/when someone else already modified the notifications. We want to essentially ignore this, and keep working
							this._logging.Debug($"Concurrency exception getting list of notifications. Skipping: {ex.Message}");
							transaction.Rollback();
							return null;
						}
						catch (System.Exception ex)
						{
							this._logging.Error(ex, $"Problem getting list of notifications. Skipping: {ex.Message}");
							transaction.Rollback();
							return null;
						}
					}
				}
			}
		}

		protected async Task<Boolean> ShouldWait(CandidateInfo candidate)
		{
			using (var serviceScope = this._serviceProvider.CreateScope())
			{
				using (AppDbContext dbContext = serviceScope.ServiceProvider.GetService<AppDbContext>())
				{
					using (var transaction = await dbContext.Database.BeginTransactionAsync())
					{
						try
						{
							Data.QueueOutbox notification = await dbContext.QueueOutboxes.FirstOrDefaultAsync(x => x.Id == candidate.MessageId);

							if (!notification.RetryCount.HasValue || notification.RetryCount.Value < 1)
							{
								transaction.Commit();
								return false;
							}

							int accumulatedRetry = 0;
							int pastAccumulateRetry = 0;
							for (int i = 1; i <= notification.RetryCount + 1; i += 1) accumulatedRetry += (i * this._publisherConfig.Options.RetryDelayStepSeconds);
							for (int i = 1; i <= notification.RetryCount; i += 1) pastAccumulateRetry += (i * this._publisherConfig.Options.RetryDelayStepSeconds);
							int randAccumulatedRetry = this._random.Next((int)(accumulatedRetry / 2), accumulatedRetry + 1);
							int additionalTime = randAccumulatedRetry > this._publisherConfig.Options.MaxRetryDelaySeconds ? this._publisherConfig.Options.MaxRetryDelaySeconds : randAccumulatedRetry;
							int retry = pastAccumulateRetry + additionalTime;

							DateTime retryOn = notification.CreatedAt.AddSeconds(retry);
							Boolean itIsTime = retryOn <= DateTime.UtcNow;

							if (!itIsTime)
							{
								notification.NotifyStatus = candidate.PreviousState;
								notification.UpdatedAt = DateTime.UtcNow;
								dbContext.Update(notification);
								await dbContext.SaveChangesAsync();
							}

							transaction.Commit();

							return !itIsTime;
						}
						catch (System.Exception ex)
						{
							this._logging.Error(ex, $"Could not check message {candidate.MessageId} for retry");
							//Still want to skip it from processing
							transaction.Rollback();
							return false;
						}
					}
				}
			}
		}

		protected abstract Boolean Publish(Data.QueueOutbox queueOutboxMessage);

		protected abstract Boolean AutoconfirmOnPublish { get; }

		protected async Task<Boolean> Notify(Guid outboxMessageId)
		{
			using (var serviceScope = this._serviceProvider.CreateScope())
			{
				using (AppDbContext dbContext = serviceScope.ServiceProvider.GetService<AppDbContext>())
				{
					Data.QueueOutbox queueOutboxMessage = null;
					try
					{
						queueOutboxMessage = await dbContext.QueueOutboxes.FirstOrDefaultAsync(x => x.Id == outboxMessageId);
					}
					catch (System.Exception ex)
					{
						this._logging.Warning(ex, $"Could not lookup message {outboxMessageId} to process. Continuing...");
						return false;
					}

					Boolean success = false;
					using (var transaction = await dbContext.Database.BeginTransactionAsync())
					{
						try
						{
							//The tracker must porperly update the Notify State so that the notification does not remain locked
							success = this.Publish(queueOutboxMessage);
							if (success)
							{
								if (this.AutoconfirmOnPublish)
								{
									queueOutboxMessage.NotifyStatus = QueueOutboxNotifyStatus.Confirmed;
									queueOutboxMessage.ConfirmedAt = DateTime.UtcNow;
								}
								else
								{
									queueOutboxMessage.NotifyStatus = QueueOutboxNotifyStatus.WaitingConfirmation;
								}
								queueOutboxMessage.PublishedAt = DateTime.UtcNow;
								queueOutboxMessage.UpdatedAt = DateTime.UtcNow;
							}
							else
							{
								queueOutboxMessage.NotifyStatus = QueueOutboxNotifyStatus.Error;
								queueOutboxMessage.RetryCount = queueOutboxMessage.RetryCount.HasValue ? queueOutboxMessage.RetryCount.Value + 1 : 0;
								queueOutboxMessage.PublishedAt = null;
							}
							queueOutboxMessage.UpdatedAt = DateTime.UtcNow;
							dbContext.Update(queueOutboxMessage);
							await dbContext.SaveChangesAsync();
							transaction.Commit();
						}
						catch (System.Exception ex)
						{
							this._logging.Error(ex, $"Problem sending message. rolling back any message emit db changes and marking error. If message was send it might cause multiple emits. Continuing...");
							transaction.Rollback();
							success = false;
						}
					}
					return success;
				}
			}
		}
	}
}

