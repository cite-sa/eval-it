using Cite.EvalIt.Audit;
using Cite.EvalIt.Common;
using Cite.EvalIt.Model;
using Cite.EvalIt.Query;
using Cite.EvalIt.Service.DataObjectReview;
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
    [Route("api/app/dataobjectreview")]
    public class DataObjectReviewController : ControllerBase
    {
        private readonly CensorFactory _censorFactory;
        private readonly UserQuery _userQuery;
        private readonly DataObjectReviewQuery _reviewQuery;
        private readonly DataObjectReviewFeedbackQuery _feedbackQuery;
        private readonly IDataObjectReviewService _dataObjectReviewService;
        private readonly BuilderFactory _builderFactory;
        private readonly ICurrentPrincipalResolverService _currentPrincipalResolverService;
        private readonly ILogger<TagController> _logger;
        private readonly IAuditService _auditService;

        public DataObjectReviewController(
            CensorFactory censorFactory,
            UserQuery userQuery,
            DataObjectReviewQuery reviewQuery,
            DataObjectReviewFeedbackQuery feedbackQuery,
            IDataObjectReviewService dataObjectReviewService,
            BuilderFactory builderFactory,
            ILogger<TagController> logger,
            ICurrentPrincipalResolverService currentPrincipalResolverService,
            IAuditService auditService)
        {
            this._censorFactory = censorFactory;
            this._userQuery = userQuery;
            this._reviewQuery = reviewQuery;
            this._feedbackQuery = feedbackQuery;
            this._dataObjectReviewService = dataObjectReviewService;
            this._builderFactory = builderFactory;
            this._logger = logger;
            this._currentPrincipalResolverService = currentPrincipalResolverService;
            this._auditService = auditService;
        }

        [HttpPost("query")]
        [Authorize]
        public async Task<QueryResult<DataObjectReview>> Query([FromBody] DataObjectReviewLookup lookup)
        {
            this._logger.Debug("dataObjectReview query");

            await this._censorFactory.Censor<DataObjectReviewCensor>().Censor(lookup?.Project);


            ClaimsPrincipal principal = this._currentPrincipalResolverService.CurrentPrincipal();

            Guid currentUserId = Guid.Parse(principal.Claims.Where(c => c.Type == "sub").Select(c => c.Value).FirstOrDefault());

            // Get userids of all trusted review authors
            this._reviewQuery.ReviewAnonymityValues(ReviewAnonymity.Signed)
                             .ReviewVisibilityValues(ReviewVisibility.Trusted)
                             .IsActive(IsActive.Active)
                             .ObjectIds(lookup.ObjectIds);
            var reviewTask = this._reviewQuery.Collect();

            // Also get userids of all trusted feedback authors
            this._feedbackQuery.ReviewAnonymityValues(ReviewAnonymity.Signed)
                               .ReviewVisibilityValues(ReviewVisibility.Trusted)
                               .IsActive(IsActive.Active)
                               .ObjectIds(lookup.ObjectIds);
            var feedbackTask = this._feedbackQuery.Collect();

            IEnumerable<Guid> trustReviewUserIds = (await reviewTask).Select(r => r.UserId.Value).Distinct();
            trustReviewUserIds = trustReviewUserIds.Union((await feedbackTask).Select(r => r.UserId.Value).Distinct());

            // Get the ids of users that have left a trusted review or feedback & trust the current user
            this._userQuery.Ids(trustReviewUserIds).IsActive(IsActive.Active);

            var tmp = await this._userQuery.Collect();
            IEnumerable<Guid> trustingUserIds = (tmp).Where(u => u.UserNetworkIds.Where(p => p.Relationship == UserNetworkRelationship.Trust && p.Id == currentUserId).Any()).Select(x => x.Id);
            trustingUserIds = trustingUserIds.Append(currentUserId);

            // Get ids of users in the current user's network
            IEnumerable<Guid> networkUserIds = (await this._userQuery.Ids(currentUserId).Collect()).SelectMany(u => u.UserNetworkIds, (u, ids) => ids.Id);

            this._reviewQuery.ReviewAnonymityValues(null)
                             .ReviewVisibilityValues(null)
                             .TrustingUserIds(trustingUserIds)
                             .PrivateUserIds(currentUserId)
                             .NetworkIds(networkUserIds)
                             .SetParameters(lookup);

            List<DataObjectReview> models = await this._builderFactory.Builder<EvalIt.Model.DataObjectReviewBuilder>().Build(lookup.Project, await this._reviewQuery.Collect());

            int count = (lookup.Metadata != null && lookup.Metadata.CountAll) ? await this._reviewQuery.CountAll() : models.Count;

            //this._auditService.Track(AuditableAction.DataObjectReview_Lookup, "lookup", lookup );
            //this._auditService.TrackIdentity(AuditableAction.IdentityTracking_Action);

            return new QueryResult<DataObjectReview>(models, count);
        }

        [HttpPost("persist/{dataObjectId}")]
        [Authorize]
        [ValidationFilter(typeof(DataObjectReviewPersist.DataObjectReviewPersistValidator), "model")]
        [ServiceFilter(typeof(AppMongoTransactionFilter))]
        public async Task<DataObjectReview> PersistReview(Guid dataObjectId, [FromBody] DataObjectReviewPersist model, [ModelBinder(Name = "f")] IFieldSet fieldSet)
        {
            this._logger.Debug("persisting review to data object");

            ClaimsPrincipal principal = this._currentPrincipalResolverService.CurrentPrincipal();

            Guid userId = Guid.Parse(principal.Claims.Where(c => c.Type == "sub").Select(c => c.Value).FirstOrDefault());

            DataObjectReview dataObjectReview = await this._dataObjectReviewService.PersistAsync(userId, dataObjectId, model, fieldSet);

            this._auditService.Track(AuditableAction.DataObjectReview_Persist, new Dictionary<String, Object>{
              { "object_id", dataObjectId },
              { "review", model },
              { "fieldSet", fieldSet }
            });
            this._auditService.TrackIdentity(AuditableAction.IdentityTracking_Action);

            return dataObjectReview;
        }

        [HttpPost("delete/{dataObjectId}")]
        [Authorize]
        [ServiceFilter(typeof(AppMongoTransactionFilter))]
        public async Task Delete(Guid dataObjectId, [FromBody] DataObjectReviewPersist review)
        {
            this._logger.Debug("deleting review from data object");

            ClaimsPrincipal principal = this._currentPrincipalResolverService.CurrentPrincipal();

            Guid userId = Guid.Parse(principal.Claims.Where(c => c.Type == "sub").Select(c => c.Value).FirstOrDefault());

            await this._dataObjectReviewService.DeleteAndSaveAsync(userId, dataObjectId, review.Id.Value);

            this._auditService.Track(AuditableAction.DataObjectReview_Delete, new Dictionary<String, Object>{
              { "object_id", dataObjectId },
              { "review_id", review.Id }
            });
            this._auditService.TrackIdentity(AuditableAction.IdentityTracking_Action);
        }
    }
}
