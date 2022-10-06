using Cite.EvalIt.Common;
using Cite.EvalIt.Data.Context;
using Cite.EvalIt.Query;
using Cite.Tools.Data.Deleter;
using Cite.Tools.Data.Query;
using Cite.Tools.Exception;
using Cite.Tools.Logging;
using Cite.Tools.Logging.Extensions;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Cite.EvalIt.Model
{
	public class TagDeleter : IDeleter
	{
		private readonly AppMongoDbContext _mongoDatabase;
		private readonly UserQuery _userQuery;
		private readonly DataObjectQuery _dataObjectQuery;
		private readonly ILogger<UserDeleter> _logger;

		public TagDeleter(
			AppMongoDbContext mongoDatabase,
			UserQuery userQuery,
			DataObjectQuery dataObjectQuery,
			ILogger<UserDeleter> logger)
		{
			this._logger = logger;
			this._mongoDatabase = mongoDatabase;
			this._userQuery = userQuery;
			this._dataObjectQuery = dataObjectQuery;
		}

		public async Task DeleteAndSave(IEnumerable<Guid> ids)
        {
            this._logger.Debug(new MapLogEntry("collecting to delete").And("count", ids?.Count()).And("ids", ids));

            DateTime updateTime = DateTime.UtcNow;

			// TODO: Maybe Unassign tag from all users and objects before deletion
			// For now, abort deletion if tag assigned to a user or object
			if ((await _userQuery.IsActive(IsActive.Active).TagIds(ids).Collect()).Any()) throw new MyApplicationException("Cannot delete tag, is already assigned to a User");
			if ((await _dataObjectQuery.IsActive(IsActive.Active).TagIds(ids).Collect()).Any()) throw new MyApplicationException("Cannot delete tag, is already assigned to an Object");


			FilterDefinition<Data.Tag> filter = Builders<Data.Tag>.Filter.In(u => u.Id, ids);
            UpdateDefinition<Data.Tag> update = Builders<Data.Tag>.Update.Set(u => u.IsActive, IsActive.Inactive)
                                                                         .Set(u => u.UpdatedAt, updateTime);

            await _mongoDatabase.UpdateManyAsync(filter, update);
        }
    }
}
