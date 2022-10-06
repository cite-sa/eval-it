using Cite.EvalIt.Common;
using Cite.EvalIt.Data.Context;
using Cite.EvalIt.Query;
using Cite.Tools.Data.Deleter;
using Cite.Tools.Data.Query;
using Cite.Tools.Logging;
using Cite.Tools.Logging.Extensions;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Cite.EvalIt.Model
{
	public class DataObjectDeleter : IDeleter
	{
		private readonly AppMongoDbContext _mongoDatabase;
		private readonly ILogger<DataObjectDeleter> _logger;

		public DataObjectDeleter(
			AppMongoDbContext mongoDatabase,
			ILogger<DataObjectDeleter> logger)
		{
			this._logger = logger;
			this._mongoDatabase = mongoDatabase;
		}

		public async Task DeleteAndSave(IEnumerable<Guid> ids)
        {
            this._logger.Debug(new MapLogEntry("collecting to delete").And("count", ids?.Count()).And("ids", ids));

            DateTime updateTime = DateTime.UtcNow;

            FilterDefinition<Data.DataObject> filter = Builders<Data.DataObject>.Filter.In(u => u.Id, ids);
            UpdateDefinition<Data.DataObject> update = Builders<Data.DataObject>.Update.Set(u => u.IsActive, IsActive.Inactive)
                                                                                     .Set(u => u.UpdatedAt, updateTime);

            await _mongoDatabase.UpdateManyAsync(filter, update);
        }
    }
}
