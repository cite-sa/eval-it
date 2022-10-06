using Microsoft.Extensions.Logging;
using MongoDB.Driver;

namespace Cite.EvalIt.Data.Context
{
	public class AppMongoDbContext : MongoDbContext
	{
        public AppMongoDbContext(
            ILogger<AppMongoDbContext> logger,
            IMongoClient client,
            IMongoDatabase database
            ) : base(logger, client, database)
        { }
	}
}
