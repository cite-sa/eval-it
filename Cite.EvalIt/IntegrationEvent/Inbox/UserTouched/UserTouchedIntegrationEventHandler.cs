using Cite.EvalIt.Audit;
using Cite.EvalIt.Common;
using Cite.EvalIt.IntegrationEvent.Inbox.Extensions;
using Cite.EvalIt.Model;
using Cite.EvalIt.Service.LogTracking;
using Cite.EvalIt.Service.User;
//using Cite.EvalIt.Transaction;
//using Cite.EvalIt.Common.Audit;
using Cite.Tools.Json;
using Cite.Tools.Validation;
using Cite.WebTools.CurrentPrincipal;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Serilog.Context;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Cite.EvalIt.IntegrationEvent.Inbox
{
	public class UserTouchedIntegrationEventHandler : IUserTouchedIntegrationEventHandler
	{
		private readonly ILogger<UserTouchedIntegrationEventHandler> _logging;
		private readonly IServiceProvider _serviceProvider;
		private readonly JsonHandlingService _jsonHandlingService;

		public UserTouchedIntegrationEventHandler(
			ILogger<UserTouchedIntegrationEventHandler> logging,
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
				UserTouchedIntegrationEvent @event = this._jsonHandlingService.FromJsonSafe<UserTouchedIntegrationEvent>(message);
				if (@event == null) return EventProcessingStatus.Error;

				UserTouchedIntegrationEventPersist model = new UserTouchedIntegrationEventPersist
				{
					Id = @event.Id,
					Name = @event.Name,

                    Profile = new UserProfileIntegrationPersist
                    {
						Culture = @event.Profile?.Culture,
						Language = @event.Profile?.Language,
						Timezone = @event.Profile?.Timezone,
					}
				};

				using (var serviceScope = this._serviceProvider.CreateScope())
				{
						ValidatorFactory validatorFactory = serviceScope.ServiceProvider.GetService<ValidatorFactory>();
						validatorFactory.Validator<UserTouchedIntegrationEventPersist.UserTouchedIntegrationEventValidator>().ValidateForce(model);

						System.Security.Claims.ClaimsPrincipal claimsPrincipal = properties.SimulateIntegrationEventUser();
						ICurrentPrincipalResolverService currentPrincipalResolverService = serviceScope.ServiceProvider.GetService<ICurrentPrincipalResolverService>();
						currentPrincipalResolverService.Push(claimsPrincipal);

						IUserService userService = serviceScope.ServiceProvider.GetService<IUserService>();
						await userService.PersistAsync(model);

						IAuditService auditService = serviceScope.ServiceProvider.GetService<IAuditService>();

						auditService.Track(AuditableAction.User_Persist, new Dictionary<String, Object>{
								{ "model", model },
							});
						auditService.TrackIdentity(AuditableAction.IdentityTracking_Action);

						currentPrincipalResolverService.Pop();

						return EventProcessingStatus.Success;
				}
			}
			catch (System.Exception ex)
			{
				this._logging.LogWarning(ex, "could not handle event. returning nack");
				return EventProcessingStatus.Error;
			}
		}
	}
}
