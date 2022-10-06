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
    public class DataObjectReviewFeedbackBuilder : Builder<DataObjectReviewFeedback, Data.DataObjectReviewFeedback>
    {
        public DataObjectReviewFeedbackBuilder(
            BuilderFactory builderFactory,
            IConventionService conventionService,
            IAuthorizationService authService,
            UserQuery userQuery,
            DataObjectReviewQuery dataObjectReviewQuery,
            ILogger<DataObjectReviewFeedbackBuilder> logger) : base(conventionService, logger)
        {
            _builderFactory = builderFactory;
            _authService = authService;
            _userQuery = userQuery;
            _dataObjectReviewQuery = dataObjectReviewQuery;
        }

        private readonly BuilderFactory _builderFactory;
        private readonly IAuthorizationService _authService;
        private readonly DataObjectReviewQuery _dataObjectReviewQuery;
        private readonly UserQuery _userQuery;

        public async override Task<List<DataObjectReviewFeedback>> Build(IFieldSet fields, IEnumerable<Data.DataObjectReviewFeedback> datas)
        {
            this._logger.Debug("building for {count} items requesting {fields} fields", datas?.Count(), fields?.Fields?.Count);
            this._logger.Trace(new DataLogEntry("requested fields", fields));
            if (fields == null || fields.IsEmpty()) return Enumerable.Empty<DataObjectReviewFeedback>().ToList();

            IFieldSet feedbackFields = fields.ExtractPrefixed(this.AsPrefix(nameof(FeedbackData)));

            IFieldSet userFields = fields.ExtractPrefixed(this.AsPrefix(nameof(User)));
            IFieldSet reviewFields = fields.ExtractPrefixed(this.AsPrefix(nameof(DataObjectReview)));

            Dictionary<Guid, Data.User> userMap = null;
            Dictionary<Guid, Data.DataObjectReview> reviewMap = null;

            if (!reviewFields.IsEmpty())
            {
                IEnumerable<Data.DataObjectReview> reviewData = await _dataObjectReviewQuery.IsActive(Common.IsActive.Active).Ids(datas.Where(x => x.DataObjectReviewId != null).Select(d => d.DataObjectReviewId.Value).Distinct()).Collect();

                reviewMap = reviewData.ToDictionary(t => t.Id, t => t);
            }

            if (!userFields.IsEmpty())
            {
                IEnumerable<Data.User> userData = await _userQuery.IsActive(Common.IsActive.Active).Ids(datas.Where(x => x.Anonymity == Common.ReviewAnonymity.Signed && x.UserId != null).Select(d => d.UserId.Value).Distinct()).Collect();

                userMap = userData.ToDictionary(t => t.Id, t => t);
            }

            List<DataObjectReviewFeedback> models = new List<DataObjectReviewFeedback>();
            foreach (Data.DataObjectReviewFeedback d in datas)
            {
                DataObjectReviewFeedback m = new DataObjectReviewFeedback();
                if (fields.HasField(this.AsIndexer(nameof(DataObjectReviewFeedback.Id)))) m.Id = d.Id;
                if (fields.HasField(this.AsIndexer(nameof(DataObjectReviewFeedback.Visibility)))) m.Visibility = d.Visibility;
                if (fields.HasField(this.AsIndexer(nameof(DataObjectReviewFeedback.Anonymity)))) m.Anonymity = d.Anonymity;
                if (fields.HasField(this.AsIndexer(nameof(DataObjectReviewFeedback.UserId)))) m.UserId = d.UserId;
                if (fields.HasField(this.AsIndexer(nameof(DataObjectReviewFeedback.UserIdHash)))) m.UserIdHash = d.UserIdHash;
                if (fields.HasField(this.AsIndexer(nameof(DataObjectReviewFeedback.DataObjectReviewId)))) m.DataObjectReviewId = d.DataObjectReviewId.GetValueOrDefault();
                if (fields.HasField(this.AsIndexer(nameof(DataObjectReviewFeedback.IsActive)))) m.IsActive = d.IsActive;
                if (fields.HasField(this.AsIndexer(nameof(DataObjectReviewFeedback.CreatedAt)))) m.CreatedAt = d.CreatedAt;
                if (fields.HasField(this.AsIndexer(nameof(DataObjectReviewFeedback.UpdatedAt)))) m.UpdatedAt = d.UpdatedAt;
                if (fields.HasField(this.AsIndexer(nameof(DataObjectReviewFeedback.Hash)))) m.Hash = this.HashValue(d.UpdatedAt);
                if (fields.HasField(this.AsIndexer(nameof(DataObjectReviewFeedback.CanEdit)))) m.CanEdit = await this._authService.CanEditOrOwner(d.UserId, d.UserIdHash, new List<string>() { Permission.EditDataObjectReview }, new List<string>() { "admin" });
                if (fields.HasField(this.AsIndexer(nameof(DataObjectReviewFeedback.IsMine)))) m.IsMine = await this._authService.CanEditOrOwner(d.UserId, d.UserIdHash, new List<string>() { Permission.EditDataObjectReview }, new List<string>() {});

                if (!feedbackFields.IsEmpty()) m.FeedbackData = await this._builderFactory.Builder<FeedbackDataBuilder>().Build(feedbackFields, d.FeedbackData);

                if (!reviewFields.IsEmpty() && d.DataObjectReviewId != null) m.DataObjectReview = await this._builderFactory.Builder<DataObjectReviewBuilder>().Build(reviewFields, reviewMap[d.DataObjectReviewId.Value]);

                if (!userFields.IsEmpty() && d.Anonymity == Common.ReviewAnonymity.Signed && d.UserId != null) m.User = await this._builderFactory.Builder<UserBuilder>().Build(userFields, userMap[d.UserId.Value]);

                models.Add(m);
            }
            this._logger.Debug("build {count} items", models?.Count);
            return models;
        }
    }
}
