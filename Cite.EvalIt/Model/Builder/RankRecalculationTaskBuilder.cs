using Cite.EvalIt.Authorization;
using Cite.EvalIt.Convention;
using Cite.EvalIt.Query;
using Cite.Tools.Data.Builder;
using Cite.Tools.Data.Query;
using Cite.Tools.FieldSet;
using Cite.Tools.Logging;
using Cite.Tools.Logging.Extensions;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Cite.EvalIt.Model
{
    public class RankRecalculationTaskBuilder : Builder<RankRecalculationTask, Data.RankRecalculationTask>
    {
        public RankRecalculationTaskBuilder(
            BuilderFactory builderFactory,
            IConventionService conventionService,
            UserQuery userQuery,
            ILogger<RankRecalculationTaskBuilder> logger) : base(conventionService, logger)
        {
            _builderFactory = builderFactory;
            _userQuery = userQuery;
        }

        private readonly BuilderFactory _builderFactory;
        private readonly UserQuery _userQuery;

        public override async Task<List<RankRecalculationTask>> Build(IFieldSet fields, IEnumerable<Data.RankRecalculationTask> datas)
        {
            this._logger.Debug("building for {count} items requesting {fields} fields", datas?.Count(), fields?.Fields?.Count);
            this._logger.Trace(new DataLogEntry("requested fields", fields));
            if (fields == null || fields.IsEmpty()) return Enumerable.Empty<RankRecalculationTask>().ToList();

            IFieldSet userFields = fields.ExtractPrefixed(this.AsPrefix(nameof(User)));

            Dictionary<Guid, Data.User> userMap = null;

            if (!userFields.IsEmpty())
            {
                IEnumerable<Data.User> userData = await _userQuery.IsActive(Common.IsActive.Active).Ids(datas.Select(d => d.RequestingUserId).Distinct()).Collect();

                userMap = userData.ToDictionary(t => t.Id, t => t);
            }

            List<RankRecalculationTask> models = new List<RankRecalculationTask>();
            foreach (Data.RankRecalculationTask d in datas)
            {
                RankRecalculationTask m = new RankRecalculationTask();
                if (fields.HasField(this.AsIndexer(nameof(RankRecalculationTask.Id)))) m.Id = d.Id;
                if (fields.HasField(this.AsIndexer(nameof(RankRecalculationTask.ReviewRankingsToCalculate)))) m.ReviewRankingsToCalculate = d.ReviewRankingsToCalculate;
                if (fields.HasField(this.AsIndexer(nameof(RankRecalculationTask.SuccessfulReviewRankings)))) m.SuccessfulReviewRankings = d.SuccessfulReviewRankings;
                if (fields.HasField(this.AsIndexer(nameof(RankRecalculationTask.FailedReviewRankings)))) m.FailedReviewRankings = d.FailedReviewRankings;
                if (fields.HasField(this.AsIndexer(nameof(RankRecalculationTask.ObjectRankingsToCalculate)))) m.ObjectRankingsToCalculate = d.ObjectRankingsToCalculate;
                if (fields.HasField(this.AsIndexer(nameof(RankRecalculationTask.SuccessfulObjectRankings)))) m.SuccessfulObjectRankings = d.SuccessfulObjectRankings;
                if (fields.HasField(this.AsIndexer(nameof(RankRecalculationTask.FailedObjectRankings)))) m.FailedObjectRankings = d.FailedObjectRankings;
                if (fields.HasField(this.AsIndexer(nameof(RankRecalculationTask.RequestingUserId)))) m.RequestingUserId = d.RequestingUserId;
                if (fields.HasField(this.AsIndexer(nameof(RankRecalculationTask.IsActive)))) m.IsActive = d.IsActive;
                if (fields.HasField(this.AsIndexer(nameof(RankRecalculationTask.TaskStatus)))) m.TaskStatus = d.TaskStatus;
                if (fields.HasField(this.AsIndexer(nameof(RankRecalculationTask.CreatedAt)))) m.CreatedAt = d.CreatedAt;
                if (fields.HasField(this.AsIndexer(nameof(RankRecalculationTask.UpdatedAt)))) m.UpdatedAt = d.UpdatedAt;
                if (fields.HasField(this.AsIndexer(nameof(RankRecalculationTask.FinishedAt)))) m.FinishedAt = d.FinishedAt;
                if (fields.HasField(this.AsIndexer(nameof(RankRecalculationTask.Hash)))) m.Hash = this.HashValue(d.UpdatedAt);

                if (!userFields.IsEmpty()) m.User = await this._builderFactory.Builder<UserBuilder>().Build(userFields, userMap[d.RequestingUserId]);

                models.Add(m);
            }
            this._logger.Debug("build {count} items", models?.Count);
            return models;
        }
    }
}
