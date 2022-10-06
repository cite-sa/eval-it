using Cite.EvalIt.Common;
using Cite.EvalIt.Data.Context;
using Cite.EvalIt.IntegrationEvent.Outbox;
using Cite.EvalIt.Query;
using Cite.EvalIt.Web.Tasks.QueuePublisher.RabbitMQ.MessageLookup;
using Cite.Tools.Common.Extensions;
using Cite.Tools.Data.Query;
using Cite.Tools.Json;
using Cite.Tools.Logging.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Cite.EvalIt.Web.Tasks.QueuePublisher.RabbitMQ
{
	public class QueuePublisherTask : QueuePublisherTaskBase
	{
		private readonly ILogger<QueuePublisherTask> _logging;
		private readonly QueuePublisherConfig _publisherConfig;
		private readonly OutboxConfig _outboxConfig;
		private readonly IServiceProvider _serviceProvider;
		private readonly JsonHandlingService _jsonHandlingService;
		private readonly IMessageStorage<UInt64, Guid> _unconfirmedPublishedMessages = new InverseLookupMessageStorage<UInt64, Guid>();
		private IConnection _queueConnection;
		private IModel _queueChannel;

		public QueuePublisherTask(
			ILogger<QueuePublisherTask> logging,
			QueuePublisherConfig publisherConfig,
			OutboxConfig outboxConfig,
			IServiceProvider serviceProvider,
			JsonHandlingService jsonHandlingService) : base(logging, serviceProvider, publisherConfig)
		{
			this._logging = logging;
			this._publisherConfig = publisherConfig;
			this._outboxConfig = outboxConfig;
			this._serviceProvider = serviceProvider;
			this._jsonHandlingService = jsonHandlingService;
		}

		protected override async Task ExecuteAsync(CancellationToken stoppingToken)
		{
			this._logging.Debug("starting...");

			if (!this._publisherConfig.Enable)
			{
				this._logging.Information("Publisher disabled. exiting");
				return;
			}

			this.BootstrapQueue();

			stoppingToken.Register(() => this._logging.Information($"requested to stop..."));

			while (!stoppingToken.IsCancellationRequested)
			{
				try
				{
					this._logging.Debug($"going to sleep for {this._publisherConfig.IntervalSeconds} seconds...");
					await Task.Delay(TimeSpan.FromSeconds(this._publisherConfig.IntervalSeconds), stoppingToken);
				}
				catch (TaskCanceledException ex)
				{
					this._logging.Information($"Task canceled: {ex.Message}");
					break;
				}
				catch (System.Exception ex)
				{
					this._logging.Error(ex, "Error while delaying to process notification. Continuing");
				}

				if (this._publisherConfig.Enable) await this.Process();
			}

			this._logging.Information("stoping...");
		}

		protected override bool AutoconfirmOnPublish { get { return false; } }

		private void BootstrapQueue()
		{
			ConnectionFactory factory = new ConnectionFactory
			{
				HostName = this._publisherConfig.HostName,
				Port = this._publisherConfig.Port,
				UserName = this._publisherConfig.Username,
				Password = this._publisherConfig.Password,
				DispatchConsumersAsync = true
			};

			factory.AutomaticRecoveryEnabled = this._publisherConfig.ConnectionRecovery.Enabled;
			if (this._publisherConfig.ConnectionRecovery.Enabled)
			{
				factory.NetworkRecoveryInterval = TimeSpan.FromMilliseconds(this._publisherConfig.ConnectionRecovery.NetworkRecoveryInterval);
			}
			this._queueConnection = this.CreateConnection(factory);

			this._queueChannel = this._queueConnection.CreateModel();
			this._queueChannel.ExchangeDeclare(
				exchange: this._outboxConfig.Exchange,
				type: "topic",
				durable: this._publisherConfig.Durable,
				autoDelete: false,
				arguments: null);

			this._queueChannel.ConfirmSelect();
			this._queueConnection.ConnectionShutdown += OnConnectionShutdown;
			this._queueChannel.BasicAcks += OnBasicAcks;
			this._queueChannel.BasicNacks += OnBasicNacks;
		}

		public IConnection CreateConnection(ConnectionFactory factory)
		{
			while (true)
			{
				try
				{
					return factory.CreateConnection();
				}
				catch (System.Exception ex)
				{
					this._logging.Error(ex, $"problem connecting to Queue.Will retry in {TimeSpan.FromMilliseconds(this._publisherConfig.ConnectionRecovery.UnreachableRecoveryInterval).Seconds} seconds...");
					Thread.Sleep(this._publisherConfig.ConnectionRecovery.UnreachableRecoveryInterval);
				}
			}
		}

		private async void OnBasicAcks(object sender, BasicAckEventArgs @event)
		{
			this._logging.Information($"Received confirm for delivery tag {@event.DeliveryTag}, multiple {@event.Multiple}");
			List<Guid> confirmedMessages = new List<Guid>();
			if (@event.Multiple)
			{
				var confirmedTags = this._unconfirmedPublishedMessages.Where(x => x.Key <= @event.DeliveryTag);
				foreach (var tag in confirmedTags.Select(x => x.Key))
				{
					var key = this._unconfirmedPublishedMessages.PurgeByKey(tag);
					if (key == Guid.Empty)
					{
						this._logging.Information($"Could not find message for confirm {@event.DeliveryTag}");
						continue;
					}
					confirmedMessages.Add(key);
				}
			}
			else
			{
				var key = this._unconfirmedPublishedMessages.PurgeByKey(@event.DeliveryTag);
				if (key == Guid.Empty)
				{
					this._logging.Information($"Could not find message for confirm {@event.DeliveryTag}");
					return;
				}
				confirmedMessages = key.AsList();
			}
			await this.HandleConfirm(confirmedMessages);
		}

		private async void OnBasicNacks(object sender, BasicNackEventArgs @event)
		{
			this._logging.Information($"Received nack for delivery tag {@event.DeliveryTag}, multiple {@event.Multiple}");
			List<Guid> nackedMessages = new List<Guid>();
			if (@event.Multiple)
			{
				var nackedTags = this._unconfirmedPublishedMessages.Where(x => x.Key <= @event.DeliveryTag);
				foreach (var tag in nackedTags.Select(x => x.Key))
				{
					var key = this._unconfirmedPublishedMessages.PurgeByKey(tag);
					if (key == Guid.Empty)
					{
						this._logging.Error($"Could not find message for confirm {@event.DeliveryTag}");
						continue;
					}
					nackedMessages.Add(key);
				}
			}
			else
			{
				var key = this._unconfirmedPublishedMessages.PurgeByKey(@event.DeliveryTag);
				if (key == Guid.Empty)
				{
					this._logging.Error($"Could not find message for confirm {@event.DeliveryTag}");
					return;
				}
				nackedMessages = key.AsList();
			}
			await this.HandleNack(nackedMessages);
		}

		protected override Boolean Publish(Data.QueueOutbox queueOutboxMessage)
		{
			try
			{
				OutboxIntegrationEvent @event = this._jsonHandlingService.FromJsonSafe<OutboxIntegrationEvent>(queueOutboxMessage.Message);
				byte[] body = Encoding.UTF8.GetBytes(@event.Message);

				IBasicProperties properties = this._queueChannel.CreateBasicProperties();
				properties.Persistent = true;
				properties.MessageId = @event.Id;
				properties.AppId = this._publisherConfig.AppId;

                var deliveryTag = this._queueChannel.NextPublishSeqNo;
				this._queueChannel.BasicPublish(
					exchange: queueOutboxMessage.Exchange,
					routingKey: queueOutboxMessage.Route,
					basicProperties: properties,
					body: body);
				this._unconfirmedPublishedMessages.Add(deliveryTag, queueOutboxMessage.Id);
				return true;
			}
			catch (System.Exception ex)
			{
				this._logging.Error(ex, "unable to publish event. Continuing...");
				return false;
			}
		}

		protected override void OnConfirmTimeout(Guid messageId)
		{
			this.ClearFromCache(messageId);
		}

		private async Task HandleConfirm(IEnumerable<Guid> confirmedMessages)
		{
			using (var serviceScope = this._serviceProvider.CreateScope())
			{
				using (AppDbContext dbContext = serviceScope.ServiceProvider.GetService<AppDbContext>())
				{
					List<Data.QueueOutbox> queueOutboxMessages = null;
					try
					{
						queueOutboxMessages = await dbContext.QueueOutboxes.Where(x => confirmedMessages.Contains(x.Id)).ToListAsync();
					}
					catch (System.Exception ex)
					{
						this._logging.Warning(ex, $"Could not lookup messages {String.Join(",", confirmedMessages)} to process. Continuing...");
						return;
					}

					using (var transaction = await dbContext.Database.BeginTransactionAsync())
					{
						try
						{
							foreach (Data.QueueOutbox queueOutboxMessage in queueOutboxMessages)
							{
								queueOutboxMessage.NotifyStatus = QueueOutboxNotifyStatus.Confirmed;
								queueOutboxMessage.UpdatedAt = DateTime.UtcNow;
								queueOutboxMessage.ConfirmedAt = DateTime.UtcNow;
							}

							dbContext.UpdateRange(queueOutboxMessages);
							await dbContext.SaveChangesAsync();
							transaction.Commit();
						}
						catch (System.Exception ex)
						{
							this._logging.Error(ex, $"Problem sending message. rolling back any message emit db changes and marking error. If message was send it might cause multiple emits. Continuing...");
							transaction.Rollback();
						}
					}
				}
			}
		}

		private async Task HandleNack(IEnumerable<Guid> nackedMessages)
		{
			using (var serviceScope = this._serviceProvider.CreateScope())
			{
				using (AppDbContext dbContext = serviceScope.ServiceProvider.GetService<AppDbContext>())
				{
					List<Data.QueueOutbox> nackedQueueOutboxMessages = null;
					try
					{
						nackedQueueOutboxMessages = await dbContext.QueueOutboxes.Where(x => nackedMessages.Contains(x.Id)).ToListAsync();
					}
					catch (System.Exception ex)
					{
						this._logging.Warning(ex, $"Could not lookup messages {String.Join(",", nackedMessages)} to process. Continuing...");
						return;
					}

					using (var transaction = await dbContext.Database.BeginTransactionAsync())
					{
						try
						{
							foreach (Data.QueueOutbox queueOutboxMessage in nackedQueueOutboxMessages)
							{
								queueOutboxMessage.NotifyStatus = QueueOutboxNotifyStatus.Error;
								queueOutboxMessage.RetryCount = queueOutboxMessage.RetryCount.HasValue ? queueOutboxMessage.RetryCount.Value + 1 : 0;
								queueOutboxMessage.UpdatedAt = DateTime.UtcNow;
							}

							dbContext.UpdateRange(nackedQueueOutboxMessages);
							await dbContext.SaveChangesAsync();
							transaction.Commit();
						}
						catch (System.Exception ex)
						{
							this._logging.Error(ex, $"Problem sending message. rolling back any message emit db changes and marking error. If message was send it might cause multiple emits. Continuing...");
							transaction.Rollback();
						}
					}
				}
			}
		}

		private void ClearFromCache(Guid messageId)
		{			
			this._unconfirmedPublishedMessages.PurgeByValue(messageId);
		}

		private void OnConnectionShutdown(object sender, ShutdownEventArgs @event)
		{
			this._logging.Information("Queue event {0} with args {1}", nameof(OnConnectionShutdown), @event);
		}

		public override void Dispose()
		{
			if (this._queueChannel != null)
			{
				this._queueChannel.Close();
				this._queueChannel.Dispose();
			}
			if (this._queueConnection != null)
			{
				this._queueConnection.Close();
				this._queueConnection.Dispose();
			}
			base.Dispose();
		}
	}
}
