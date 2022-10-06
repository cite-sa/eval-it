using Cite.EvalIt.Common;
using Cite.EvalIt.Data;
using Cite.EvalIt.Data.Context;
using Cite.Tools.Common.Extensions;
using Cite.Tools.Data.Query;
using Cite.Tools.Logging;
using Microsoft.EntityFrameworkCore;
using MongoDB.Driver;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Cite.EvalIt.Query
{
    public class DataObjectQuery
    {
        private List<Guid> _ids { get; set; }
        private List<Guid> _excludedIds { get; set; }
        private List<IsActive> _isActive { get; set; }
        private List<Guid> _tagIds { get; set; }
        private List<Guid> _typeIds { get; set; }
        private List<Guid> _userIds { get; set; }
        private List<Guid> _trustingUserIds { get; set; }
        private List<Guid> _privateUserIds { get; set; }
        private DateTime? _createdAfter { get; set; }
        private Paging _page { get; set; }
        private Ordering _order { get; set; }
        private string _like { get; set; }
        private string _likeDescription { get; set; }

        private bool _distinct { get; set; }

        public DataObjectQuery Ids(IEnumerable<Guid> ids) { this._ids = this.ToList(ids); return this; }
        public DataObjectQuery Ids(Guid id) { this._ids = this.ToList(id.AsArray()); return this; }
        public DataObjectQuery ExcludedIds(IEnumerable<Guid> excludedIds) { this._excludedIds = this.ToList(excludedIds); return this; }
        public DataObjectQuery ExcludedIds(Guid excludedId) { this._excludedIds = this.ToList(excludedId.AsArray()); return this; }
        public DataObjectQuery IsActive(IEnumerable<IsActive> isActive) { this._isActive = this.ToList(isActive); return this; }
        public DataObjectQuery IsActive(IsActive isActive) { this._isActive = this.ToList(isActive.AsArray()); return this; }
        public DataObjectQuery Like(string like) { this._like = like?.Substring(0, like.Length - 1); return this; } // Remove % suffix from like string, not needed in mongo
        public DataObjectQuery LikeDescription(string likeDescription) { this._likeDescription = likeDescription?.Substring(0, likeDescription.Length - 1); return this; } // Remove % suffix from like string, not needed in mongo
        public DataObjectQuery TagIds(IEnumerable<Guid> tagIds) { this._tagIds = this.ToList(tagIds); return this; }
        public DataObjectQuery TagIds(Guid tagId) { this._tagIds = this.ToList(tagId.AsArray()); return this; }
        public DataObjectQuery TypeIds(IEnumerable<Guid> typeIds) { this._typeIds = this.ToList(typeIds); return this; }
        public DataObjectQuery TypeIds(Guid typeId) { this._typeIds = this.ToList(typeId.AsArray()); return this; }
        public DataObjectQuery UserIds(IEnumerable<Guid> userIds) { this._userIds = this.ToList(userIds); return this; }
        public DataObjectQuery UserIds(Guid userId) { this._userIds = this.ToList(userId.AsArray()); return this; }
        public DataObjectQuery TrustingUserIds(IEnumerable<Guid> userIds) { this._trustingUserIds = this.ToList(userIds); return this; }
        public DataObjectQuery TrustingUserIds(Guid userId) { this._trustingUserIds = this.ToList(userId.AsArray()); return this; }
        public DataObjectQuery PrivateUserIds(IEnumerable<Guid> userIds) { this._privateUserIds = this.ToList(userIds); return this; }
        public DataObjectQuery PrivateUserIds(Guid userId) { this._privateUserIds = this.ToList(userId.AsArray()); return this; }
        public DataObjectQuery CreatedAfter(DateTime? createdAfter) { this._createdAfter = createdAfter; return this; }
        public DataObjectQuery AsDistinct() { this._distinct = true; return this; }
        public DataObjectQuery AsNotDistinct() { this._distinct = false; return this; }
        public DataObjectQuery Pagination(Paging page) { this._page = page; return this; }
        public DataObjectQuery Ordering(Ordering order) { this._order = order; return this; }

        private List<V> ToList<V>(IEnumerable<V> items)
        {
            if (items == null) return null;
            return items.ToList();
        }

        public DataObjectQuery(AppMongoDbContext mongoDatabase)
        {
            this._mongoDatabase = mongoDatabase;
        }

        private readonly AppMongoDbContext _mongoDatabase;

        public void SetParameters(DataObjectLookup lookup)
        {
            this.Ids(lookup.Ids)
                .ExcludedIds(lookup.ExcludedIds)
                .TagIds(lookup.TagIds)
                .TypeIds(lookup.TypeIds)
                .UserIds(lookup.UserIds)
                .Pagination(lookup.Page)
                .Ordering(lookup.Order)
                .IsActive(lookup.IsActive)
                .Like(lookup.Like)
                .LikeDescription(lookup.LikeDescription);
        }

        private IAggregateFluent<Data.DataObject> ApplyFilters(IAggregateFluent<Data.DataObject> pipeline)
        {
            FilterDefinitionBuilder<Data.DataObject> filterBuilder = Builders<Data.DataObject>.Filter;
            FilterDefinition<Data.DataObject> filter = filterBuilder.Empty;

            // Sequential match stages are optimized & coalesce into a single one
            if (this._ids != null) pipeline = pipeline.Match(d => this._ids.Contains(d.Id));
            if (this._excludedIds != null) pipeline = pipeline.Match(d => !this._excludedIds.Contains(d.Id));
            if (this._tagIds != null) filter &= filterBuilder.AnyIn(d => d.AssignedTagIds, this._tagIds);
            if (this._typeIds != null) pipeline = pipeline.Match(d => this._typeIds.Contains(d.DataObjectTypeId));
            if (this._isActive != null) pipeline = pipeline.Match(d => this._isActive.Contains(d.IsActive));
            if (this._createdAfter != null) pipeline = pipeline.Match(d => this._createdAfter < d.CreatedAt);
            if (this._userIds != null) pipeline = pipeline.Match(d => this._userIds.Contains(d.UserId));

            if (this._like != null)
            {
                string regexp = "/*m*/";
                filter &= filterBuilder.Regex(nameof(Data.DataObject.Title), new MongoDB.Bson.BsonRegularExpression(_like, regexp));
            }
            if (this._likeDescription != null)
            {
                string regexp = "/*m*/";
                filter &= filterBuilder.Regex(nameof(Data.DataObject.Description), new MongoDB.Bson.BsonRegularExpression(_likeDescription, regexp));
            }

            pipeline = pipeline.Match(filter);
            return pipeline;
        }

        private SortDefinition<Data.DataObject> ApplyOrdering()
        {
            SortDefinitionBuilder<Data.DataObject> sortBuilder = Builders<Data.DataObject>.Sort;
            SortDefinition<Data.DataObject> sort = null;

            Type t = typeof(Data.DataObject);

            foreach (var item in this._order?.Items)
            {
                OrderingFieldResolver resolver = new OrderingFieldResolver(item);

                // Get correct property string given an all-lowercase string of that property
                string fieldName = t.GetProperty(resolver.Field, System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.IgnoreCase).Name;

                if (sort == null) sort = resolver.IsAscending ? sortBuilder.Ascending(fieldName) : sortBuilder.Descending(fieldName);
                else sort = resolver.IsAscending ? sort.Ascending(fieldName) : sort.Descending(fieldName);
            }

            return sort;
        }

        public async Task<IEnumerable<Data.DataObject>> Collect()
        {
            var pipeline = _mongoDatabase.Aggregate<Data.DataObject>();

            pipeline = this.ApplyFilters(pipeline);

            pipeline = pipeline.Project<DataObject>(Builders<DataObject>.Projection.Expression(u => new DataObject()
            {
                AssignedTagIds = u.AssignedTagIds,
                AttributeData = u.AttributeData,
                CreatedAt = u.CreatedAt,
                IsActive = u.IsActive,
                UpdatedAt = u.UpdatedAt,
                DataObjectType = u.DataObjectType,
                DataObjectTypeId = u.DataObjectTypeId,
                Description = u.Description,
                Id = u.Id,
                RankScore = u.RankScore,
                Title = u.Title,
                UserDefinedIds = u.UserDefinedIds,
                UserId = u.UserId,
                Reviews = u.Reviews.Select(r => new DataObjectReview()
                    {
                        Anonymity = r.Anonymity,
                        CreatedAt = r.CreatedAt,
                        DataObjectId = u.Id,
                        DataObjectType = r.DataObjectType,
                        EvaluationData = r.EvaluationData,
                        Id = r.Id,
                        RankScore = r.RankScore,
                        IsActive = r.IsActive,
                        UpdatedAt = r.UpdatedAt,
                        UserId = r.UserId,
                        UserIdHash = r.UserIdHash,
                        Visibility = r.Visibility,
                        Feedback = r.Feedback.Where(y =>
                            (this._trustingUserIds == null || y.Visibility != ReviewVisibility.Trusted || (y.UserId != null && this._trustingUserIds.Contains(y.UserId.Value))) &&
                            (this._privateUserIds == null || y.Visibility != ReviewVisibility.Private || (y.UserId != null && this._privateUserIds.Contains(y.UserId.Value)))
                        )
                }).Where(r =>
                    (this._trustingUserIds == null || r.Visibility != ReviewVisibility.Trusted || (r.UserId != null && this._trustingUserIds.Contains(r.UserId.Value))) &&
                    (this._privateUserIds == null || r.Visibility != ReviewVisibility.Private || (r.UserId != null && this._privateUserIds.Contains(r.UserId.Value)))
                )
            }));

            if (this._order != null) pipeline = pipeline.Sort(this.ApplyOrdering());

            if (this._page != null) pipeline = pipeline.Skip(this._page.Offset).Limit(this._page.Size);

            return await pipeline.ToListAsync();
        }

        public async Task<int> CountAll()
        {
            var pipeline = _mongoDatabase.Aggregate<Data.DataObject>();

            pipeline = this.ApplyFilters(pipeline);

            return (await pipeline.ToListAsync()).Count();
        }
    }
}
