using Cite.EvalIt.Common;
using Cite.EvalIt.Query;
using Cite.Tools.Data.Builder;
using Cite.Tools.Data.Query;
using Cite.Tools.Json;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Cite.EvalIt.IntegrationEvent.Outbox
{
	public class NotificationIntegrationEventHandler : INotificationIntegrationEventHandler
	{
		private readonly IOutboxService _outboxService;
		private readonly ILogger<NotificationIntegrationEventHandler> _logging;
		private readonly JsonHandlingService _jsonHandlingService;
		private readonly QueryFactory _queryFactory;
		private readonly BuilderFactory _builderFactory;
		private readonly IQueryingService _queryingService;

		public NotificationIntegrationEventHandler(
			ILogger<NotificationIntegrationEventHandler> logging,
			JsonHandlingService jsonHandlingService,
			IOutboxService outboxService,
			QueryFactory queryFactory,
			BuilderFactory builderFactory,
			IQueryingService queryingService
			)
		{
			this._logging = logging;
			this._jsonHandlingService = jsonHandlingService;
			this._outboxService = outboxService;
			this._queryFactory = queryFactory;
			this._builderFactory = builderFactory;
			this._queryingService = queryingService;
		}

		public async Task HandleAsync(NotificationIntegrationEvent @event)
		{
			OutboxIntegrationEvent message = new OutboxIntegrationEvent()
			{
				Id = Guid.NewGuid().ToString(),
				Type = OutboxIntegrationEvent.EventType.Notify,
				Event = @event
			};
			await this._outboxService.PublishAsync(message);
		}
	}
}
