using Cite.EvalIt.Common;
using Cite.Tools.Json;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Cite.EvalIt.IntegrationEvent.Outbox
{
	public class WhatYouKnowAboutMeCompletedIntegrationEventHandler : IWhatYouKnowAboutMeCompletedIntegrationEventHandler
	{
		private readonly IOutboxService _outboxService;
		private readonly ILogger<WhatYouKnowAboutMeCompletedIntegrationEventHandler> _logging;
		private readonly JsonHandlingService _jsonHandlingService;

		public WhatYouKnowAboutMeCompletedIntegrationEventHandler(
			ILogger<WhatYouKnowAboutMeCompletedIntegrationEventHandler> logging,
			JsonHandlingService jsonHandlingService,
			IOutboxService outboxService
			)
		{
			this._logging = logging;
			this._jsonHandlingService = jsonHandlingService;
			this._outboxService = outboxService;
		}

		public async Task HandleAsync(WhatYouKnowAboutMeCompletedIntegrationEvent @event)
		{
			OutboxIntegrationEvent message = new OutboxIntegrationEvent()
			{
				Id = Guid.NewGuid().ToString(),
				Type = OutboxIntegrationEvent.EventType.WhatYouKnowAboutMeCompleted,
				Event = @event
			};

			await this._outboxService.PublishAsync(message);
		}
	}
}
