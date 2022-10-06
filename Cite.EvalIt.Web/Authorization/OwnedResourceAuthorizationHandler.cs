using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using System.Linq;
using System.Threading.Tasks;
using Cite.Tools.Logging.Extensions;
using Cite.EvalIt.Authorization;
using System;
using Cite.Tools.Auth.Claims;

namespace Cite.EvalIt.Web.Authorization
{
	public class OwnedResourceAuthorizationHandler : AuthorizationHandler<OwnedResourceRequirement, OwnedResource>
	{
		private readonly IPermissionPolicyService _permissionPolicyService;
		private readonly ILogger<OwnedResourceAuthorizationHandler> _logger;
		private readonly ClaimExtractor _extractor;

		public OwnedResourceAuthorizationHandler(
			ILogger<OwnedResourceAuthorizationHandler> logger,
			IPermissionPolicyService permissionPolicyService,
			ClaimExtractor extractor)
		{
			this._logger = logger;
			this._permissionPolicyService = permissionPolicyService;
			this._extractor = extractor;
		}

		protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, OwnedResourceRequirement requirement, OwnedResource resource)
		{
			if (context.User == null || !context.User.Claims.Any())
			{
				this._logger.Trace("current user not set");
				return Task.CompletedTask;
			}
			if (resource.UserIds == null || !resource.UserIds.Any())
			{
				this._logger.Trace("resource users not set");
				return Task.CompletedTask;
			}

			Guid? subject = this._extractor.SubjectGuid(context.User);
			if (subject.HasValue && resource.UserIds.Any(x => x == subject.Value))
			{
				context.Succeed(requirement);
			}

			return Task.CompletedTask;
		}
	}
}
