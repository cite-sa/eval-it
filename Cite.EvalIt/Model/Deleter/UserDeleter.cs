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
	public class UserDeleter : IDeleter
	{
		private readonly AppMongoDbContext _mongoDatabase;
		private readonly UserQuery _userQuery;
		private readonly ILogger<UserDeleter> _logger;

		public UserDeleter(
			AppMongoDbContext mongoDatabase,
			UserQuery userQuery,
			ILogger<UserDeleter> logger)
		{
			this._logger = logger;
			this._userQuery = userQuery;
			this._mongoDatabase = mongoDatabase;
		}

		public async Task DeleteAndSave(IEnumerable<Guid> ids)
        {
            this._logger.Debug(new MapLogEntry("collecting to delete").And("count", ids?.Count()).And("ids", ids));

            DateTime updateTime = DateTime.UtcNow;

			IEnumerable<Data.User> users = await this._userQuery.IsActive(IsActive.Active).NetworkIds(ids).Collect();

			var updates = new List<WriteModel<Data.User>>();
			foreach(var user in users)
            {
				user.UserNetworkIds = user.UserNetworkIds.Where(n => !ids.Contains(n.Id));
				user.UpdatedAt = updateTime;

				FilterDefinition<Data.User> networkFilter = Builders<Data.User>.Filter.Eq(u => u.Id, user.Id);
				updates.Add(new ReplaceOneModel<Data.User>(networkFilter, user));
            }

			await _mongoDatabase.BulkWriteAsync(updates, new BulkWriteOptions() { IsOrdered = false });

			FilterDefinition<Data.User> filter = Builders<Data.User>.Filter.In(u => u.Id, ids);
            UpdateDefinition<Data.User> update = Builders<Data.User>.Update.Set(u => u.IsActive, IsActive.Inactive)
                                                                                     .Set(u => u.UpdatedAt, updateTime);

            await _mongoDatabase.UpdateManyAsync(filter, update);
        }
    }
}
