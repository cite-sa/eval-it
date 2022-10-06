using Cite.EvalIt.Common;
using Cite.EvalIt.Data;
using Cite.EvalIt.Data.Context;
using Cite.Tools.Common.Extensions;
using Cite.Tools.Data.Query;
using Cite.Tools.Logging;
using Cite.WebTools.CurrentPrincipal;
using Microsoft.EntityFrameworkCore;
using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Cite.EvalIt.Query
{
    public class UserQuery
    {
        private List<Guid> _ids { get; set; }
        private List<Guid> _excludedIds { get; set; }
        private List<IsActive> _isActive { get; set; }
        private List<Guid> _tagIds { get; set; }
        private List<Guid> _networkIds { get; set; }
        private List<Guid> _trustingIds { get; set; }
        private Guid? _referenceUserId { get; set; }
        private List<bool> _isNetworkCandidate { get; set; }
        private Paging _page { get; set; }
        private Ordering _order { get; set; }
        private string _like { get; set; }

        private bool _distinct { get; set; }

        public UserQuery Ids(IEnumerable<Guid> ids) { this._ids = this.ToList(ids); return this; }
        public UserQuery Ids(Guid id) { this._ids = this.ToList(id.AsArray()); return this; }
        public UserQuery ExcludedIds(IEnumerable<Guid> excludedIds) { this._excludedIds = this.ToList(excludedIds); return this; }
        public UserQuery ExcludedIds(Guid excludedId) { this._excludedIds = this.ToList(excludedId.AsArray()); return this; }
        public UserQuery IsActive(IEnumerable<IsActive> isActive) { this._isActive = this.ToList(isActive); return this; }
        public UserQuery IsActive(IsActive isActive) { this._isActive = this.ToList(isActive.AsArray()); return this; }
        public UserQuery Like(string like) { this._like = like?.Substring(0, like.Length - 1); return this; } // Remove % suffix from like string, not needed in mongo
        public UserQuery TagIds(IEnumerable<Guid> profileIds) { this._tagIds = this.ToList(profileIds); return this; }
        public UserQuery TagIds(Guid profileId) { this._tagIds = this.ToList(profileId.AsArray()); return this; }
        public UserQuery NetworkIds(Guid userId) { this._networkIds = this.ToList(userId.AsArray()); return this; }
        public UserQuery NetworkIds(IEnumerable<Guid> userIds) { this._networkIds = this.ToList(userIds); return this; }
        public UserQuery TrustingIds(Guid userId) { this._trustingIds = this.ToList(userId.AsArray()); return this; }
        public UserQuery TrustingIds(IEnumerable<Guid> userIds) { this._trustingIds = this.ToList(userIds); return this; }
        public UserQuery IsNetworkCandidate(IEnumerable<bool> isNetworkCandidate) { this._isNetworkCandidate = this.ToList(isNetworkCandidate); return this; }
        public UserQuery ReferenceUserId(Guid? referenceUserId) { this._referenceUserId = referenceUserId ;return this; }
        public UserQuery AsDistinct() { this._distinct = true; return this; }
        public UserQuery AsNotDistinct() { this._distinct = false; return this; }
        public UserQuery Pagination(Paging page) { this._page = page; return this; }
        public UserQuery Ordering(Ordering order) { this._order = order; return this; }


        private List<V> ToList<V>(IEnumerable<V> items)
        {
            if (items == null) return null;
            return items.ToList();
        }

        public UserQuery(AppMongoDbContext mongoDatabase, ICurrentPrincipalResolverService currentPrincipalResolverService)
        {
            this._mongoDatabase = mongoDatabase;
            this._currentPrincipalResolverService = currentPrincipalResolverService;
        }

        private readonly AppMongoDbContext _mongoDatabase;
        private readonly ICurrentPrincipalResolverService _currentPrincipalResolverService;

        public void SetParameters(UserLookup lookup)
        {
            this.Ids(lookup.Ids)
                .ExcludedIds(lookup.ExcludedIds)
                .TagIds(lookup.TagIds)
                .Pagination(lookup.Page)
                .Ordering(lookup.Order)
                .IsActive(lookup.IsActive)
                .Like(lookup.Like)
                .ReferenceUserId(lookup.ReferenceUserId)
                .IsNetworkCandidate(lookup.IsNetworkCandidate);
        }

        private IAggregateFluent<Data.User> ApplyFilters(IAggregateFluent<Data.User> pipeline)
        {
            FilterDefinitionBuilder<Data.User> filterBuilder = Builders<Data.User>.Filter;
            FilterDefinition<Data.User> filter = filterBuilder.Empty;

            // Sequential match stages are optimized & coalesce into a single one
            if (this._ids != null) pipeline = pipeline.Match(d => this._ids.Contains(d.Id));
            if (this._excludedIds != null) pipeline = pipeline.Match(d => !this._excludedIds.Contains(d.Id));
            if (this._networkIds != null) filter &= filterBuilder.ElemMatch(t => t.UserNetworkIds, Builders<UserWithRelationship>.Filter.In(t => t.Id, this._networkIds));
            if (this._trustingIds != null) filter &= filterBuilder.ElemMatch(t => t.UserNetworkIds, Builders<UserWithRelationship>.Filter.In(t => t.Id, this._trustingIds) & Builders<UserWithRelationship>.Filter.Eq(t => t.Relationship, UserNetworkRelationship.Trust));
            if (this._tagIds != null) filter &= filterBuilder.AnyIn(d => d.AssignedTagIds, this._tagIds);
            if (this._isNetworkCandidate != null) pipeline = pipeline.Match(d => this._isNetworkCandidate.Contains(d.IsNetworkCandidate.Value));
            if (this._isActive != null) pipeline = pipeline.Match(d => this._isActive.Contains(d.IsActive));

            if (this._like != null)
            {
                string regexp = "/*m*/";
                filter &= filterBuilder.Regex(nameof(Data.User.Name), new MongoDB.Bson.BsonRegularExpression(_like, regexp));
            }

            pipeline = pipeline.Match(filter);
            return pipeline;
        }


        private SortDefinition<Data.User> ApplyOrdering()
        {
            SortDefinitionBuilder<Data.User> sortBuilder = Builders<Data.User>.Sort;
            SortDefinition<Data.User> sort = null;

            Type t = typeof(Data.User);

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

        public async Task<IEnumerable<Data.User>> Collect()
        {
            var res = _mongoDatabase.Aggregate<Data.User>();

            if (this._isNetworkCandidate != null)
            {
                Guid? currentUserId = this._referenceUserId;
                if (currentUserId == null || currentUserId.Value == Guid.Empty)
                {
                    ClaimsPrincipal principal = this._currentPrincipalResolverService.CurrentPrincipal();
                    currentUserId = Guid.Parse(principal.Claims.Where(c => c.Type == "sub").Select(c => c.Value).FirstOrDefault());
                }

                FilterDefinitionBuilder<Data.User> filterBuilder = Builders<Data.User>.Filter;
                FilterDefinition<Data.User> filter = filterBuilder.Eq(u => u.Id, currentUserId) & filterBuilder.Eq(u => u.IsActive, Common.IsActive.Active);
                Data.User currentUser = (currentUserId != null) ? (await this._mongoDatabase.FindAsync(filter)) : null;

                if (currentUser != null)
                {
                    var networkCandidateExpression = new BsonDocument
                    {{
                        nameof(User.IsNetworkCandidate), new BsonDocument
                        {{
                            "$not", new BsonDocument
                            {{
                                "$in", new BsonArray
                                {
                                    "$_id",
                                    new BsonArray().AddRange(currentUser.UserNetworkIds.Select(u => u.Id).Append(currentUserId.Value))
                                }
                            }}
                        }}
                    }};
                    res = res.AppendStage<User>(new BsonDocument(new BsonElement("$addFields", networkCandidateExpression)));
                }
                else this._isNetworkCandidate = null;
            }

            res = this.ApplyFilters(res);

            if (this._order != null) res = res.Sort(this.ApplyOrdering());

            if (this._page != null) res = res.Skip(this._page.Offset).Limit(this._page.Size);

            return await res.ToListAsync();
        }

        public async Task<int> CountAll()
        {
            var res = _mongoDatabase.Aggregate<Data.User>();

            if (this._isNetworkCandidate != null)
            {
                Guid? currentUserId = this._referenceUserId;
                if (currentUserId == null || currentUserId.Value == Guid.Empty)
                {
                    ClaimsPrincipal principal = this._currentPrincipalResolverService.CurrentPrincipal();
                    currentUserId = Guid.Parse(principal.Claims.Where(c => c.Type == "sub").Select(c => c.Value).FirstOrDefault());
                }

                FilterDefinitionBuilder<Data.User> filterBuilder = Builders<Data.User>.Filter;
                FilterDefinition<Data.User> filter = filterBuilder.Eq(u => u.Id, currentUserId) & filterBuilder.Eq(u => u.IsActive, Common.IsActive.Active);
                Data.User currentUser = (currentUserId != null) ? (await this._mongoDatabase.FindAsync(filter)) : null;

                if (currentUser != null)
                {
                    var networkCandidateExpression = new BsonDocument
                    {{
                        nameof(User.IsNetworkCandidate), new BsonDocument
                        {{
                            "$not", new BsonDocument
                            {{
                                "$in", new BsonArray
                                {
                                    "$_id",
                                    new BsonArray().AddRange(currentUser.UserNetworkIds.Select(u => u.Id).Append(currentUserId.Value))
                                }
                            }}
                        }}
                    }};
                    res = res.AppendStage<User>(new BsonDocument(new BsonElement("$addFields", networkCandidateExpression)));
                }
                else this._isNetworkCandidate = null;
            }

            res = this.ApplyFilters(res);

            return (await res.ToListAsync()).Count();
        }
    }
}
