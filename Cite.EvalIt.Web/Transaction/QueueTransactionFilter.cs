using Cite.EvalIt.Data.Context;
using Cite.WebTools.Data.Transaction;
using Microsoft.Extensions.Logging;

namespace Cite.EvalIt.Web.Transaction
{
	public class QueueTransactionFilter : TransactionFilter
	{
		public QueueTransactionFilter(
			AppDbContext dbContext,
			ILogger<QueueTransactionFilter> logger) : base(dbContext, logger)
		{
		}
	}
}
