using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Cite.EvalIt.Authorization
{
	public interface IAuthorizationService
	{
		Task<Boolean> CanEditOrOwner(Guid? id, string hash, IEnumerable<string> permissions, IEnumerable<string> authorizedRoles);
		Task<Boolean> HasPermissionAndNotRestricted(Guid[] restrictedIds, string[] restrictedHashes, IEnumerable<string> permissions);
		Task<Boolean> AuthorizeOrOwner(OwnedResource resource, params String[] permissions);
		Task<Boolean> AuthorizeOrOwnerForce(OwnedResource resource, params String[] permissions);
		Task<Boolean> Authorize(params String[] permissions);
		Task<Boolean> AuthorizeForce(params String[] permissions);
		Task<Boolean> Authorize(Object resource, params String[] permissions);
		Task<Boolean> AuthorizeForce(Object resource, params String[] permissions);
		Task<Boolean> AuthorizeOwner(OwnedResource resource);
		Task<Boolean> AuthorizeOwnerForce(OwnedResource resource);
	}
}
