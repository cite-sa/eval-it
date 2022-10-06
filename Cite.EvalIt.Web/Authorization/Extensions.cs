using Cite.EvalIt.Authorization;
using Cite.Tools.Configuration.Extensions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Cite.EvalIt.Web.Authorization.Extensions
{
	public static class Extensions
	{
		public static IServiceCollection AddPermissionsAndPolicies(this IServiceCollection services, IConfigurationSection permissionsConfigurationSection)
		{
			services.ConfigurePOCO<PermissionPolicyConfig>(permissionsConfigurationSection);
			//GOTCHA: this can be singleton because it reads the permissions from config
			services.AddSingleton<IPermissionPolicyService, PermissionPolicyService>();
			services.AddScoped<EvalIt.Authorization.IAuthorizationService, EvalIt.Web.Authorization.AuthorizationService>();
			services.AddSingleton<Microsoft.AspNetCore.Authorization.IAuthorizationHandler, PermissionRoleAuthorizationHandler>();
			services.AddSingleton<Microsoft.AspNetCore.Authorization.IAuthorizationHandler, PermissionClaimAuthorizationHandler>();
			services.AddSingleton<Microsoft.AspNetCore.Authorization.IAuthorizationHandler, PermissionClientAuthorizationHandler>();
			services.AddSingleton<Microsoft.AspNetCore.Authorization.IAuthorizationHandler, OwnedResourceAuthorizationHandler>();
			services.AddSingleton<Microsoft.AspNetCore.Authorization.IAuthorizationHandler, PermissionAnonymousAuthorizationHandler>();
			services.AddSingleton<Microsoft.AspNetCore.Authorization.IAuthorizationHandler, PermissionAuthenticatedAuthorizationHandler>();

			return services;
		}
	}
}
