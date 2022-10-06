using Cite.EvalIt.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Cite.Tools.Logging.Extensions;
using Microsoft.AspNetCore.Authorization;
using Cite.EvalIt.Web.Common;
using Cite.EvalIt.Query;
using Cite.Tools.FieldSet;
using Cite.Tools.Data.Censor;
using Cite.Tools.Data.Query;
using Cite.WebTools.CurrentPrincipal;
using Cite.Tools.Data.Builder;
using System.Security.Claims;
using Cite.EvalIt.Service.RankRecalculationTask;
using Cite.EvalIt.Audit;
using Cite.EvalIt.Web.Transaction;

namespace Cite.EvalIt.Web.Controllers
{
	[Route("api/app/rankrecalculationtask")]
	public class RankRecalculationTaskController : ControllerBase
	{
        private readonly CensorFactory _censorFactory;
        private readonly IQueryingService _queryingService;
        private readonly QueryFactory _queryFactory;
        private readonly BuilderFactory _builderFactory;
        private readonly ILogger<RankRecalculationTaskController> _logger;
        private readonly ICurrentPrincipalResolverService _currentPrincipalResolverService;
        private readonly IRankRecalculationTaskService _rankRecalculationTaskService;
        private readonly IAuditService _auditService;

        public RankRecalculationTaskController(
            CensorFactory censorFactory,
            IQueryingService queryingService,
            QueryFactory queryFactory,
            BuilderFactory builderFactory,
            ILogger<RankRecalculationTaskController> logger,
            ICurrentPrincipalResolverService currentPrincipalResolverService,
            IRankRecalculationTaskService rankRecalculationTaskService,
            IAuditService auditService)
        {
            this._censorFactory = censorFactory;
            this._queryingService = queryingService;
            this._queryFactory = queryFactory;
            this._logger = logger;
            this._builderFactory = builderFactory;
            this._currentPrincipalResolverService = currentPrincipalResolverService;
            this._rankRecalculationTaskService = rankRecalculationTaskService;
            this._auditService = auditService;
        }

        [HttpPost("query")]
        [Authorize]
        [ServiceFilter(typeof(QueueTransactionFilter))]
        public async Task<QueryResult<RankRecalculationTask>> Query([FromBody] RankRecalculationTaskLookup lookup, [ModelBinder(Name = "f")] IFieldSet fieldSet)
        {
            this._logger.Debug("querying");

            await this._censorFactory.Censor<RankRecalculationTaskCensor>().Censor(lookup?.Project);

            RankRecalculationTaskQuery query = lookup.Enrich(this._queryFactory).DisableTracking();
            List<RankRecalculationTask> models = await this._queryingService.CollectAsAsync(query, this._builderFactory.Builder<RankRecalculationTaskBuilder>(), lookup.Project);
            int count = (lookup.Metadata != null && lookup.Metadata.CountAll) ? await this._queryingService.CountAsync(query) : models.Count;

            return new QueryResult<RankRecalculationTask>(models, count);
        }

        [HttpPost("starttask")]
        [Authorize]
        [ServiceFilter(typeof(QueueTransactionFilter))]
        public async Task<RankRecalculationTask> AddReviewRankRecalculationTask([ModelBinder(Name = "f")] IFieldSet fieldSet)
        {
            this._logger.Debug("adding new rank recalculation task");

            ClaimsPrincipal principal = this._currentPrincipalResolverService.CurrentPrincipal();

            Guid userId = Guid.Parse(principal.Claims.Where(c => c.Type == "sub").Select(c => c.Value).FirstOrDefault());

            var task = await this._rankRecalculationTaskService.AddReviewRankRecalculationTask(userId, fieldSet);

            this._auditService.Track(AuditableAction.RankRecalculationTask_Start, "id", task.Id);
            this._auditService.TrackIdentity(AuditableAction.IdentityTracking_Action);

            return task;
        }

        [HttpPost("canceltask/{taskId}")]
        [Authorize]
        [ServiceFilter(typeof(QueueTransactionFilter))]
        public async Task<RankRecalculationTask> CancelReviewRankRecalculationTask(Guid taskId, [ModelBinder(Name = "f")] IFieldSet fieldSet)
        {
            this._logger.Debug("canceling rank recalculation task {id}", taskId);

            ClaimsPrincipal principal = this._currentPrincipalResolverService.CurrentPrincipal();

            Guid userId = Guid.Parse(principal.Claims.Where(c => c.Type == "sub").Select(c => c.Value).FirstOrDefault());

            this._auditService.Track(AuditableAction.RankRecalculationTask_Cancel, "id", taskId);
            this._auditService.TrackIdentity(AuditableAction.IdentityTracking_Action);

            return await this._rankRecalculationTaskService.CancelReviewRankRecalculationTask(taskId, userId, fieldSet);
        }
    }
}
