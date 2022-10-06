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
    public class TagQuery
    {
        private List<Guid> _ids { get; set; }
        private List<Guid> _excludedIds { get; set; }
        private List<IsActive> _isActive { get; set; }
        private List<Guid> _userIds { get; set; }
        private List<Guid> _excludedUserIds { get; set; }
        private List<Guid> _dataObjectIds { get; set; }
        private List<Guid> _excludedDataObjectIds { get; set; }
        private List<TagAppliesTo> _appliesTo { get; set; }
        private List<TagType> _type { get; set; }
        private Paging _page { get; set; }
        private Ordering _order { get; set; }
        private string _like { get; set; }
        private bool _distinct { get; set; }

        public TagQuery Ids(IEnumerable<Guid> ids) { this._ids = this.ToList(ids); return this; }
        public TagQuery Ids(Guid id) { this._ids = this.ToList(id.AsArray()); return this; }
        public TagQuery UserIds(IEnumerable<Guid> userIds) { this._userIds = this.ToList(userIds); return this; }
        public TagQuery UserIds(Guid userId) { this._userIds = this.ToList(userId.AsArray()); return this; }
        public TagQuery ExcludedUserIds(IEnumerable<Guid> excludedIds) { this._excludedUserIds = this.ToList(excludedIds); return this; }
        public TagQuery ExcludedUserIds(Guid excludedId) { this._excludedUserIds = this.ToList(excludedId.AsArray()); return this; }
        public TagQuery DataObjectIds(IEnumerable<Guid> dataObjectIds) { this._dataObjectIds = this.ToList(dataObjectIds); return this; }
        public TagQuery DataObjectIds(Guid dataObjectId) { this._dataObjectIds = this.ToList(dataObjectId.AsArray()); return this; }
        public TagQuery ExcludedDataObjectIds(IEnumerable<Guid> excludedIds) { this._excludedDataObjectIds = this.ToList(excludedIds); return this; }
        public TagQuery ExcludedDataObjectIds(Guid excludedId) { this._excludedDataObjectIds = this.ToList(excludedId.AsArray()); return this; }
        public TagQuery ExcludedIds(IEnumerable<Guid> excludedIds) { this._excludedIds = this.ToList(excludedIds); return this; }
        public TagQuery ExcludedIds(Guid excludedId) { this._excludedIds = this.ToList(excludedId.AsArray()); return this; }
        public TagQuery IsActive(IEnumerable<IsActive> isActive) { this._isActive = this.ToList(isActive); return this; }
        public TagQuery IsActive(IsActive isActive) { this._isActive = this.ToList(isActive.AsArray()); return this; }
        public TagQuery AppliesTo(IEnumerable<TagAppliesTo> appliesTo) { this._appliesTo = this.ToList(appliesTo); return this; }
        public TagQuery AppliesTo(TagAppliesTo appliesTo) { this._appliesTo = this.ToList(appliesTo.AsArray()); return this; }
        public TagQuery Type(IEnumerable<TagType> type) { this._type = this.ToList(type); return this; }
        public TagQuery Type(TagType type) { this._type = this.ToList(type.AsArray()); return this; }

        public TagQuery Like(string like) { this._like = like?.Substring(0, like.Length - 1); return this; } // Remove % suffix from like string, not needed in mongo

        public TagQuery AsDistinct() { this._distinct = true; return this; }
        public TagQuery AsNotDistinct() { this._distinct = false; return this; }
        public TagQuery Pagination(Paging page) { this._page = page; return this; }
        public TagQuery Ordering(Ordering order) { this._order = order; return this; }


        private List<V> ToList<V>(IEnumerable<V> items)
        {
            if (items == null) return null;
            return items.ToList();
        }

        public TagQuery(AppMongoDbContext mongoDatabase, UserQuery userQuery, DataObjectQuery dataObjectQuery)
        {
            this._mongoDbContext = mongoDatabase;
            this._userQuery = userQuery;
            this._dataObjectQuery = dataObjectQuery;
        }

        private readonly AppMongoDbContext _mongoDbContext;
        private readonly UserQuery _userQuery;
        private readonly DataObjectQuery _dataObjectQuery;
        public void SetParameters(TagLookup lookup)
        {
            this.Ids(lookup.Ids)
                .ExcludedIds(lookup.ExcludedIds)
                .UserIds(lookup.UserIds)
                .ExcludedUserIds(lookup.ExcludedUserIds)
                .DataObjectIds(lookup.DataObjectIds)
                .ExcludedDataObjectIds(lookup.ExcludedDataObjectIds)
                .Pagination(lookup.Page)
                .Ordering(lookup.Order)
                .IsActive(lookup.IsActive)
                .AppliesTo(lookup.AppliesTo)
                .Type(lookup.Type)
                .Like(lookup.Like);
        }

        private FilterDefinition<Data.Tag> ApplyFilters()
        {
            FilterDefinitionBuilder<Data.Tag> filterBuilder = Builders<Data.Tag>.Filter;
            FilterDefinition<Data.Tag> filter = filterBuilder.Empty;

            if (this._userIds != null)
            {
                List<User> users = _userQuery.Ids(this._userIds).IsActive(Common.IsActive.Active).Collect().Result.ToList();
                var tagIdList = users.Select(u => u.AssignedTagIds);

                IEnumerable<Guid> tagIds = tagIdList.First();
                foreach( var l in tagIdList) tagIds = tagIds.Intersect(l);

                filter &= filterBuilder.In(u => u.Id, tagIds);
            }
            if (this._excludedUserIds != null)
            {
                List<User> users = _userQuery.Ids(this._excludedUserIds).IsActive(Common.IsActive.Active).Collect().Result.ToList();
                var tagIdList = users.Select(u => u.AssignedTagIds);

                IEnumerable<Guid> tagIds = tagIdList.SelectMany(t => t.Select(x => x));

                filter &= filterBuilder.Nin(u => u.Id, tagIds);
            }
            if (this._dataObjectIds != null)
            {
                List<DataObject> dataObjects = _dataObjectQuery.Ids(this._dataObjectIds).IsActive(Common.IsActive.Active).Collect().Result.ToList();
                var tagIdList = dataObjects.Select(u => u.AssignedTagIds);

                IEnumerable<Guid> tagIds = tagIdList.First();
                foreach (var l in tagIdList) tagIds = tagIds.Intersect(l);

                filter &= filterBuilder.In(u => u.Id, tagIds);
            }
            if (this._excludedDataObjectIds != null)
            {
                List<DataObject> dataObjects = _dataObjectQuery.Ids(this._excludedDataObjectIds).IsActive(Common.IsActive.Active).Collect().Result.ToList();
                var tagIdList = dataObjects.Select(u => u.AssignedTagIds);

                IEnumerable<Guid> tagIds = tagIdList.SelectMany(t => t.Select(x => x));

                filter &= filterBuilder.Nin(u => u.Id, tagIds);
            }
            if (this._ids != null) filter &= filterBuilder.In(u => u.Id, this._ids);
            if (this._excludedIds != null) filter &= filterBuilder.Nin(u => u.Id, this._excludedIds);
            if (this._isActive != null) filter &= filterBuilder.In(u => u.IsActive, this._isActive);
            if (this._appliesTo != null) filter &= filterBuilder.In(u => u.AppliesTo, this._appliesTo);
            if (this._type != null) filter &= filterBuilder.In(u => u.Type, this._type);
            if (this._like != null)
            {
                string regexp = "/*m*/";
                filter &= filterBuilder.Regex(nameof(Data.Tag.Label), new MongoDB.Bson.BsonRegularExpression(_like, regexp));
            }

            return filter;
        }

        private SortDefinition<Data.Tag> ApplyOrdering()
        {
            SortDefinitionBuilder<Data.Tag> sortBuilder = Builders<Data.Tag>.Sort;
            SortDefinition<Data.Tag> sort = null;

            Type t = typeof(Data.Tag);


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

        public async Task<IEnumerable<Data.Tag>> Collect()
        {
            var res = _mongoDbContext.Find(this.ApplyFilters());

            if (this._order != null) res = res.Sort(this.ApplyOrdering());

            if (this._page != null) res = res.Skip(this._page.Offset).Limit(this._page.Size);

            return await res.ToListAsync();
        }

        public async Task<int> CountAll()
        {
            var res = _mongoDbContext.Find(this.ApplyFilters());

            return (await res.ToListAsync()).Count();
        }
    }
}
