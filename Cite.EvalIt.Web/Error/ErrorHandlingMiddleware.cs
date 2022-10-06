using Cite.EvalIt.Exception;
using Cite.EvalIt.Web.APIKey;
using Cite.Tools.Json;
using Cite.WebTools.Exception.Middleware;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Cite.EvalIt.Web.Error
{
	public class ErrorHandlingMiddleware : Cite.WebTools.Exception.Middleware.ErrorHandlingMiddleware
	{
		private readonly JsonHandlingService _jsonHandlingService;
		private readonly ILogger<ErrorHandlingMiddleware> _logger;

		public ErrorHandlingMiddleware(
			RequestDelegate next,
			JsonHandlingService jsonHandlingService,
			ILogger<ErrorHandlingMiddleware> logger) : base(next, jsonHandlingService, logger)
		{
			this._logger = logger;
			this._jsonHandlingService = jsonHandlingService;
		}

		protected override HandledException HandleException(HttpContext context, System.Exception exception)
		{
			HandledException handled;
			switch (exception)
			{
				case ConsentException ex:
					{
						Object result;

						int code = ex.Code;
						if (code > 0) result = new { code, error = ex.Message };
						else result = new { error = ex.Message };

						handled = new HandledException
						{
							Level = LogLevel.Warning,
							StatusCode = System.Net.HttpStatusCode.UnavailableForLegalReasons,
							Message = this._jsonHandlingService.ToJsonSafe(result)
						};

						break;
					}
				case StaleAPIKeyException ex:
					{
						Object result;

						int code = ex.Code;
						if (code > 0) result = new { code, error = ex.Message };
						else result = new { error = ex.Message };

						handled = new HandledException
						{
							Level = LogLevel.Error,
							StatusCode = System.Net.HttpStatusCode.ServiceUnavailable,
							Message = this._jsonHandlingService.ToJsonSafe(result)
						};

						break;
					}
				case Tools.Exception.MyValidationException ex:
                    {
						Object result;

						int code = ex.Code;
						string serializedErrors = ex.Errors != null ? " " + String.Join(",", ex.Errors.Select(e => e.Key)) : "";

						if (code > 0) result = new { code, error = ex.Message + serializedErrors };
						else result = new { error = ex.Message, ex.Errors };

						handled = new HandledException
						{
							Level = LogLevel.Debug,
							StatusCode = System.Net.HttpStatusCode.BadRequest,
							Message = this._jsonHandlingService.ToJsonSafe(result)
						};
						break;
                    }
				default:
					{
						handled = base.HandleException(context, exception);
						break;
					}
			}

			if (handled.StatusCode == System.Net.HttpStatusCode.InternalServerError)
			{
				this._logger.Log(handled.Level, "thrown exception payload: {serialization}", handled.Message);
				handled.Message = "An unexpected error has occured. We are working on resolving it";
			}

			return handled;
		}
	}
}
