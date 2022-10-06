using Cite.EvalIt.Common;
using Cite.EvalIt.Data.Context;
using Cite.EvalIt.Query;
using Cite.Tools.Data.Deleter;
using Cite.Tools.Exception;
using Cite.Tools.Logging;
using Cite.Tools.Logging.Extensions;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Cite.EvalIt.Model
{
	public class DataObjectTypeDeleter : IDeleter
	{
		private readonly AppMongoDbContext _mongoDatabase;
		private readonly ILogger<DataObjectTypeDeleter> _logger;
		private readonly DataObjectQuery _objectQuery;

		public DataObjectTypeDeleter(
			DataObjectQuery objectQuery,
			AppMongoDbContext mongoDatabase,
			ILogger<DataObjectTypeDeleter> logger)
		{
			this._logger = logger;
			this._objectQuery = objectQuery;
			this._mongoDatabase = mongoDatabase;
		}

		public async Task DeleteAndSave(IEnumerable<Guid> ids)
        {
            this._logger.Debug(new MapLogEntry("collecting to delete").And("count", ids?.Count()).And("ids", ids));

            DateTime updateTime = DateTime.UtcNow;

            FilterDefinition<Data.DataObjectType> filter = Builders<Data.DataObjectType>.Filter.In(u => u.Id, ids);
            UpdateDefinition<Data.DataObjectType> update = Builders<Data.DataObjectType>.Update.Set(u => u.IsActive, IsActive.Inactive)
                                                                                     .Set(u => u.UpdatedAt, updateTime);

			// Abort deletion if type assigned to object
			if ((await _objectQuery.TypeIds(ids).IsActive(IsActive.Active).Collect()).Any()) throw new MyValidationException("Cannot delete a type that is assigned to an Object");

			await _mongoDatabase.UpdateManyAsync(filter, update);
        }
    }
}
