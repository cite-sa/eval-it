using Cite.EvalIt.Common;
using Cite.EvalIt.Data;
using Cite.EvalIt.Data.Context;
using Cite.Tools.Common.Extensions;
using Cite.Tools.Data.Query;
using Cite.Tools.Logging;
using Microsoft.EntityFrameworkCore;
using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Cite.EvalIt.Query
{
    public class DataObjectReviewFeedbackQuery
    {
        private List<Guid> _ids { get; set; }
        private List<Guid> _excludedIds { get; set; }
        private List<IsActive> _isActive { get; set; }
        private List<Guid> _reviewIds { get; set; }
        private List<Guid> _objectIds { get; set; }
        private List<Guid> _userIds { get; set; }
        private List<Guid> _trustingUserIds { get; set; }
        private List<Guid> _privateUserIds { get; set; }
        private List<Guid> _networkIds { get; set; }
        private List<ReviewVisibility> _visibilityValues { get; set; }
        private List<ReviewAnonymity> _anonymityValues { get; set; }
        private Paging _page { get; set; }
        private Ordering _order { get; set; }

        private bool _distinct { get; set; }

        public DataObjectReviewFeedbackQuery Ids(IEnumerable<Guid> ids) { this._ids = this.ToList(ids); return this; }
        public DataObjectReviewFeedbackQuery Ids(Guid id) { this._ids = this.ToList(id.AsArray()); return this; }
        public DataObjectReviewFeedbackQuery ExcludedIds(IEnumerable<Guid> excludedIds) { this._excludedIds = this.ToList(excludedIds); return this; }
        public DataObjectReviewFeedbackQuery ExcludedIds(Guid excludedId) { this._excludedIds = this.ToList(excludedId.AsArray()); return this; }
        public DataObjectReviewFeedbackQuery IsActive(IEnumerable<IsActive> isActive) { this._isActive = this.ToList(isActive); return this; }
        public DataObjectReviewFeedbackQuery IsActive(IsActive isActive) { this._isActive = this.ToList(isActive.AsArray()); return this; }
        public DataObjectReviewFeedbackQuery ReviewIds(IEnumerable<Guid> objectIds) { this._reviewIds = this.ToList(objectIds); return this; }
        public DataObjectReviewFeedbackQuery ReviewIds(Guid objectId) { this._reviewIds = this.ToList(objectId.AsArray()); return this; }
        public DataObjectReviewFeedbackQuery ObjectIds(IEnumerable<Guid> objectIds) { this._objectIds = this.ToList(objectIds); return this; }
        public DataObjectReviewFeedbackQuery ObjectIds(Guid objectId) { this._objectIds = this.ToList(objectId.AsArray()); return this; }
        public DataObjectReviewFeedbackQuery UserIds(IEnumerable<Guid> userIds) { this._userIds = this.ToList(userIds); return this; }
        public DataObjectReviewFeedbackQuery UserIds(Guid userId) { this._userIds = this.ToList(userId.AsArray()); return this; }
        public DataObjectReviewFeedbackQuery TrustingUserIds(IEnumerable<Guid> userIds) { this._trustingUserIds = this.ToList(userIds); return this; }
        public DataObjectReviewFeedbackQuery TrustingUserIds(Guid userId) { this._trustingUserIds = this.ToList(userId.AsArray()); return this; }
        public DataObjectReviewFeedbackQuery PrivateUserIds(IEnumerable<Guid> userIds) { this._privateUserIds = this.ToList(userIds); return this; }
        public DataObjectReviewFeedbackQuery PrivateUserIds(Guid userId) { this._privateUserIds = this.ToList(userId.AsArray()); return this; }
        public DataObjectReviewFeedbackQuery NetworkIds(IEnumerable<Guid> userIds) { this._networkIds = this.ToList(userIds); return this; }
        public DataObjectReviewFeedbackQuery NetworkIds(Guid userId) { this._networkIds = this.ToList(userId.AsArray()); return this; }
        public DataObjectReviewFeedbackQuery ReviewVisibilityValues(IEnumerable<ReviewVisibility> visibilityValues) { this._visibilityValues = this.ToList(visibilityValues); return this; }
        public DataObjectReviewFeedbackQuery ReviewVisibilityValues(ReviewVisibility visibilityValue) { this._visibilityValues = this.ToList(visibilityValue.AsArray()); return this; }
        public DataObjectReviewFeedbackQuery ReviewAnonymityValues(IEnumerable<ReviewAnonymity> anonymityValues) { this._anonymityValues = this.ToList(anonymityValues); return this; }
        public DataObjectReviewFeedbackQuery ReviewAnonymityValues(ReviewAnonymity anonymityValue) { this._anonymityValues = this.ToList(anonymityValue.AsArray()); return this; }
        public DataObjectReviewFeedbackQuery AsDistinct() { this._distinct = true; return this; }
        public DataObjectReviewFeedbackQuery AsNotDistinct() { this._distinct = false; return this; }
        public DataObjectReviewFeedbackQuery Pagination(Paging page) { this._page = page; return this; }
        public DataObjectReviewFeedbackQuery Ordering(Ordering order) { this._order = order; return this; }

        private List<V> ToList<V>(IEnumerable<V> items)
        {
            if (items == null) return null;
            return items.ToList();
        }

        public DataObjectReviewFeedbackQuery(AppMongoDbContext mongoDatabase)
        {
            this._mongoDatabase = mongoDatabase;
        }

        private readonly AppMongoDbContext _mongoDatabase;

        public void SetParameters(DataObjectReviewFeedbackLookup lookup)
        {
            this.Ids(lookup.Ids)
                .ExcludedIds(lookup.ExcludedIds)
                .ReviewIds(lookup.ReviewIds)
                .ObjectIds(lookup.ObjectIds)
                .UserIds(lookup.UserIds)
                .Pagination(lookup.Page)
                .Ordering(lookup.Order)
                .IsActive(lookup.IsActive);
        }

        private IAggregateFluent<Data.DataObjectTwiceUnwound> ApplyFilters(IAggregateFluent<Data.DataObjectTwiceUnwound> pipeline)
        {
            // TODO option for inactive object reviews
            pipeline = pipeline.Match(d => d.Reviews.IsActive == Common.IsActive.Active);
            pipeline = pipeline.Match(d => d.IsActive == Common.IsActive.Active);

            // Sequential match stages are optimized & coalesce into a single one
            if (this._objectIds != null) pipeline = pipeline.Match(d => this._objectIds.Contains(d.Id));
            if (this._reviewIds != null) pipeline = pipeline.Match(d => this._reviewIds.Contains(d.Reviews.Id));
            if (this._ids != null) pipeline = pipeline.Match(d => this._ids.Contains(d.Reviews.Feedback.Id));
            if (this._excludedIds != null) pipeline = pipeline.Match(d => !this._excludedIds.Contains(d.Reviews.Feedback.Id));
            if (this._anonymityValues != null) pipeline = pipeline.Match(d => this._anonymityValues.Contains(d.Reviews.Feedback.Anonymity));
            if (this._visibilityValues != null) pipeline = pipeline.Match(d => this._visibilityValues.Contains(d.Reviews.Feedback.Visibility));
            if (this._isActive != null) pipeline = pipeline.Match(d => this._isActive.Contains(d.Reviews.Feedback.IsActive));
            if (this._userIds != null) pipeline = pipeline.Match(d => d.Reviews.Feedback.UserId != null && this._userIds.Contains(d.Reviews.Feedback.UserId.Value));

            if (this._trustingUserIds != null) pipeline = pipeline.Match(d => d.Reviews.Feedback.Visibility != ReviewVisibility.Trusted || (d.Reviews.Feedback.UserId != null && this._trustingUserIds.Contains(d.Reviews.Feedback.UserId.Value)));
            if (this._privateUserIds != null) pipeline = pipeline.Match(d => d.Reviews.Feedback.Visibility != ReviewVisibility.Private || (d.Reviews.Feedback.UserId != null && this._privateUserIds.Contains(d.Reviews.Feedback.UserId.Value)));

            return pipeline;
        }

        private SortDefinition<Data.DataObjectTwiceUnwound> ApplyOrdering()
        {
            SortDefinitionBuilder<Data.DataObjectTwiceUnwound> sortBuilder = Builders<Data.DataObjectTwiceUnwound>.Sort;
            SortDefinition<Data.DataObjectTwiceUnwound> sort = null;

            Type t = typeof(Data.DataObjectReviewFeedback);
            Type u = typeof(Data.DataObjectReviewUnwound);
            Type uu = typeof(Data.DataObjectUnwound);

            foreach (var item in this._order?.Items)
            {
                OrderingFieldResolver resolver = new OrderingFieldResolver(item);

                //Get correct property string given an all-lowercase string of that property
                var objectProperty = uu.GetProperty(resolver.Field, System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.IgnoreCase);
                var reviewProperty = u.GetProperty(resolver.Field, System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.IgnoreCase);
                var feedbackProperty = t.GetProperty(resolver.Field, System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.IgnoreCase);
                string fieldName = "";

                if (objectProperty != null && reviewProperty == null && feedbackProperty == null && this._networkIds != null)
                {
                    fieldName = objectProperty.Name;
                }
                if (reviewProperty != null && feedbackProperty == null && this._networkIds != null)
                {
                    fieldName = nameof(DataObject.Reviews) + "." + reviewProperty.Name;
                }
                else if (feedbackProperty != null)
                {
                    fieldName = nameof(DataObject.Reviews) + "." + nameof(DataObjectReview.Feedback) + "." + feedbackProperty.Name;
                }

                if (sort == null) sort = resolver.IsAscending ? sortBuilder.Ascending(fieldName) : sortBuilder.Descending(fieldName);
                else sort = resolver.IsAscending ? sort.Ascending(fieldName) : sort.Descending(fieldName);
            }

            return sort;
        }

        public async Task<IEnumerable<Data.DataObjectReviewFeedback>> Collect()
        {
            var pipeline = _mongoDatabase.Aggregate<Data.DataObject>()
                                         .Unwind<DataObject, DataObjectUnwound>(o => o.Reviews, new AggregateUnwindOptions<DataObjectUnwound>() { PreserveNullAndEmptyArrays = false })
                                         .Unwind<DataObjectUnwound, DataObjectTwiceUnwound>(o => o.Reviews.Feedback, new AggregateUnwindOptions<DataObjectTwiceUnwound>() { PreserveNullAndEmptyArrays = false });

            if (this._networkIds != null)
            {
                var networkOrderExpression = new BsonDocument
                {{
                    nameof(DataObjectReviewUnwound.FeedbackAuthorInNetwork), new BsonDocument
                    {{
                        "$in", new BsonArray
                        {
                            "$" + nameof(DataObject.Reviews) + "." + nameof(DataObjectReview.Feedback) + "." + nameof(DataObjectReviewFeedback.UserId),
                            new BsonArray().AddRange(this._networkIds)
                        }
                    }}
                }};
                pipeline = pipeline.AppendStage<DataObjectTwiceUnwound>(new BsonDocument(new BsonElement("$addFields", networkOrderExpression)));
            }

            pipeline = this.ApplyFilters(pipeline);

            if (this._order != null) pipeline = pipeline.Sort(this.ApplyOrdering());

            var result = pipeline.Project<DataObjectReviewFeedback>(Builders<DataObjectTwiceUnwound>.Projection.Expression(u => new DataObjectReviewFeedback()
            {
                Anonymity = u.Reviews.Feedback.Anonymity,
                CreatedAt = u.Reviews.Feedback.CreatedAt,
                UpdatedAt = u.Reviews.Feedback.UpdatedAt,
                IsActive = u.Reviews.Feedback.IsActive,
                DataObjectReviewId = u.Reviews.Id,
                FeedbackData = u.Reviews.Feedback.FeedbackData,
                Id = u.Reviews.Feedback.Id,
                UserId = u.Reviews.Feedback.UserId,
                UserIdHash = u.Reviews.Feedback.UserIdHash,
                Visibility = u.Reviews.Feedback.Visibility
            }));

            if (this._page != null) result = result.Skip(this._page.Offset).Limit(this._page.Size);

            return await result.ToListAsync();
        }


        public async Task<int> CountAll()
        {
            var pipeline = _mongoDatabase.Aggregate<Data.DataObject>()
                                         .Unwind<DataObject, DataObjectUnwound>(o => o.Reviews, new AggregateUnwindOptions<DataObjectUnwound>() { PreserveNullAndEmptyArrays = false })
                                         .Unwind<DataObjectUnwound, DataObjectTwiceUnwound>(o => o.Reviews.Feedback, new AggregateUnwindOptions<DataObjectTwiceUnwound>() { PreserveNullAndEmptyArrays = false });
            
            pipeline = this.ApplyFilters(pipeline);

            return (await pipeline.ToListAsync()).Count();
        }
    }
}
