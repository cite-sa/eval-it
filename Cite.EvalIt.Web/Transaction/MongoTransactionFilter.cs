using Cite.EvalIt.Data.Context;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace Cite.EvalIt.Web.Transaction
{
    public class MongoTransactionFilter : Attribute, IAsyncActionFilter, IOrderedFilter
    {
        private MongoDbContext _dbContext;
        private ILogger _logging;

        public MongoTransactionFilter(
            MongoDbContext dbContext,
            ILogger logging)
        {
            this._dbContext = dbContext;
            this._logging = logging;
        }

        public int Order { get; set; }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            if (this._dbContext.SupportTransaction())
            {
                using (var session = await this._dbContext.StartSessionAsync())
                {
                    try
                    {
                        try
                        {
                            this._dbContext.StartTransaction();
                        }
                        catch(System.NotSupportedException ex)
                        {
                            this._logging.LogTrace("transactions not supported; ", ex);
                            await next();
                            return;
                        }

                        this._logging.LogTrace("begin transaction");
                        var resultContext = await next();
                        if (resultContext.Exception == null)
                        {
                            this._logging.LogTrace("commit transaction");
                            await this._dbContext.CommitTransactionAsync();
                        }
                        else
                        {
                            this._logging.LogDebug("rollback transaction");
                            await this._dbContext.AbortTransactionAsync();
                        }
                    }
                    catch (System.Exception)
                    {
                        this._logging.LogDebug("rollback transaction");
                        await this._dbContext.AbortTransactionAsync();
                        throw;
                    }
                }

            }
            else
            {
                await next();
            }
        }
    }
}