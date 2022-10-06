using Cite.Tools.Exception;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Text;
using MongoDB.Driver;
using MongoDB.Driver.Core.Events;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using System.Threading.Tasks;
using System.Linq.Expressions;
using System;
using MongoDB.Driver.Linq;

namespace Cite.EvalIt.Data.Context
{
    public abstract class MongoDbContext
    {
        protected IMongoDatabase Database { get; private set; }
        protected IClientSessionHandle Session { get; private set; }
        protected IMongoClient Client { get; private set; }
        protected readonly ILogger _logger;

        public MongoDbContext(
            ILogger logger,
            IMongoClient client,
            IMongoDatabase database
            )
        {
            this._logger = logger;
            this.Client = client;
            this.Database = database;
        }

        #region Transaction

        public bool SupportTransaction() => this.Client.Settings.RetryWrites;

        protected IMongoCollection<T> MongoCollection<T>() where T : class => this.Database.GetCollection<T>(System.Text.Json.JsonNamingPolicy.CamelCase.ConvertName(typeof(T).Name));
        public async Task<IClientSessionHandle> StartSessionAsync()
        {
            if (this.Session != null) throw new NotImplementedException("Multiple sessions not implemented");
            this.Session = await this.Client.StartSessionAsync();
            return this.Session;
        }

        public void StartTransaction() => this.Session.StartTransaction();
        public async Task AbortTransactionAsync() => await this.Session.AbortTransactionAsync();
        public async Task CommitTransactionAsync() => await this.Session.CommitTransactionAsync();

        #endregion

        #region Insert 

        public async virtual Task InsertOneAsync<T>(T document) where T : class
        {
            await this.InsertOneAsync(this.MongoCollection<T>(), document);
        }

        public async virtual Task InsertOneAsync<T>(IMongoCollection<T> collection, T document) where T : class
        {
            await this.InsertManyAsync(collection, new[] { document });
        }

        public async virtual Task InsertManyAsync<T>(IMongoCollection<T> collection, IEnumerable<T> document) where T : class
        {
            if (this.Session == null || !this.SupportTransaction()) await collection.InsertManyAsync(document);
            else await collection.InsertManyAsync(this.Session, document);
        }


        #endregion

        #region Replace 

        public async virtual Task ReplaceOneAsync<T>(FilterDefinition<T> filter, T document) where T : class
        {
            await this.ReplaceOneAsync(this.MongoCollection<T>(), filter, document);
        }

        public async virtual Task ReplaceOneAsync<T>(IMongoCollection<T> collection, FilterDefinition<T> filter, T document) where T : class
        {
            filter = this.EnrichFilter(filter);
            if (this.Session == null || !this.SupportTransaction()) await collection.ReplaceOneAsync(filter, document);
            else await collection.ReplaceOneAsync(this.Session, filter, document);
        }

        #endregion

        #region Update

        public async virtual Task UpdateOneAsync<T>(IMongoCollection<T> collection, FilterDefinition<T> filter, UpdateDefinition<T> update) where T : class
        {
            if (this.Session == null || !this.SupportTransaction()) await collection.UpdateOneAsync(filter, update);
            else await collection.UpdateOneAsync(this.Session, filter, update);
        }
        public async virtual Task UpdateManyAsync<T>(FilterDefinition<T> filter, UpdateDefinition<T> update) where T : class
        {
            await this.UpdateManyAsync(this.MongoCollection<T>(), filter, update);
        }

        public async virtual Task UpdateManyAsync<T>(IMongoCollection<T> collection, FilterDefinition<T> filter, UpdateDefinition<T> update) where T : class
        {
            if (this.Session == null || !this.SupportTransaction()) await collection.UpdateManyAsync(filter, update);
            else await collection.UpdateManyAsync(this.Session, filter, update);
        }

        public async virtual Task BulkWriteAsync<T>(List<WriteModel<T>> updates, BulkWriteOptions options) where T : class
        {
            await this.BulkWriteAsync(this.MongoCollection<T>(), updates, options);
        }

