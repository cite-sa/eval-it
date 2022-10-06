using Cite.EvalIt.Common;
using Cite.EvalIt.Data.Context;
using Cite.EvalIt.ErrorCode;
using Cite.EvalIt.IntegrationEvent;
using Cite.EvalIt.IntegrationEvent.Inbox;
using Cite.EvalIt.Query;
using Cite.EvalIt.Service.LogTracking;
using Cite.EvalIt.Web.Tasks.QueueListener.RabbitMQ.Extensions;
using Cite.Tools.Data.Query;
using Cite.Tools.Exception;
using Cite.Tools.Json;
using Cite.Tools.Logging.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Serilog.Context;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Cite.EvalIt.Web.Tasks.QueueListener.RabbitMQ
{
	public class QueueListenerTask : QueueListenerTaskBase
	{
		private readonly ILogger<QueueListenerTask> _logging;
		private readonly QueueListenerConfig _config;
		private readonly IServiceProvider _serviceProvider;
		private readonly ErrorThesaurus _errors;
		private IConnection _queueConnection;
		private IModel _queueChannel;

		public QueueListenerTask(
			ILogger<QueueListenerTask> logging,
			JsonHandlingService jsonHandlingService,
			QueueListenerConfig config,
			LogTrackingConfig logTrackingConfig,
			IServiceProvider serviceProvider,
			ErrorThesaurus errors) : base(logging, jsonHandlingService, logTrackingConfig, config, serviceProvider)
		{
			this._logging = logging;
			this._config = config;
			this._serviceProvider = serviceProvider;
			this._errors = errors;
		}

		protected override async Task ExecuteAsync(CancellationToken stoppingToken)
		{
			this._logging.Debug("starting...");

			if (!this._config.Enable)
			{
				this._logging.Information("Listener disabled. exiting");
				return;
			}

			this.BootstrapQueue();

			stoppingToken.Register(() => this._logging.Information($"requested to stop..."));
			stoppingToken.ThrowIfCancellationRequested();

			AsyncEventingBasicConsumer consumer = new AsyncEventingBasicConsumer(this._queueChannel);
			consumer.Received += OnConsumerReceived;
			consumer.Shutdown += OnConsumerShutdown;
			consumer.Registered += OnConsumerRegistered;
			consumer.Unregistered += OnConsumerUnregistered;
			consumer.ConsumerCancelled += OnConsumerCancelled;

			this._queueChannel.BasicConsume(
				queue: this._config.QueueName,
				autoAck: false,
				consumer: consumer);

			while (!stoppingToken.IsCancellationRequested)
			{
				try
				{
					this._logging.Debug($"going to sleep for {this._config.IntervalSeconds} seconds...");
					await Task.Delay(TimeSpan.FromSeconds(this._config.IntervalSeconds), stoppingToken);
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

				if (this._config.Enable) await this.Process();
			}

			this._logging.Information("returning...");

			return;
		}

		private void BootstrapQueue()
		{
			ConnectionFactory factory = new ConnectionFactory
			{
				HostName = this._config.HostName,
				Port = this._config.Port,
				UserName = this._config.Username,
				Password = this._config.Password,
				DispatchConsumersAsync = true
			};

			factory.AutomaticRecoveryEnabled = this._config.ConnectionRecovery.Enabled;
			if (this._config.ConnectionRecovery.Enabled)
			{
				factory.NetworkRecoveryInterval = TimeSpan.FromMilliseconds(this._config.ConnectionRecovery.NetworkRecoveryInterval);
			}
			this._queueConnection = this.CreateConnection(factory);

			this._queueChannel = this._queueConnection.CreateModel();
			this._queueChannel.BasicQos((uint)this._config.QosPrefetchSize, (ushort)this._config.QosPrefetchCount, this._config.QosGlobal);

			this._queueChannel.ExchangeDeclare(
				exchange: this._config.Exchange,
				type: "topic",
				durable: this._config.Durable,
				autoDelete: false,
				arguments: null);

			this._queueChannel.QueueDeclare(
				queue: this._config.QueueName,
				durable: this._config.Durable,
				exclusive: false,
				autoDelete: false,
				arguments: null);

			this.BindTopics(this._queueChannel, this._config.QueueName, this._config.ForgetMeRequestTopic);
			this.BindTopics(this._queueChannel, this._config.QueueName, this._config.ForgetMeRevokeTopic);
			this.BindTopics(this._queueChannel, this._config.QueueName, this._config.UserRemovalTopic);
			this.BindTopics(this._queueChannel, this._config.QueueName, this._config.UserTouchedTopic);
			this.BindTopics(this._queueChannel, this._config.QueueName, this._config.WhatYouKnowAboutMeRequestTopic);
			this.BindTopics(this._queueChannel, this._config.QueueName, this._config.WhatYouKnowAboutMeRevokeTopic);
			this.BindTopics(this._queueChannel, this._config.QueueName, this._config.APIKeyStaleTopic);
			this.BindTopics(this._queueChannel, this._config.QueueName, this._config.GenerateFileCompletedTopic);

			this._queueConnection.ConnectionShutdown += OnConnectionShutdown;
			this._queueConnection.RecoverySucceeded += OnRecoverySucceeded;
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
					this._logging.Error(ex, "problem connecting to Queue.Will retry in {seconds} seconds...", TimeSpan.FromMilliseconds(this._config.ConnectionRecovery.UnreachableRecoveryInterval).Seconds);
					Thread.Sleep(this._config.ConnectionRecovery.UnreachableRecoveryInterval);
				}
			}
		}

		private void BindTopics(IModel channel, String queueName, List<String> topics)
		{
			foreach (String topic in topics)
			{
				channel.QueueBind(
					queue: queueName,
					exchange: this._config.Exchange,
					routingKey: topic);
			}
		}

		private async Task OnConsumerReceived(object sender, BasicDeliverEventArgs @event)
		{
			Boolean ack = false;
			try
			{
				ack = await this.ConsumeMessage(@event);
			}
			catch (System.Exception ex)
			{
				this._logging.Warning(ex, "there was a problem consuming the queued message. continuing...");
			}
			if (ack) this._queueChannel.BasicAck(@event.DeliveryTag, false);
			else this._queueChannel.BasicNack(@event.DeliveryTag, false, false);
		}

		private void OnConnectionShutdown(object sender, ShutdownEventArgs @event)
		{
			this._logging.Information("Queue event {0} with args {1}", nameof(OnConnectionShutdown), @event);
		}
		private void OnRecoverySucceeded(object sender, EventArgs @event)
		{
			this._logging.Information("Queue event {0} with args {1}", nameof(OnRecoverySucceeded), @event);
		}

		private Task OnConsumerCancelled(object sender, global::RabbitMQ.Client.Events.ConsumerEventArgs @event)
		{
			this._logging.Information("Queue event {0} with args {1}", nameof(OnConsumerCancelled), @event);
			return Task.CompletedTask;
		}

		private Task OnConsumerUnregistered(object sender, global::RabbitMQ.Client.Events.ConsumerEventArgs @event)
		{
			this._logging.Information("Queue event {0} with args {1}", nameof(OnConsumerUnregistered), @event);
			return Task.CompletedTask;
		}

		private Task OnConsumerRegistered(object sender, global::RabbitMQ.Client.Events.ConsumerEventArgs @event)
		{
			this._logging.Information("Queue event {0} with args {1}", nameof(OnConsumerRegistered), @event);
			return Task.CompletedTask;
		}

		private Task OnConsumerShutdown(object sender, ShutdownEventArgs @event)
		{
			this._logging.Information("Queue event {0} with args {1}", nameof(OnConsumerShutdown), @event);
			return Task.CompletedTask;
		}

		private async Task<Boolean> ConsumeMessage(BasicDeliverEventArgs @event)
		{
			using (var serviceScope = this._serviceProvider.CreateScope())
			{
				using (AppDbContext dbContext = serviceScope.ServiceProvider.GetService<AppDbContext>())
				{
					IBasicProperties properties = @event.BasicProperties;
					if (@event.Redelivered)
					{
						if (!Guid.TryParse(properties.MessageId, out Guid mId))
						{
							this._logging.Error($"Could not extract message id for event from {@event.BasicProperties.AppId}");
							throw new MyApplicationException(this._errors.SystemError.Code, this._errors.SystemError.Message);
						}
						if (dbContext.QueueInboxes.Any(x => x.MessageId == mId)) return true;
					}

					using (var transaction = await dbContext.Database.BeginTransactionAsync())
					{
						try
						{
							String message = Encoding.UTF8.GetString(@event.Body);
							Data.QueueInbox queueMessage = new Data.QueueInbox
							{
								Id = Guid.NewGuid(),
								Exchange = this._config.Exchange,
								Queue = this._config.QueueName,
								Route = @event.RoutingKey,
								ApplicationId = properties.AppId,
								MessageId = Guid.Parse(properties.MessageId),
								Message = message,
								IsActive = IsActive.Active,
								Status = QueueInboxStatus.Pending,
								RetryCount = 0,
								CreatedAt = DateTime.UtcNow,
								UpdatedAt = DateTime.UtcNow
							};

							dbContext.Add(queueMessage);
							await dbContext.SaveChangesAsync();
							transaction.Commit();
							return true;
						}
						catch (System.Exception ex)
						{
							this._logging.Error(ex, $"Could not save message {properties.MessageId}");
							return false;
						}
					}
				}
			}
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
