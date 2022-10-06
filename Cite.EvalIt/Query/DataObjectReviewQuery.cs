using Cite.EvalIt.Common;
using Cite.EvalIt.Data;
using Cite.EvalIt.Data.Context;
using Cite.Tools.Common.Extensions;
using Cite.Tools.Data.Query;
using Microsoft.EntityFrameworkCore;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Cite.EvalIt.Query
{
    public class DataObjectReviewQuery
    {
        private List<Guid> _ids { get; set; }
        private List<Guid> _excludedIds { get; set; }
        private List<IsActive> _isActive { get; set; }
        private List<IsActive> _isObjectActive { get; set; }
        private List<IsActive> _containedFeedbackByIsActive { get; set; }
        private List<Guid> _objectIds { get; set; }
        private List<Guid> _userIds { get; set; }
        private List<Guid> _trustingUserIds { get; set; }
        private List<Guid> _privateUserIds { get; set; }
        private List<Guid> _networkIds { get; set; }
        private List<ReviewVisibility> _visibilityValues { get; set; }
        private List<ReviewAnonymity> _anonymityValues { get; set; }
        private DateTime? _createdAfter { get; set; }
        private Paging _page { get; set; }
        private Ordering _order { get; set; }

        private bool _distinct { get; set; }

        public DataObjectReviewQuery Ids(IEnumerable<Guid> ids) { this._ids = this.ToList(ids); return this; }
        public DataObjectReviewQuery Ids(Guid id) { this._ids = this.ToList(id.AsArray()); return this; }
        public DataObjectReviewQuery ExcludedIds(IEnumerable<Guid> excludedIds) { this._excludedIds = this.ToList(excludedIds); return this; }
        public DataObjectReviewQuery ExcludedIds(Guid excludedId) { this._excludedIds = this.ToList(excludedId.AsArray()); return this; }
        public DataObjectReviewQuery IsActive(IEnumerable<IsActive> isActive) { this._isActive = this.ToList(isActive); return this; }
        public DataObjectReviewQuery IsActive(IsActive isActive) { this._isActive = this.ToList(isActive.AsArray()); return this; }
        public DataObjectReviewQuery IsObjectActive(IEnumerable<IsActive> isActive) { this._isObjectActive = this.ToList(isActive); return this; }
        public DataObjectReviewQuery IsObjectActive(IsActive isActive) { this._isObjectActive = this.ToList(isActive.AsArray()); return this; }
        public DataObjectReviewQuery ContainedFeedbackByIsActive(IEnumerable<IsActive> isActive) { this._containedFeedbackByIsActive = this.ToList(isActive); return this; }
        public DataObjectReviewQuery ContainedFeedbackByIsActive(IsActive isActive) { this._containedFeedbackByIsActive = this.ToList(isActive.AsArray()); return this; }
        public DataObjectReviewQuery ObjectIds(IEnumerable<Guid> objectIds) { this._objectIds = this.ToList(objectIds); return this; }
        public DataObjectReviewQuery ObjectIds(Guid objectId) { this._objectIds = this.ToList(objectId.AsArray()); return this; }
        public DataObjectReviewQuery UserIds(IEnumerable<Guid> userIds) { this._userIds = this.ToList(userIds); return this; }
        public DataObjectReviewQuery UserIds(Guid userId) { this._userIds = this.ToList(userId.AsArray()); return this; }
        public DataObjectReviewQuery TrustingUserIds(IEnumerable<Guid> userIds) { this._trustingUserIds = this.ToList(userIds); return this; }
        public DataObjectReviewQuery TrustingUserIds(Guid userId) { this._trustingUserIds = this.ToList(userId.AsArray()); return this; }
        public DataObjectReviewQuery PrivateUserIds(IEnumerable<Guid> userIds) { this._privateUserIds = this.ToList(userIds); return this; }
        public DataObjectReviewQuery PrivateUserIds(Guid userId) { this._privateUserIds = this.ToList(userId.AsArray()); return this; }
        public DataObjectReviewQuery NetworkIds(IEnumerable<Guid> userIds) { this._networkIds = this.ToList(userIds); return this; }
        public DataObjectReviewQuery NetworkIds(Guid userId) { this._networkIds = this.ToList(userId.AsArray()); return this; }
        public DataObjectReviewQuery ReviewVisibilityValues(IEnumerable<ReviewVisibility> visibilityValues) { this._visibilityValues = this.ToList(visibilityValues); return this; }
        public DataObjectReviewQuery ReviewVisibilityValues(ReviewVisibility visibilityValue) { this._visibilityValues = this.ToList(visibilityValue.AsArray()); return this; }
        public DataObjectReviewQuery ReviewAnonymityValues(IEnumerable<ReviewAnonymity> anonymityValues) { this._anonymityValues = this.ToList(anonymityValues); return this; }
        public DataObjectReviewQuery ReviewAnonymityValues(ReviewAnonymity anonymityValue) { this._anonymityValues = this.ToList(anonymityValue.AsArray()); return this; }
        public DataObjectReviewQuery CreatedAfter(DateTime? createdAfter) { this._createdAfter = createdAfter; return this; }
        public DataObjectReviewQuery AsDistinct() { this._distinct = true; return this; }
        public DataObjectReviewQuery AsNotDistinct() { this._distinct = false; return this; }
        public DataObjectReviewQuery Pagination(Paging page) { this._page = page; return this; }
        public DataObjectReviewQuery Ordering(Ordering order) { this._order = order; return this; }

        private List<V> ToList<V>(IEnumerable<V> items)
        {
            if (items == null) return null;
            return items.ToList();
        }

        public DataObjectReviewQuery(AppMongoDbContext mongoDatabase)
        {
            this._mongoDatabase = mongoDatabase;
        }

        private readonly AppMongoDbContext _mongoDatabase;

        public void SetParameters(DataObjectReviewLookup lookup)
        {
            this.Ids(lookup.Ids)
                .ExcludedIds(lookup.ExcludedIds)
                .ObjectIds(lookup.ObjectIds)
                .UserIds(lookup.UserIds)
                .Pagination(lookup.Page)
                .Ordering(lookup.Order)
                .IsActive(lookup.IsActive);
        }

        private IAggregateFluent<Data.DataObjectUnwound> ApplyFilters(IAggregateFluent<Data.DataObjectUnwound> pipeline)
        {
            // Sequential match stages are optimized & coalesce into a single one
            if (this._objectIds != null) pipeline = pipeline.Match(d => this._objectIds.Contains(d.Id));
            if (this._ids != null) pipeline = pipeline.Match(d => this._ids.Contains(d.Reviews.Id));
            if (this._excludedIds != null) pipeline = pipeline.Match(d => !this._excludedIds.Contains(d.Reviews.Id));
            if (this._anonymityValues != null) pipeline = pipeline.Match(d => this._anonymityValues.Contains(d.Reviews.Anonymity));
            if (this._visibilityValues != null) pipeline = pipeline.Match(d => this._visibilityValues.Contains(d.Reviews.Visibility));
            if (this._isActive != null) pipeline = pipeline.Match(d => this._isActive.Contains(d.Reviews.IsActive));
            if (this._isObjectActive != null) pipeline = pipeline.Match(d => this._isObjectActive.Contains(d.IsActive));
            if (this._createdAfter != null) pipeline = pipeline.Match(d => this._createdAfter < d.Reviews.CreatedAt);
            if (this._userIds != null) pipeline = pipeline.Match(d => d.Reviews.UserId != null && this._userIds.Contains(d.Reviews.UserId.Value));

            if (this._trustingUserIds != null) pipeline = pipeline.Match(d => d.Reviews.Visibility != ReviewVisibility.Trusted || (d.Reviews.UserId != null && this._trustingUserIds.Contains(d.Reviews.UserId.Value)));
            if (this._privateUserIds != null) pipeline = pipeline.Match(d => d.Reviews.Visibility != ReviewVisibility.Private || (d.Reviews.UserId != null && this._privateUserIds.Contains(d.Reviews.UserId.Value)));
            
            return pipeline;
        }

        private SortDefinition<Data.DataObjectUnwound> ApplyOrdering()
        {
            SortDefinitionBuilder<Data.DataObjectUnwound> sortBuilder = Builders<Data.DataObjectUnwound>.Sort;
            SortDefinition<Data.DataObjectUnwound> sort = null;

            Type t = typeof(Data.DataObjectReview);
            Type u = typeof(Data.DataObjectUnwound);

            foreach (var item in this._order?.Items)
            {
                OrderingFieldResolver resolver = new OrderingFieldResolver(item);

                // Get correct property string given an all-lowercase string of that property
                var unwoundProperty = u.GetProperty(resolver.Field, System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.IgnoreCase);
                var reviewProperty = t.GetProperty(resolver.Field, System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.IgnoreCase);
                string fieldName = "";

                if (unwoundProperty != null && reviewProperty == null && this._networkIds != null)
                {
                    fieldName = unwoundProperty.Name;
                }
                else if(reviewProperty != null)
                {
                    fieldName = nameof(DataObject.Reviews) + "." + reviewProperty.Name;
                }

                if (sort == null) sort = resolver.IsAscending ? sortBuilder.Ascending(fieldName) : sortBuilder.Descending(fieldName);
                else sort = resolver.IsAscending ? sort.Ascending(fieldName) : sort.Descending(fieldName);
            }

            return sort;
        }

        public async Task<IEnumerable<Data.DataObjectReview>> Collect()
        {
            var pipeline = _mongoDatabase.Aggregate<Data.DataObject>()
                                         .Unwind<DataObject, DataObjectUnwound>(u => u.Reviews);

            if (this._networkIds != null)
            {
                var networkOrderExpression = new BsonDocument
                {{
                    nameof(DataObjectUnwound.ReviewAuthorInNetwork), new BsonDocument
                    {{
                        "$in", new BsonArray
                        {
                            "$" + nameof(DataObject.Reviews) + "." + nameof(DataObjectReview.UserId),
                            new BsonArray().AddRange(this._networkIds)
                        }
                    }}
                }};
                pipeline = pipeline.AppendStage<DataObjectUnwound>(new BsonDocument(new BsonElement("$addFields", networkOrderExpression)));
            }

            pipeline = this.ApplyFilters(pipeline);

            if (this._order != null) pipeline = pipeline.Sort(this.ApplyOrdering());

            var result = pipeline.Project<DataObjectReview>(Builders<DataObjectUnwound>.Projection.Expression(u => new DataObjectReview()
            {
                Anonymity = u.Reviews.Anonymity,
                CreatedAt = u.Reviews.CreatedAt,
                DataObjectId = u.Id,
                DataObjectType = u.Reviews.DataObjectType,
                EvaluationData = u.Reviews.EvaluationData,
                Id = u.Reviews.Id,
                IsActive = u.Reviews.IsActive,
                RankScore = u.Reviews.RankScore,
                UpdatedAt = u.Reviews.UpdatedAt,
                UserId = u.Reviews.UserId,
                UserIdHash = u.Reviews.UserIdHash,
                Visibility = u.Reviews.Visibility,
                Feedback = u.Reviews.Feedback.Where(y =>
                    (this._containedFeedbackByIsActive == null || this._containedFeedbackByIsActive.Contains(y.IsActive)) &&
                    (this._trustingUserIds == null || y.Visibility != ReviewVisibility.Trusted || (y.UserId != null && this._trustingUserIds.Contains(y.UserId.Value))) &&
                    (this._privateUserIds == null  || y.Visibility != ReviewVisibility.Private || (y.UserId != null && this._privateUserIds.Contains(y.UserId.Value)))
                )
            }));

            if (this._page != null) result = result.Skip(this._page.Offset).Limit(this._page.Size);

            return await result.ToListAsync();
        }

        public async Task<int> CountAll()
        {
            var pipeline = _mongoDatabase.Aggregate<Data.DataObject>()
                                         .Unwind<DataObject, DataObjectUnwound>(u => u.Reviews);

            pipeline = this.ApplyFilters(pipeline);

            return (await pipeline.ToListAsync()).Count();
        }
    }
}
