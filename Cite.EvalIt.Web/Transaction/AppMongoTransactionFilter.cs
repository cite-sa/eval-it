using Cite.EvalIt.Data.Context;
using Microsoft.Extensions.Logging;

namespace Cite.EvalIt.Web.Transaction
{
	public class AppMongoTransactionFilter : MongoTransactionFilter
	{
		public AppMongoTransactionFilter(
			AppMongoDbContext dbContext,
			ILogger<AppMongoTransactionFilter> logger) : base(dbContext, logger)
		{
		}
	}
}
