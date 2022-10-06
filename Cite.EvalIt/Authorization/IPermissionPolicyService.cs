using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.Authorization
{
	public interface IPermissionPolicyService
	{
		ISet<String> PermissionsOfRoles(IEnumerable<String> roles);
		ISet<String> PermissionsOfClaims(String claim, IEnumerable<String> values);
		ISet<String> RolesHaving(String permission);
		ISet<String> ClaimsHaving(String claim, String permission);
		ISet<String> ClientsHaving(String permission);
		Boolean AllowAnonymous(String permission);
		Boolean AllowAuthenticated(String permission);
	}
}
