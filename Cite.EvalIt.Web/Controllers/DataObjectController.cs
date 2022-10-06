using Cite.EvalIt.Audit;
using Cite.EvalIt.Common;
using Cite.EvalIt.Model;
using Cite.EvalIt.Query;
using Cite.EvalIt.Service.DataObject;
using Cite.EvalIt.Web.Common;
using Cite.EvalIt.Web.Transaction;
using Cite.Tools.Data.Builder;
using Cite.Tools.Data.Censor;
using Cite.Tools.FieldSet;
using Cite.Tools.Logging.Extensions;
using Cite.WebTools.CurrentPrincipal;
using Cite.WebTools.Validation;
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
    [Route("api/app/dataobject")]
    public class DataObjectController : ControllerBase
    {
        private readonly CensorFactory _censorFactory;
        private readonly UserQuery _userQuery;
        private readonly DataObjectQuery _objectQuery;
        private readonly DataObjectReviewQuery _reviewQuery;
        private readonly DataObjectReviewFeedbackQuery _feedbackQuery;
        private readonly IDataObjectService _dataObjectService;
        private readonly BuilderFactory _builderFactory;
        private readonly ICurrentPrincipalResolverService _currentPrincipalResolverService;
        private readonly ILogger<TagController> _logger;
        private readonly IAuditService _auditService;

        public DataObjectController(
            CensorFactory censorFactory,
            UserQuery userQuery,
            DataObjectQuery objectQuery,
            DataObjectReviewQuery reviewQuery,
            DataObjectReviewFeedbackQuery feedbackQuery,
            IDataObjectService dataObjectService,
            BuilderFactory builderFactory,
            ILogger<TagController> logger,
            ICurrentPrincipalResolverService currentPrincipalResolverService,
            IAuditService auditService)
        {
            this._censorFactory = censorFactory;
            this._userQuery = userQuery;
            this._objectQuery = objectQuery;
            this._reviewQuery = reviewQuery;
            this._feedbackQuery = feedbackQuery;
            this._dataObjectService = dataObjectService;
            this._builderFactory = builderFactory;
            this._logger = logger;
            this._currentPrincipalResolverService = currentPrincipalResolverService;
            this._auditService = auditService;
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<DataObject> Get([FromRoute] Guid id, [ModelBinder(Name = "f")] IFieldSet fieldSet)
        {
            this._logger.Debug("get data object by id");

            await this._censorFactory.Censor<DataObjectCensor>().Censor(fieldSet);

            ClaimsPrincipal principal = this._currentPrincipalResolverService.CurrentPrincipal();

            Guid currentUserId = Guid.Parse(principal.Claims.Where(c => c.Type == "sub").Select(c => c.Value).FirstOrDefault());

            // Get userids of all trusted review authors
            this._reviewQuery.ReviewAnonymityValues(ReviewAnonymity.Signed)
                             .ReviewVisibilityValues(ReviewVisibility.Trusted)
                             .IsActive(IsActive.Active)
                             .ObjectIds(id);
            var reviewTask = this._reviewQuery.Collect();


            // Also get userids of all trusted feedback authors
            this._feedbackQuery.ReviewAnonymityValues(ReviewAnonymity.Signed)
                               .ReviewVisibilityValues(ReviewVisibility.Trusted)
                               .IsActive(IsActive.Active)
                               .ObjectIds(id);
            var feedbackTask = this._feedbackQuery.Collect();

            IEnumerable<Guid> trustReviewUserIds = (await reviewTask).Select(r => r.UserId.Value).Distinct();
            trustReviewUserIds = trustReviewUserIds.Union((await feedbackTask).Select(r => r.UserId.Value).Distinct());

            // Get the ids of users that have left a trusted review or feedback & trust the current user
            this._userQuery.Ids(trustReviewUserIds).IsActive(IsActive.Active);

            IEnumerable<Guid> trustingUserIds = (await this._userQuery.Collect()).Where(u => u.UserNetworkIds.Where(p => p.Relationship == UserNetworkRelationship.Trust && p.Id == currentUserId).Any()).Select(x => x.Id);
            trustingUserIds = trustingUserIds.Append(currentUserId);

            this._objectQuery.TrustingUserIds(trustingUserIds)
                             .PrivateUserIds(currentUserId)
                             .IsActive(IsActive.Active)
                             .Ids(id)
                             .Pagination(new Tools.Data.Query.Paging() { Size = 1, Offset = 0 });

            List<DataObject> model = await this._builderFactory.Builder<EvalIt.Model.DataObjectBuilder>().Build(fieldSet, await this._objectQuery.Collect());

            return model?.FirstOrDefault();
        }

        [HttpPost("query")]
        [Authorize]
        public async Task<QueryResult<DataObject>> Query([FromBody] DataObjectLookup lookup)
        {
            this._logger.Debug("dataObject query");

            await this._censorFactory.Censor<DataObjectCensor>().Censor(lookup?.Project);

            ClaimsPrincipal principal = this._currentPrincipalResolverService.CurrentPrincipal();

            Guid currentUserId = Guid.Parse(principal.Claims.Where(c => c.Type == "sub").Select(c => c.Value).FirstOrDefault());

            // Get userids of all trusted review authors
            this._reviewQuery.ReviewAnonymityValues(ReviewAnonymity.Signed)
                             .ReviewVisibilityValues(ReviewVisibility.Trusted)
                             .IsActive(IsActive.Active)
                             .ObjectIds(lookup?.Ids);
            var reviewTask = this._reviewQuery.Collect();

            // Also get userids of all trusted feedback authors
            this._feedbackQuery.ReviewAnonymityValues(ReviewAnonymity.Signed)
                               .ReviewVisibilityValues(ReviewVisibility.Trusted)
                               .IsActive(IsActive.Active)
                               .ObjectIds(lookup?.Ids);
            var feedbackTask = this._feedbackQuery.Collect();

            IEnumerable<Guid> trustReviewUserIds = (await reviewTask).Select(r => r.UserId.Value).Distinct();
            trustReviewUserIds = trustReviewUserIds.Union((await feedbackTask).Select(r => r.UserId.Value).Distinct());

            // Get the ids of users that have left a trusted review or feedback & trust the current user
            this._userQuery.Ids(trustReviewUserIds).IsActive(IsActive.Active);

            IEnumerable<Guid> trustingUserIds = (await this._userQuery.Collect()).Where(u => u.UserNetworkIds.Where(p => p.Relationship == UserNetworkRelationship.Trust && p.Id == currentUserId).Any()).Select(x => x.Id);
            trustingUserIds = trustingUserIds.Append(currentUserId);

            this._objectQuery.TrustingUserIds(trustingUserIds)
                             .PrivateUserIds(currentUserId)
                             .SetParameters(lookup);

            List<DataObject> models = await this._builderFactory.Builder<EvalIt.Model.DataObjectBuilder>().Build(lookup?.Project, await this._objectQuery.Collect());

            int count = (lookup.Metadata != null && lookup.Metadata.CountAll) ? await this._objectQuery.CountAll() : models.Count;

            //this._auditService.Track(AuditableAction.DataObjectReview_Lookup, "lookup", lookup );
            //this._auditService.TrackIdentity(AuditableAction.IdentityTracking_Action);

            return new QueryResult<DataObject>(models, count);
        }

        [HttpPost("persist")]
        [Authorize]
        [ValidationFilter(typeof(DataObjectPersist.DataObjectPersistValidator),"model")]
        [ServiceFilter(typeof(AppMongoTransactionFilter))]
        public async Task<DataObject> Persist([FromBody] DataObjectPersist model, [FromQuery] IFieldSet fieldSet)
        {
            this._logger.Debug("persisting data object");

            DataObject persisted = await this._dataObjectService.PersistAsync(model, fieldSet);

            this._auditService.Track(AuditableAction.DataObject_Persist, new Dictionary<String, Object>{
              { "model", model },
              { "fieldSet", fieldSet }
            });
            this._auditService.TrackIdentity(AuditableAction.IdentityTracking_Action);

            return persisted;
        }

        [HttpDelete("{id}")]
        [Authorize]
        [ServiceFilter(typeof(AppMongoTransactionFilter))]
        public async Task Delete([FromRoute] Guid id)
        {
            this._logger.Debug("deleting data object {id}", id);

            await this._dataObjectService.DeleteAndSaveAsync(id);

            this._auditService.Track(AuditableAction.DataObject_Delete, "id", id);
            this._auditService.TrackIdentity(AuditableAction.IdentityTracking_Action);
        }

        [HttpPost("settags/{dataObjectId}")]
        [Authorize]
        [ServiceFilter(typeof(AppMongoTransactionFilter))]
        public async Task<DataObject> SetTags(Guid dataObjectId, [FromBody] TagSetPersist model, [ModelBinder(Name = "f")] IFieldSet fieldSet)
        {
            this._logger.Debug("setting tags to data object");

            DataObject dataObject = await this._dataObjectService.SetTags(dataObjectId, model.TagIds, fieldSet);

            this._auditService.Track(AuditableAction.DataObject_TagsSet, new Dictionary<String, Object>{
              { "object_id", dataObjectId },
              { "tag_ids", model.TagIds },
              { "fieldSet", fieldSet }
            });
            this._auditService.TrackIdentity(AuditableAction.IdentityTracking_Action);

            return dataObject;
        }
    }
}