        public async virtual Task BulkWriteAsync<T>(IMongoCollection<T> collection, List<WriteModel<T>> updates, BulkWriteOptions options) where T : class
        {
            if (this.Session == null || !this.SupportTransaction()) await collection.BulkWriteAsync(updates, options);
            else await collection.BulkWriteAsync(this.Session, updates, options);
        }

        public async virtual Task DeleteOneAsync<T>(IMongoCollection<T> collection, FilterDefinition<T> filter) where T : class
        {
            filter = this.EnrichFilter(filter);
            if (this.Session == null || !this.SupportTransaction()) await collection.DeleteOneAsync(filter);
            else await collection.DeleteOneAsync(this.Session, filter);
        }


        #endregion

        #region Find

        public async virtual Task<T> FindAsync<T>(FilterDefinition<T> filter) where T : class
        {
            return await this.FindAsync(this.MongoCollection<T>(), filter);
        }

        public async virtual Task<T> FindAsync<T>(IMongoCollection<T> collection, FilterDefinition<T> filter) where T : class
        {
            IAsyncCursor<T> item;
            filter = this.EnrichFilter(filter);
            if (this.Session == null || !this.SupportTransaction()) item = await collection.FindAsync(filter);
            else item = await collection.FindAsync(this.Session, filter);
            return item.FirstOrDefault();
        }

        public virtual IFindFluent<T, T> Find<T>(FilterDefinition<T> filter) where T : class
        {
            return this.Find(this.MongoCollection<T>(), filter);
        }
        public virtual IFindFluent<T, T> Find<T>(IMongoCollection<T> collection, FilterDefinition<T> filter) where T : class
        {
            filter = this.EnrichFilter(filter);
            if (this.Session == null || !this.SupportTransaction()) return collection.Find(filter);
            else return collection.Find(this.Session, filter);
        }

        public virtual IAggregateFluent<T> Aggregate<T>() where T : class
        {
            return this.Aggregate(this.MongoCollection<T>());
        }

        public virtual IAggregateFluent<T> Aggregate<T>(IMongoCollection<T> collection) where T : class
        {
            return collection.Aggregate();
        }


        #endregion

        #region Distinct

        public async virtual Task<List<K>> DistinctAsync<T, K>(FieldDefinition<T, K> field, FilterDefinition<T> filter) where T : class
        {
            return await this.DistinctAsync(this.MongoCollection<T>(), field, filter);
        }

        public async virtual Task<List<K>> DistinctAsync<T, K>(IMongoCollection<T> collection, FieldDefinition<T, K> field, FilterDefinition<T> filter) where T : class
        {
            IAsyncCursor<K> item;
            filter = this.EnrichFilter(filter);
            item = await collection.DistinctAsync(field, filter);
            return await item.ToListAsync();
        }

        public virtual List<K> Distinct<T, K>(FieldDefinition<T, K> field, FilterDefinition<T> filter) where T : class
        {
            return this.Distinct(this.MongoCollection<T>(), field, filter);
        }
        public virtual List<K> Distinct<T, K>(IMongoCollection<T> collection, FieldDefinition<T, K> field, FilterDefinition<T> filter) where T : class
        {
            IAsyncCursor<K> item;
            filter = this.EnrichFilter(filter);
            item = collection.Distinct(field, filter);
            return item.ToList();
        }


        #endregion

        protected virtual FilterDefinition<T> EnrichFilter<T>(FilterDefinition<T> filter) where T : class => filter;


        public virtual IMongoQueryable<T> MongoQueryable<T>() where T : class
        {
            return this.MongoQueryable(this.MongoCollection<T>());
        }

        public virtual IMongoQueryable<T> MongoQueryable<T>(IMongoCollection<T> collection) where T : class
        {
            return collection.AsQueryable();
        }
    }
}