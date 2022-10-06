using Cite.EvalIt.Common;
using Cite.Tools.FieldSet;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.User
{
	public interface IUserService
	{
		Task<Model.User> PersistAsync(Model.UserTouchedIntegrationEventPersist model, IFieldSet fields = null);
		Task DeleteAndSaveAsync(Guid id);
		Task<Model.User> SetTags(Guid userId, IEnumerable<Guid> tagIds, IFieldSet fields = null);
		Task<Model.User> UserNetworkAdd(Guid sourceUserId, UserWithRelationship userWithRelationship, IFieldSet fields = null);
		Task<Model.User> UserNetworkRemove(Guid sourceUserId, UserWithRelationship userWithRelationship, IFieldSet fields = null);
	}
}