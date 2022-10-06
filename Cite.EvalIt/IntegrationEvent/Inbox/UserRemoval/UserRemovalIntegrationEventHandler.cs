using Cite.EvalIt.Audit;
using Cite.EvalIt.Common;
using Cite.EvalIt.ErrorCode;
using Cite.EvalIt.IntegrationEvent.Inbox.Extensions;
using Cite.EvalIt.Service.LogTracking;
using Cite.EvalIt.Service.User;
using Cite.Tools.Exception;
using Cite.Tools.Json;
using Cite.WebTools.CurrentPrincipal;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;
using Serilog.Context;
using System;
using System.Collections.Generic;
using System.Resources;
using System.Text;
using System.Threading.Tasks;

namespace Cite.EvalIt.IntegrationEvent.Inbox
{
	public class UserRemovalIntegrationEventHandler : IUserRemovalIntegrationEventHandler
	{
		private readonly ILogger<UserRemovalIntegrationEventHandler> _logging;
		private readonly IServiceProvider _serviceProvider;
		private readonly JsonHandlingService _jsonHandlingService;
		private readonly IStringLocalizer<EvalIt.Resources.MySharedResources> _localizer;
		private readonly ErrorThesaurus _errors;

		public UserRemovalIntegrationEventHandler(
			ILogger<UserRemovalIntegrationEventHandler> logging,
			JsonHandlingService jsonHandlingService,
			IServiceProvider serviceProvider,
			IStringLocalizer<EvalIt.Resources.MySharedResources> localizer,
			ErrorThesaurus errors)
		{
			this._logging = logging;
			this._jsonHandlingService = jsonHandlingService;
			this._serviceProvider = serviceProvider;
			this._localizer = localizer;
			this._errors = errors;
		}

		public async Task<EventProcessingStatus> Handle(IntegrationEventProperties properties, string message)
		{
			try
			{
				UserRemovalIntegrationEvent @event = this._jsonHandlingService.FromJsonSafe<UserRemovalIntegrationEvent>(message);
				if (@event == null) return EventProcessingStatus.Error;

				if (!@event.UserId.HasValue) throw new MyValidationException(this._errors.ModelValidation.Code, nameof(@event.UserId), this._localizer["Validation_Required", nameof(@event.UserId)]);

				using (var serviceScope = this._serviceProvider.CreateScope())
				{
					System.Security.Claims.ClaimsPrincipal claimsPrincipal = properties.SimulateIntegrationEventUser();
					ICurrentPrincipalResolverService currentPrincipalResolverService = serviceScope.ServiceProvider.GetService<ICurrentPrincipalResolverService>();
					currentPrincipalResolverService.Push(claimsPrincipal);

					UserRemovalConsistencyHandler userRemovalConsistencyHandler = serviceScope.ServiceProvider.GetService<UserRemovalConsistencyHandler>();

					if (!(await userRemovalConsistencyHandler.IsConsistent(new UserRemovalConsistencyPredicates { UserId = @event.UserId.Value }))) return EventProcessingStatus.Postponed;

					IUserService userService = serviceScope.ServiceProvider.GetService<IUserService>();
					await userService.DeleteAndSaveAsync(@event.UserId.Value);

					IAuditService auditService = serviceScope.ServiceProvider.GetService<IAuditService>();

					auditService.Track(AuditableAction.User_Delete, "id", @event.UserId.Value);
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
