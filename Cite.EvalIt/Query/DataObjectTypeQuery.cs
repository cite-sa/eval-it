using Cite.EvalIt.Common;
using Cite.EvalIt.Data.Context;
using Cite.Tools.Common.Extensions;
using Cite.Tools.Data.Query;
using Microsoft.EntityFrameworkCore;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Cite.EvalIt.Query
{
    public class DataObjectTypeQuery
    {
        private List<Guid> _ids { get; set; }
        private List<Guid> _excludedIds { get; set; }
        private List<IsActive> _isActive { get; set; }
        private Paging _page { get; set; }
        private Ordering _order { get; set; }
        private string _like { get; set; }

        private bool _distinct { get; set; }

        public DataObjectTypeQuery Ids(IEnumerable<Guid> ids) { this._ids = this.ToList(ids); return this; }
        public DataObjectTypeQuery Ids(Guid id) { this._ids = this.ToList(id.AsArray()); return this; }
        public DataObjectTypeQuery ExcludedIds(IEnumerable<Guid> excludedIds) { this._excludedIds = this.ToList(excludedIds); return this; }
        public DataObjectTypeQuery ExcludedIds(Guid excludedId) { this._excludedIds = this.ToList(excludedId.AsArray()); return this; }
        public DataObjectTypeQuery IsActive(IEnumerable<IsActive> isActive) { this._isActive = this.ToList(isActive); return this; }
        public DataObjectTypeQuery IsActive(IsActive isActive) { this._isActive = this.ToList(isActive.AsArray()); return this; }
        public DataObjectTypeQuery Like(string like) { this._like = like?.Substring(0, like.Length - 1); return this; } // Remove % suffix from like string, not needed in mongo
        public DataObjectTypeQuery AsDistinct() { this._distinct = true; return this; }
        public DataObjectTypeQuery AsNotDistinct() { this._distinct = false; return this; }
        public DataObjectTypeQuery Pagination(Paging page) { this._page = page; return this; }
        public DataObjectTypeQuery Ordering(Ordering order) { this._order = order; return this; }

        private List<V> ToList<V>(IEnumerable<V> items)
        {
            if (items == null) return null;
            return items.ToList();
        }

        public DataObjectTypeQuery(AppMongoDbContext mongoDatabase)
        {
            this._mongoDatabase = mongoDatabase;
        }

        private readonly AppMongoDbContext _mongoDatabase;

        public void SetParameters(DataObjectTypeLookup lookup)
        {
            this.Ids(lookup.Ids)
                .ExcludedIds(lookup.ExcludedIds)
                .Pagination(lookup.Page)
                .Ordering(lookup.Order)
                .IsActive(lookup.IsActive)
                .Like(lookup.Like);
        }

        private FilterDefinition<Data.DataObjectType> ApplyFilters()
        {
            FilterDefinitionBuilder<Data.DataObjectType> filterBuilder = Builders<Data.DataObjectType>.Filter;
            FilterDefinition<Data.DataObjectType> filter = filterBuilder.Empty;

            if (this._ids != null) filter &= filterBuilder.In(o => o.Id, this._ids);
            if (this._excludedIds != null) filter &= filterBuilder.Nin(o => o.Id, this._excludedIds);
            if (this._isActive != null) filter &= filterBuilder.In(o => o.IsActive, this._isActive);
            if (this._like != null)
            {
                string regexp = "/*m*/";
                filter &= filterBuilder.Regex(nameof(Data.DataObjectType.Name), new MongoDB.Bson.BsonRegularExpression(_like, regexp));
            }

            return filter;
        }

        private SortDefinition<Data.DataObjectType> ApplyOrdering()
        {
            SortDefinitionBuilder<Data.DataObjectType> sortBuilder = Builders<Data.DataObjectType>.Sort;
            SortDefinition<Data.DataObjectType> sort = null;

            Type t = typeof(Data.DataObjectType);

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

        public async Task<IEnumerable<Data.DataObjectType>> Collect()
        {
            var res = _mongoDatabase.Find(this.ApplyFilters());

            if (this._order != null) res = res.Sort(this.ApplyOrdering());

            if (this._page != null) res = res.Skip(this._page.Offset).Limit(this._page.Size);

            return await res.ToListAsync();
        }

        public async Task<int> CountAll()
        {
            var res = _mongoDatabase.Find(this.ApplyFilters());

            return (await res.ToListAsync()).Count();
        }
    }
}
