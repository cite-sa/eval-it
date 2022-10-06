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
    public class DataObjectReviewBuilder : Builder<DataObjectReview, Data.DataObjectReview>
    {
        public DataObjectReviewBuilder(
            BuilderFactory builderFactory,
            IConventionService conventionService,
            IAuthorizationService authService,
            UserQuery userQuery,
            DataObjectQuery dataObjectQuery,
            ILogger<DataObjectReviewBuilder> logger) : base(conventionService, logger)
        {
            _builderFactory = builderFactory;
            _authService = authService;
            _userQuery = userQuery;
            _dataObjectQuery = dataObjectQuery;
        }

        private readonly BuilderFactory _builderFactory;
        private readonly IAuthorizationService _authService;
        private readonly DataObjectQuery _dataObjectQuery;
        private readonly UserQuery _userQuery;

        public async override Task<List<DataObjectReview>> Build(IFieldSet fields, IEnumerable<Data.DataObjectReview> datas)
        {
            this._logger.Debug("building for {count} items requesting {fields} fields", datas?.Count(), fields?.Fields?.Count);
            this._logger.Trace(new DataLogEntry("requested fields", fields));
            if (fields == null || fields.IsEmpty()) return Enumerable.Empty<DataObjectReview>().ToList();

            IFieldSet evaluationDataFields = fields.ExtractPrefixed(this.AsPrefix(nameof(ReviewEvaluation)));
            IFieldSet typeFields = fields.ExtractPrefixed(this.AsPrefix(nameof(DataObjectType)));
            IFieldSet feedbackFields = fields.ExtractPrefixed(this.AsPrefix(nameof(DataObjectReviewFeedback)));

            IFieldSet userFields = fields.ExtractPrefixed(this.AsPrefix(nameof(User)));
            IFieldSet objectFields = fields.ExtractPrefixed(this.AsPrefix(nameof(DataObject)));

            Dictionary<Guid, Data.User> userMap = null;
            Dictionary<Guid, Data.DataObject> objectMap = null;

            if (!objectFields.IsEmpty())
            {
                IEnumerable<Data.DataObject> objectData = await _dataObjectQuery.IsActive(Common.IsActive.Active).Ids(datas.Where(x => x.DataObjectId != null).Select(d => d.DataObjectId.Value).Distinct()).Collect();

                objectMap = objectData.ToDictionary(t => t.Id, t => t);
            }

            if (!userFields.IsEmpty())
            {
                IEnumerable<Data.User> userData = await _userQuery.IsActive(Common.IsActive.Active).Ids(datas.Where(x => x.Anonymity == Common.ReviewAnonymity.Signed && x.UserId != null).Select(d => d.UserId.Value).Distinct()).Collect();

                userMap = userData.ToDictionary(t => t.Id, t => t);
            }


            List<DataObjectReview> models = new List<DataObjectReview>();
            foreach (Data.DataObjectReview d in datas)
            {
                DataObjectReview m = new DataObjectReview();
                if (fields.HasField(this.AsIndexer(nameof(DataObjectReview.Id)))) m.Id = d.Id;
                if (fields.HasField(this.AsIndexer(nameof(DataObjectReview.Anonymity)))) m.Anonymity = d.Anonymity;
                if (fields.HasField(this.AsIndexer(nameof(DataObjectReview.Visibility)))) m.Visibility = d.Visibility;
                if (fields.HasField(this.AsIndexer(nameof(DataObjectReview.UserId)))) m.UserId = d.UserId;
                if (fields.HasField(this.AsIndexer(nameof(DataObjectReview.UserIdHash)))) m.UserIdHash = d.UserIdHash;
                if (fields.HasField(this.AsIndexer(nameof(DataObjectReview.DataObjectId)))) m.DataObjectId = d.DataObjectId;
                if (fields.HasField(this.AsIndexer(nameof(DataObjectReview.RankScore)))) m.RankScore = d.RankScore;
                if (fields.HasField(this.AsIndexer(nameof(DataObjectReview.IsActive)))) m.IsActive = d.IsActive;
                if (fields.HasField(this.AsIndexer(nameof(DataObjectReview.CreatedAt)))) m.CreatedAt = d.CreatedAt;
                if (fields.HasField(this.AsIndexer(nameof(DataObjectReview.UpdatedAt)))) m.UpdatedAt = d.UpdatedAt;
                if (fields.HasField(this.AsIndexer(nameof(DataObjectReview.Hash)))) m.Hash = this.HashValue(d.UpdatedAt);
                if (fields.HasField(this.AsIndexer(nameof(DataObjectReview.CanEdit)))) m.CanEdit = await this._authService.CanEditOrOwner(d.UserId, d.UserIdHash, new List<string>() { Permission.EditDataObjectReview }, new List<string>() { "admin" });
                if (fields.HasField(this.AsIndexer(nameof(DataObjectReview.IsMine)))) m.IsMine = await this._authService.CanEditOrOwner(d.UserId, d.UserIdHash, new List<string>() { Permission.EditDataObjectReview }, new List<string>() { });


                if (!typeFields.IsEmpty()) m.DataObjectType = await this._builderFactory.Builder<DataObjectTypeBuilder>().Build(typeFields, d.DataObjectType);

                if (!objectFields.IsEmpty() && d.DataObjectId != null) m.DataObject = await this._builderFactory.Builder<DataObjectBuilder>().Build(objectFields, objectMap[d.DataObjectId.Value]);

                if (!userFields.IsEmpty() && d.Anonymity == Common.ReviewAnonymity.Signed && d.UserId != null) m.User = await this._builderFactory.Builder<UserBuilder>().Build(userFields, userMap[d.UserId.Value]);

                if (!evaluationDataFields.IsEmpty())
                {
                    m.EvaluationData = new ReviewEvaluationData()
                    {
                        Evaluations = new List<ReviewEvaluation>()
                    };

                    foreach (var x in d.EvaluationData.Evaluations)
                    {
                        m.EvaluationData.Evaluations.Add(await this._builderFactory.Builder<ReviewEvaluationBuilder>().Build(evaluationDataFields, x));
                    }
                }

                if (!feedbackFields.IsEmpty()) m.Feedback = await this._builderFactory.Builder<DataObjectReviewFeedbackBuilder>().Build(feedbackFields, d.Feedback);
   

                models.Add(m);
            }
            this._logger.Debug("build {count} items", models?.Count);
            return models;
        }
    }
}
