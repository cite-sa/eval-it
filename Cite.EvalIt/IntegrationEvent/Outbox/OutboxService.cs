using Cite.EvalIt.Common;
using Cite.EvalIt.Data.Context;
using Cite.EvalIt.Service.LogTracking;
//using Cite.EvalIt.Common.LogTracking;
using Cite.Tools.Json;
using Cite.Tools.Logging.Extensions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Cite.EvalIt.IntegrationEvent.Outbox
{
	public class OutboxService : IOutboxService
	{
		private readonly AppDbContext _dbContext;
		private readonly OutboxConfig _config;
		private readonly ILogger<OutboxService> _logging;
		private readonly IServiceProvider _serviceProvider;
		private readonly JsonHandlingService _jsonHandlingService;
		private readonly ILogTrackingService _logTrackingService;

		public OutboxService(
			AppDbContext dbContext,
			OutboxConfig config,
			ILogger<OutboxService> logging,
			ILogTrackingService logTrackingService,
			IServiceProvider serviceProvider,
			JsonHandlingService jsonHandlingService
			)
		{
			this._dbContext = dbContext;
			this._config = config;
			this._logging = logging;
			this._logTrackingService = logTrackingService;
			this._serviceProvider = serviceProvider;
			this._jsonHandlingService = jsonHandlingService;
		}
		public async Task PublishAsync(OutboxIntegrationEvent @event)
		{
			try
			{
				String routingKey;
				switch (@event.Type)
				{
					case OutboxIntegrationEvent.EventType.ForgetMeCompleted:
						{
							routingKey = this._config.ForgetMeCompletedTopic;
							break;
						}
					case OutboxIntegrationEvent.EventType.Notify:
						{
							routingKey = this._config.NotifyTopic;
							break;
						}
					case OutboxIntegrationEvent.EventType.WhatYouKnowAboutMeCompleted:
						{
							routingKey = this._config.WhatYouKnowAboutMeCompletedTopic;
							break;
						}
					case OutboxIntegrationEvent.EventType.GenerateFile:
						{
							routingKey = this._config.GenerateFileTopic;
							break;
						}
					default:
						{
							this._logging.Error($"unrecognized outgoing integration event {@event.Type}. Skipping...");
							return;
						}
				}

				Guid correlationId = Guid.NewGuid();
				if (@event.Event != null) @event.Event.TrackingContextTag = correlationId.ToString();
				@event.Message = this._jsonHandlingService.ToJsonSafe(@event.Event);
				this._logTrackingService.Trace(correlationId.ToString(), $"Correlating current tracking context with new correlationId {correlationId}");

				Data.QueueOutbox queueMessage = new Data.QueueOutbox
				{
					Id = Guid.NewGuid(),
					Exchange = this._config.Exchange,
					Route = routingKey,
					MessageId = Guid.Parse(@event.Id),
					Message = this._jsonHandlingService.ToJsonSafe(@event),
					IsActive = IsActive.Active,
					NotifyStatus = QueueOutboxNotifyStatus.Pending,
					RetryCount = 0,
					CreatedAt = DateTime.UtcNow,
					UpdatedAt = DateTime.UtcNow
				};

				_dbContext.Add(queueMessage);
				await _dbContext.SaveChangesAsync();

				return;
			}
			catch (System.Exception ex)
			{
				this._logging.Error(ex, $"Could not save message {@event.Message}");
				//Still want to skip it from processing
				return;
			}
		}
	}
}