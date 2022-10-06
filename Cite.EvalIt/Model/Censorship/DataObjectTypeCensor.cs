using Cite.EvalIt.Authorization;
using Cite.Tools.Common.Extensions;
using Cite.Tools.Data.Censor;
using Cite.Tools.FieldSet;
using Cite.Tools.Logging;
using Cite.Tools.Logging.Extensions;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Cite.EvalIt.Model
{
	public class DataObjectTypeCensor : Censor
	{
		private readonly IAuthorizationService _authService;
		private readonly ILogger<DataObjectTypeCensor> _logger;

		public DataObjectTypeCensor(
			IAuthorizationService authService,
			ILogger<DataObjectTypeCensor> logger)
		{
			this._logger = logger;
			this._authService = authService;
		}

		public async Task Censor(IFieldSet fields, Guid? userId = null)
		{
			this._logger.Debug(new DataLogEntry("censoring fields", fields));
			if (this.IsEmpty(fields)) return;
			await this._authService.AuthorizeOrOwnerForce(userId.HasValue ? new OwnedResource(userId.Value) : null, Permission.BrowseDataObjectType);
		}
	}
}
