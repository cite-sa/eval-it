using Cite.EvalIt.Common;
using Cite.EvalIt.Event;
using Cite.EvalIt.IntegrationEvent.Inbox.Extensions;
using Cite.EvalIt.Service.LogTracking;
//using Cite.EvalIt.Transaction;
using Cite.Tools.Cipher;
using Cite.Tools.Json;
using Cite.Tools.Validation;
using Cite.WebTools.CurrentPrincipal;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Serilog.Context;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Cite.EvalIt.IntegrationEvent.Inbox
{
	public class APIKeyStaleIntegrationEventHandler : IAPIKeyStaleIntegrationEventHandler
	{
		private readonly ILogger<APIKeyStaleIntegrationEventHandler> _logging;
		private readonly IServiceProvider _serviceProvider;
		private readonly JsonHandlingService _jsonHandlingService;

		public APIKeyStaleIntegrationEventHandler(
			ILogger<APIKeyStaleIntegrationEventHandler> logging,
			JsonHandlingService jsonHandlingService,
			IServiceProvider serviceProvider)
		{
			this._logging = logging;
			this._jsonHandlingService = jsonHandlingService;
			this._serviceProvider = serviceProvider;
		}

		public async Task<EventProcessingStatus> Handle(IntegrationEventProperties properties, string message)
		{
			try
			{
				APIKeyStaleIntegrationEvent @event = this._jsonHandlingService.FromJsonSafe<APIKeyStaleIntegrationEvent>(message);
				if (@event == null) return EventProcessingStatus.Error;

				APIKeyStaleIntegrationEventValidatingModel model = new APIKeyStaleIntegrationEventValidatingModel
				{
					UserId = @event.UserId,
					KeyHash = @event.KeyHash
				};

				using (var serviceScope = this._serviceProvider.CreateScope())
				{
					ValidatorFactory validatorFactory = serviceScope.ServiceProvider.GetService<ValidatorFactory>();
					validatorFactory.Validator<APIKeyStaleIntegrationEventValidatingModel.Validator>().ValidateForce(model);

					System.Security.Claims.ClaimsPrincipal claimsPrincipal = properties.SimulateIntegrationEventUser();
					ICurrentPrincipalResolverService currentPrincipalResolverService = serviceScope.ServiceProvider.GetService<ICurrentPrincipalResolverService>();
					currentPrincipalResolverService.Push(claimsPrincipal);

					ICipherService cipherService = serviceScope.ServiceProvider.GetService<ICipherService>();
					CipherProfiles cipherProfiles = serviceScope.ServiceProvider.GetService<CipherProfiles>();

					String decryptedKeyHash = cipherService.DecryptSymetricAes(@event.KeyHash, cipherProfiles.ConfigurationProfileName);

					EventBroker eventBroker = serviceScope.ServiceProvider.GetService<EventBroker>();

					eventBroker.EmitApiKeyRemoved(@event.UserId.Value, decryptedKeyHash);

					currentPrincipalResolverService.Pop();
				}
				return EventProcessingStatus.Success;
			}
			catch (System.Exception ex)
			{
				this._logging.LogWarning(ex, "could not handle event. returning nack");
				return EventProcessingStatus.Error;
			}
		}
	}
}
