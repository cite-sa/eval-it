using Cite.EvalIt.Common;
using Cite.EvalIt.Data.Context;
using Cite.EvalIt.IntegrationEvent;
using Cite.EvalIt.IntegrationEvent.Inbox;
using Cite.EvalIt.Query;
using Cite.EvalIt.Service.LogTracking;
using Cite.Tools.Data.Query;
using Cite.Tools.Json;
using Cite.Tools.Logging.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Serilog.Context;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Cite.EvalIt.Web.Tasks.QueueListener
{
	public abstract class QueueListenerTaskBase : Microsoft.Extensions.Hosting.BackgroundService
	{
		private readonly ILogger _logging;
		private readonly IServiceProvider _serviceProvider;
		private readonly QueueListenerConfigBase _listenerConfig;
		private readonly JsonHandlingService _jsonHandlingService;
		private readonly LogTrackingConfig _logTrackingConfig;
		private readonly Random _random = new Random();

		public QueueListenerTaskBase(
			ILogger logging,
			JsonHandlingService jsonHandlingService,
			LogTrackingConfig logTrackingConfig,
			QueueListenerConfigBase listenerConfig,
			IServiceProvider serviceProvider)
		{
			this._logging = logging;
			this._jsonHandlingService = jsonHandlingService;
			this._logTrackingConfig = logTrackingConfig;
			this._listenerConfig = listenerConfig;
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

					Boolean successfulyProcessed = await this.Emit(candidate.MessageId);
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

		protected async Task<Boolean> ShouldOmitNotify(Guid inboxMessageId)
		{
			using (var serviceScope = this._serviceProvider.CreateScope())
			{
				using (AppDbContext dbContext = serviceScope.ServiceProvider.GetService<AppDbContext>())
				{
					using (var transaction = await dbContext.Database.BeginTransactionAsync())
					{
						try
						{
                            EvalIt.Data.QueueInbox queueMessage = await dbContext.QueueInboxes.FirstOrDefaultAsync(x => x.Id == inboxMessageId);

							TimeSpan age = DateTime.UtcNow - queueMessage.CreatedAt;
							if (!this._listenerConfig.Options.TooOldToSendSeconds.HasValue)
							{
								transaction.Commit();
								return false;
							}
							TimeSpan omitThreshold = TimeSpan.FromSeconds(this._listenerConfig.Options.TooOldToSendSeconds.Value);
							if (age < omitThreshold)
							{
								transaction.Commit();
								return false;
							}

							queueMessage.Status = QueueInboxStatus.Omitted;
							queueMessage.UpdatedAt = DateTime.UtcNow;
							dbContext.Update(queueMessage);
							await dbContext.SaveChangesAsync();

							transaction.Commit();
							return true;
						}
						catch (System.Exception ex)
						{
							this._logging.Error(ex, $"Could not mark message {inboxMessageId} as omitted");
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
			public QueueInboxStatus PreviousState { get; set; }
			public DateTime MessageCreatedAt { get; set; }
		}

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

							List<Data.QueueInbox> candidates = new List<Data.QueueInbox>();

							Data.QueueInbox item = await queryFactory.Query<QueueInboxQuery>()
								.IsActive(IsActive.Active)
								.Status(new QueueInboxStatus[] { QueueInboxStatus.Pending, QueueInboxStatus.Error })
								.RetryThreshold(this._listenerConfig.Options.RetryThreashold)
								.CreatedAfter(lastCandidateCreationTimestamp)
								.Ordering(new Ordering().AddAscending(nameof(Data.QueueInbox.CreatedAt)))
								.FirstAsync();

							if (item != null) candidates.Add(item);

							Data.QueueInbox inboxMessage = candidates.OrderBy(x => x.CreatedAt).FirstOrDefault();

							if (inboxMessage == null)
							{
								transaction.Commit();
								return null;
							}

							QueueInboxStatus prevState = inboxMessage.Status;
							inboxMessage.Status = QueueInboxStatus.Processing;
							inboxMessage.UpdatedAt = DateTime.UtcNow;

							dbContext.Update(inboxMessage);
							await dbContext.SaveChangesAsync();

							transaction.Commit();

							return new CandidateInfo() { MessageId = inboxMessage.Id, MessageCreatedAt = inboxMessage.CreatedAt, PreviousState = prevState };
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
							Data.QueueInbox notification = await dbContext.QueueInboxes.FirstOrDefaultAsync(x => x.Id == candidate.MessageId);

							if (!notification.RetryCount.HasValue || notification.RetryCount.Value < 1)
							{
								transaction.Commit();
								return false;
							}

							int accumulatedRetry = 0;
							int pastAccumulateRetry = 0;
							for (int i = 1; i <= notification.RetryCount + 1; i += 1) accumulatedRetry += (i * this._listenerConfig.Options.RetryDelayStepSeconds);
							for (int i = 1; i <= notification.RetryCount; i += 1) pastAccumulateRetry += (i * this._listenerConfig.Options.RetryDelayStepSeconds);
							int randAccumulatedRetry = this._random.Next((int)(accumulatedRetry / 2), accumulatedRetry + 1);
							int additionalTime = randAccumulatedRetry > this._listenerConfig.Options.MaxRetryDelaySeconds ? this._listenerConfig.Options.MaxRetryDelaySeconds : randAccumulatedRetry;
							int retry = pastAccumulateRetry + additionalTime;

							DateTime retryOn = notification.CreatedAt.AddSeconds(retry);
							Boolean itIsTime = retryOn <= DateTime.UtcNow;

							if (!itIsTime)
							{
								notification.Status = candidate.PreviousState;
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

		protected async Task<Boolean> Emit(Guid inboxMessageId)
		{
			using (var serviceScope = this._serviceProvider.CreateScope())
			{
				using (AppDbContext dbContext = serviceScope.ServiceProvider.GetService<AppDbContext>())
				{
					Data.QueueInbox queueInboxMessage = null;
					try
					{
						queueInboxMessage = await dbContext.QueueInboxes.FirstOrDefaultAsync(x => x.Id == inboxMessageId);
					}
					catch (System.Exception ex)
					{
						this._logging.Warning(ex, $"Could not lookup message {inboxMessageId} to process. Continuing...");
						return false;
					}

					Boolean success = false;
					using (var transaction = await dbContext.Database.BeginTransactionAsync())
					{
						try
						{
							//The tracker must porperly update the Notify State so that the notification does not remain locked
							EventProcessingStatus status = await this.ProcessMessage(queueInboxMessage.Route, queueInboxMessage.MessageId.ToString(), queueInboxMessage.ApplicationId, queueInboxMessage.Message);
							switch (status)
							{
								case EventProcessingStatus.Success: { queueInboxMessage.Status = QueueInboxStatus.Successful; break; }
								case EventProcessingStatus.Postponed: { queueInboxMessage.Status = QueueInboxStatus.Parked; break; }
								case EventProcessingStatus.Error:
									{
										queueInboxMessage.Status = QueueInboxStatus.Error;
										queueInboxMessage.RetryCount = queueInboxMessage.RetryCount.HasValue ? queueInboxMessage.RetryCount.Value + 1 : 0;
										break;
									}
								case EventProcessingStatus.Discard:
								default: { queueInboxMessage.Status = QueueInboxStatus.Discard; break; }
							}
							success = status == EventProcessingStatus.Success;
							queueInboxMessage.UpdatedAt = DateTime.UtcNow;
							dbContext.Update(queueInboxMessage);
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

		protected async Task<EventProcessingStatus> ProcessMessage(String routingKey, String messageId, String appId, String message)
		{
			IIntegrationEventHandler handler;
			if (this.RoutingKeyMatched(routingKey, this._listenerConfig.UserTouchedTopic)) handler = this._serviceProvider.GetRequiredService<IUserTouchedIntegrationEventHandler>();
			else if (this.RoutingKeyMatched(routingKey, this._listenerConfig.UserRemovalTopic)) handler = this._serviceProvider.GetRequiredService<IUserRemovalIntegrationEventHandler>();
			else if (this.RoutingKeyMatched(routingKey, this._listenerConfig.APIKeyStaleTopic)) handler = this._serviceProvider.GetRequiredService<IAPIKeyStaleIntegrationEventHandler>();
            //else if (this.RoutingKeyMatched(routingKey, this._listenerConfig.ForgetMeRequestTopic)) handler = this._serviceProvider.GetRequiredService<IForgetMeIntegrationEventHandler>();
            //else if (this.RoutingKeyMatched(routingKey, this._listenerConfig.ForgetMeRevokeTopic)) handler = this._serviceProvider.GetRequiredService<IForgetMeRevokeIntegrationEventHandler>();
            //else if (this.RoutingKeyMatched(routingKey, this._listenerConfig.WhatYouKnowAboutMeRequestTopic)) handler = this._serviceProvider.GetRequiredService<IWhatYouKnowAboutMeIntegrationEventHandler>();
            //else if (this.RoutingKeyMatched(routingKey, this._listenerConfig.WhatYouKnowAboutMeRevokeTopic)) handler = this._serviceProvider.GetRequiredService<IWhatYouKnowAboutMeRevokeIntegrationEventHandler>();
            //else if (this.RoutingKeyMatched(routingKey, this._listenerConfig.GenerateFileCompletedTopic)) handler = this._serviceProvider.GetRequiredService<IGenerateFileCompletedIntegrationEventHandler>();
            else handler = null;

			if (handler == null) return EventProcessingStatus.Discard;

			IntegrationEventProperties properties = new IntegrationEventProperties
			{
				AppId = appId,
				MessageId = messageId
			};

			TrackedEvent @event = this._jsonHandlingService.FromJsonSafe<TrackedEvent>(message);
			using (LogContext.PushProperty(this._logTrackingConfig.LogTrackingContextName, @event.TrackingContextTag))
			{
				try
				{
					return await handler.Handle(properties, message);
				}
				catch (System.Exception ex)
				{
					this._logging.Error(ex, "problem handling event from routing key {0}. Setting nack and continuing...", routingKey);
					return EventProcessingStatus.Error;
				}
			}
		}

		private Boolean RoutingKeyMatched(String routingKey, List<String> topics)
		{
			if (topics == null || topics.Count == 0) return false;
			return topics.Any(x => x.Equals(routingKey));
		}
	}
}
