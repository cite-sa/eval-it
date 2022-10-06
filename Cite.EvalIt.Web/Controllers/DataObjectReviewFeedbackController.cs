using Cite.EvalIt.Audit;
using Cite.EvalIt.Common;
using Cite.EvalIt.Model;
using Cite.EvalIt.Query;
using Cite.EvalIt.Service.DataObjectReview;
using Cite.EvalIt.Service.DataObjectReviewFeedback;
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
    [Route("api/app/dataobjectreviewfeedback")]
    public class DataObjectReviewFeedbackController : ControllerBase
    {
        private readonly CensorFactory _censorFactory;
        private readonly UserQuery _userQuery;
        private readonly DataObjectReviewFeedbackQuery _feedbackQuery;
        private readonly IDataObjectReviewFeedbackService _dataObjectReviewFeedbackService;
        private readonly BuilderFactory _builderFactory;
        private readonly ICurrentPrincipalResolverService _currentPrincipalResolverService;
        private readonly ILogger<TagController> _logger;
        private readonly IAuditService _auditService;

        public DataObjectReviewFeedbackController(
            CensorFactory censorFactory,
            UserQuery userQuery,
            DataObjectReviewFeedbackQuery feedbackQuery,
            IDataObjectReviewFeedbackService dataObjectReviewFeedbackService,
            BuilderFactory builderFactory,
            ILogger<TagController> logger,
            ICurrentPrincipalResolverService currentPrincipalResolverService,
            IAuditService auditService)
        {
            this._censorFactory = censorFactory;
            this._userQuery = userQuery;
            this._feedbackQuery = feedbackQuery;
            this._dataObjectReviewFeedbackService = dataObjectReviewFeedbackService;
            this._builderFactory = builderFactory;
            this._logger = logger;
            this._currentPrincipalResolverService = currentPrincipalResolverService;
            this._auditService = auditService;
        }

        [HttpPost("query")]
        [Authorize]
        public async Task<QueryResult<DataObjectReviewFeedback>> Query([FromBody] DataObjectReviewFeedbackLookup lookup)
        {
            this._logger.Debug("dataObjectReview query");

            await this._censorFactory.Censor<DataObjectReviewFeedbackCensor>().Censor(lookup?.Project);


            ClaimsPrincipal principal = this._currentPrincipalResolverService.CurrentPrincipal();

            Guid currentUserId = Guid.Parse(principal.Claims.Where(c => c.Type == "sub").Select(c => c.Value).FirstOrDefault());

            // Get ids of users in the current user's network
            var networkTask = this._userQuery.Ids(currentUserId).Collect();

            // Get userids of all trusted feedback authors
            this._feedbackQuery.ReviewAnonymityValues(ReviewAnonymity.Signed)
                               .ReviewVisibilityValues(ReviewVisibility.Trusted)
                               .IsActive(IsActive.Active)
                               .ReviewIds(lookup.ReviewIds);
            var feedbackTask = this._feedbackQuery.Collect();

            IEnumerable<Guid> networkUserIds = (await networkTask).SelectMany(u => u.UserNetworkIds, (u, ids) => ids.Id);
            IEnumerable<Guid> trustReviewUserIds = (await feedbackTask).Select(f => f.UserId.Value).Distinct();

            // Get the ids of users that have left a trusted review & trust the current user
            this._userQuery.Ids(trustReviewUserIds).IsActive(IsActive.Active);

            IEnumerable<Guid> trustingUserIds = (await this._userQuery.Collect()).Where(u => u.UserNetworkIds.Where(p => p.Relationship == UserNetworkRelationship.Trust && p.Id == currentUserId).Any()).Select(x => x.Id);
            trustingUserIds = trustingUserIds.Append(currentUserId);

            this._feedbackQuery.ReviewAnonymityValues(null)
                               .ReviewVisibilityValues(null)
                               .TrustingUserIds(trustingUserIds)
                               .PrivateUserIds(currentUserId)
                               .NetworkIds(networkUserIds)
                               .SetParameters(lookup);

            List<DataObjectReviewFeedback> models = await this._builderFactory.Builder<EvalIt.Model.DataObjectReviewFeedbackBuilder>().Build(lookup.Project, await this._feedbackQuery.Collect());

            int count = (lookup.Metadata != null && lookup.Metadata.CountAll) ? await this._feedbackQuery.CountAll() : models.Count;

            //this._auditService.Track(AuditableAction.DataObjectReview_Lookup, "lookup", lookup );
            //this._auditService.TrackIdentity(AuditableAction.IdentityTracking_Action);

            return new QueryResult<DataObjectReviewFeedback>(models, count);
        }

        [HttpPost("persist/{dataObjectId}/{dataObjectReviewId}")]
        [Authorize]
        [ValidationFilter(typeof(DataObjectReviewFeedbackPersist.DataObjectReviewFeedbackPersistValidator), "model")]
        [ServiceFilter(typeof(AppMongoTransactionFilter))]
        public async Task<DataObjectReviewFeedback> Persist(Guid dataObjectId, Guid dataObjectReviewId, [FromBody] DataObjectReviewFeedbackPersist model, [ModelBinder(Name = "f")] IFieldSet fieldSet)
        {
            this._logger.Debug("persisting feedback to data object review");

            ClaimsPrincipal principal = this._currentPrincipalResolverService.CurrentPrincipal();

            Guid userId = Guid.Parse(principal.Claims.Where(c => c.Type == "sub").Select(c => c.Value).FirstOrDefault());

            DataObjectReviewFeedback dataObjectReviewFeedback = await this._dataObjectReviewFeedbackService.PersistAsync(userId, dataObjectId, dataObjectReviewId, model, fieldSet);

            this._auditService.Track(AuditableAction.DataObjectReviewFeedback_Persist, new Dictionary<String, Object>{
              { "object_id", dataObjectId },
              { "review_id", dataObjectReviewId },
              { "feedback", model },
              { "fieldSet", fieldSet }
            });
            this._auditService.TrackIdentity(AuditableAction.IdentityTracking_Action);

            return dataObjectReviewFeedback;
        }

        [HttpPost("delete/{dataObjectId}/{dataObjectReviewId}")]
        [Authorize]
        [ServiceFilter(typeof(AppMongoTransactionFilter))]
        public async Task Delete(Guid dataObjectId, Guid dataObjectReviewId, [FromBody] DataObjectReviewFeedbackPersist feedback)
        {
            this._logger.Debug("deleting feedback from data object review");

            ClaimsPrincipal principal = this._currentPrincipalResolverService.CurrentPrincipal();

            Guid userId = Guid.Parse(principal.Claims.Where(c => c.Type == "sub").Select(c => c.Value).FirstOrDefault());

            await this._dataObjectReviewFeedbackService.DeleteAndSaveAsync(userId, dataObjectId, dataObjectReviewId, feedback.Id.Value);

            this._auditService.Track(AuditableAction.DataObjectReviewFeedback_Delete, new Dictionary<String, Object>{
              { "object_id", dataObjectId },
              { "review_id", dataObjectReviewId },
              { "feedback_id", feedback.Id }
            });
            this._auditService.TrackIdentity(AuditableAction.IdentityTracking_Action);
        }
    }
}
