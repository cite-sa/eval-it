using Cite.EvalIt.Audit;
using Cite.EvalIt.Common;
using Cite.EvalIt.Model;
using Cite.EvalIt.Query;
using Cite.EvalIt.Service.User;
using Cite.EvalIt.Web.Common;
using Cite.EvalIt.Web.Transaction;
using Cite.Tools.Common.Extensions;
using Cite.Tools.Data.Builder;
using Cite.Tools.Data.Censor;
using Cite.Tools.FieldSet;
using Cite.Tools.Logging.Extensions;
using Cite.WebTools.CurrentPrincipal;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Cite.EvalIt.Web.Controllers
{
	[Route("api/app/user")]
	public class UserController : ControllerBase
	{
        private readonly CensorFactory _censorFactory;
        private readonly UserQuery _query;
        private readonly IUserService _userService;
        private readonly BuilderFactory _builderFactory;
		private readonly ICurrentPrincipalResolverService _currentPrincipalResolverService;
		private readonly ILogger<TagController> _logger;
		private readonly IAuditService _auditService;

        public UserController(
            CensorFactory censorFactory,
            UserQuery query,
            IUserService userService,
            BuilderFactory builderFactory,
			ILogger<TagController> logger,
			ICurrentPrincipalResolverService currentPrincipalResolverService,
			IAuditService auditService)
		{
            this._censorFactory = censorFactory;
            this._query = query;
            this._userService = userService;
            this._builderFactory = builderFactory;
			this._logger = logger;
			this._currentPrincipalResolverService = currentPrincipalResolverService;
			this._auditService = auditService;
		}

        [HttpGet("{id}")]
        [Authorize]
        public async Task<User> Get([FromRoute] Guid id, [ModelBinder(Name = "f")] IFieldSet fieldSet)
        {
            this._logger.Debug("get user by id");

            await this._censorFactory.Censor<UserCensor>().Censor(fieldSet);

            List<User> model = await this._builderFactory.Builder<UserBuilder>().Build(fieldSet, await this._query
                                                                                                           .Ids(id)
                                                                                                           .IsActive(IsActive.Active)
                                                                                                           .Pagination(new Tools.Data.Query.Paging() { Size = 1, Offset = 0 })
                                                                                                           .Collect()
                                                                                                           );

            //this._auditService.Track(AuditableAction.User_Lookup, new Dictionary<String, Object>{
            //  { "id", id },
            //  { "fieldSet", fieldSet }
            //}); this._auditService.TrackIdentity(AuditableAction.IdentityTracking_Action);

            return model?.FirstOrDefault();
        }

        [HttpPost("query")]
        [Authorize]
        public async Task<QueryResult<User>> Query([FromBody] UserLookup lookup)
        {
            this._logger.Debug("tag query");

            await this._censorFactory.Censor<UserCensor>().Censor(lookup?.Project);

            this._query.SetParameters(lookup);
            List<User> models = await this._builderFactory.Builder<EvalIt.Model.UserBuilder>().Build(lookup.Project, await this._query.Collect());

            int count = (lookup.Metadata != null && lookup.Metadata.CountAll) ? await this._query.CountAll() : models.Count;

            //this._auditService.Track(AuditableAction.User_Lookup, "lookup", lookup);
            //this._auditService.TrackIdentity(AuditableAction.IdentityTracking_Action);

            return new QueryResult<User>(models, count);
        }

        [HttpPost("settags/{userId}")]
        [Authorize]
        [ServiceFilter(typeof(AppMongoTransactionFilter))]
        public async Task<User> SetTags(Guid userId, [FromBody] TagSetPersist model, [ModelBinder(Name = "f")] IFieldSet fieldSet)
        {
            this._logger.Debug("assigning tag to user");

            User user = await this._userService.SetTags(userId, model.TagIds, fieldSet);

            this._auditService.Track(AuditableAction.User_TagsSet, new Dictionary<String, Object>{
              { "user_id", userId },
              { "tag_ids", model.TagIds },
              { "fieldSet", fieldSet }
            });
            this._auditService.TrackIdentity(AuditableAction.IdentityTracking_Action);

            return user;
        }

        [HttpPost("usernetworkadd/{sourceUserId}")]
        [Authorize]
        [ServiceFilter(typeof(AppMongoTransactionFilter))]
        public async Task<User> AddToUserNetwork(Guid sourceUserId, [FromBody] UserWithRelationship userWithRelationship, [ModelBinder(Name = "f")] IFieldSet fieldSet)
        {
            this._logger.Debug("adding target user to user's network");

            User user = await this._userService.UserNetworkAdd(sourceUserId, userWithRelationship, fieldSet);

            this._auditService.Track(AuditableAction.User_NetworkAdd, new Dictionary<String, Object>{
              { "user_id", sourceUserId },
              { "user_and_relationship", userWithRelationship },
              { "fieldSet", fieldSet }
            });
            this._auditService.TrackIdentity(AuditableAction.IdentityTracking_Action);

            return user;
        }

        [HttpPost("usernetworkremove/{sourceUserId}")]
        [Authorize]
        [ServiceFilter(typeof(AppMongoTransactionFilter))]
        public async Task<User> RemoveFromUserNetwork(Guid sourceUserId, [FromBody] UserWithRelationship userWithRelationship, [ModelBinder(Name = "f")] IFieldSet fieldSet)
        {
            this._logger.Debug("removing target user from user's network");

            User user = await this._userService.UserNetworkRemove(sourceUserId, userWithRelationship, fieldSet);

            this._auditService.Track(AuditableAction.User_NetworkRemove, new Dictionary<String, Object>{
              { "user_id", sourceUserId },
              { "user_and_relationship", userWithRelationship },
              { "fieldSet", fieldSet }
            }); 
            this._auditService.TrackIdentity(AuditableAction.IdentityTracking_Action);

            return user;
        }

        [HttpGet("my-network")]
        [Authorize]
        public async Task<QueryResult<UserWithRelationshipModel>> MyNetwork([ModelBinder(Name = "f")] IFieldSet fieldSet)
        {
            this._logger.Debug("get current user's network");

            ClaimsPrincipal principal = this._currentPrincipalResolverService.CurrentPrincipal();

            Guid userId = Guid.Parse(principal.Claims.Where(c => c.Type == "sub").Select(c => c.Value).FirstOrDefault());

            List<User> models = await this._builderFactory.Builder<EvalIt.Model.UserBuilder>().Build(fieldSet, await this._query
                                                                                                                         .IsActive(IsActive.Active)
                                                                                                                         .Ids(userId)
                                                                                                                         .Collect());
            var network = models.FirstOrDefault();
            var result = network?.UserNetworkIds?.ToList() ?? new List<UserWithRelationshipModel>();

            //this._auditService.Track(AuditableAction.User_MyNetworkGet, "fieldSet", fieldSet );
            //this._auditService.TrackIdentity(AuditableAction.IdentityTracking_Action);


            return new QueryResult<UserWithRelationshipModel>(result, result.Count);
        }

        [HttpPost("my-network-add")]
        [Authorize]
        [ServiceFilter(typeof(AppMongoTransactionFilter))]
        public async Task<User> AddToMyNetwork([FromBody] UserWithRelationship userWithRelationship, [ModelBinder(Name = "f")] IFieldSet fieldSet)
        {
            this._logger.Debug("adding target user to current user's network");

            ClaimsPrincipal principal = this._currentPrincipalResolverService.CurrentPrincipal();

            Guid userId = Guid.Parse(principal.Claims.Where(c => c.Type == "sub").Select(c => c.Value).FirstOrDefault());

            User user = await this._userService.UserNetworkAdd(userId, userWithRelationship, fieldSet);

            this._auditService.Track(AuditableAction.User_MyNetworkAdd, new Dictionary<String, Object>{
              { "user_and_relationship", userWithRelationship },
              { "fieldSet", fieldSet }
            }); 
            this._auditService.TrackIdentity(AuditableAction.IdentityTracking_Action);

            return user;
        }

        [HttpPost("my-network-remove")]
        [Authorize]
        [ServiceFilter(typeof(AppMongoTransactionFilter))]
        public async Task<User> RemoveFromMyNetwork([FromBody] UserWithRelationship userWithRelationship, [ModelBinder(Name = "f")] IFieldSet fieldSet)
        {
            this._logger.Debug("removing target user from current user's network");

            ClaimsPrincipal principal = this._currentPrincipalResolverService.CurrentPrincipal();

            Guid userId = Guid.Parse(principal.Claims.Where(c => c.Type == "sub").Select(c => c.Value).FirstOrDefault());

            User user = await this._userService.UserNetworkRemove(userId, userWithRelationship, fieldSet);

            this._auditService.Track(AuditableAction.User_MyNetworkRemove, new Dictionary<String, Object>{
              { "user_and_relationship", userWithRelationship },
              { "fieldSet", fieldSet }
            });
            this._auditService.TrackIdentity(AuditableAction.IdentityTracking_Action);

            return user;
        }
    }
}
