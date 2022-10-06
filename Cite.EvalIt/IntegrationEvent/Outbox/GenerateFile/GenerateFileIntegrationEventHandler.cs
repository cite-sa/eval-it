using Cite.EvalIt.Common;
using Cite.Tools.Json;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Cite.EvalIt.IntegrationEvent.Outbox
{
	public class GenerateFileIntegrationEventHandler : IGenerateFileIntegrationEventHandler
	{
		private readonly IOutboxService _outboxService;
		private readonly ILogger<GenerateFileIntegrationEventHandler> _logging;
		private readonly JsonHandlingService _jsonHandlingService;

		public GenerateFileIntegrationEventHandler(
			ILogger<GenerateFileIntegrationEventHandler> logging,
			JsonHandlingService jsonHandlingService,
			IOutboxService outboxService
			)
		{
			this._logging = logging;
			this._jsonHandlingService = jsonHandlingService;
			this._outboxService = outboxService;
		}

		public async Task HandleAsync(GenerateFileIntegrationEvent @event)
		{
			OutboxIntegrationEvent message = new OutboxIntegrationEvent()
			{
				Id = Guid.NewGuid().ToString(),
				Type = OutboxIntegrationEvent.EventType.GenerateFile,
				Event = @event
			};

			await this._outboxService.PublishAsync(message);
		}
	}
}
