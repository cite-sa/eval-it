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
	public class DataObjectReviewCensor : Censor
	{
		private readonly CensorFactory _censorFactory;
		private readonly IAuthorizationService _authService;
		private readonly ILogger<DataObjectReviewCensor> _logger;

		public DataObjectReviewCensor(
			CensorFactory censorFactory,
			IAuthorizationService authService,
			ILogger<DataObjectReviewCensor> logger)
		{
			this._logger = logger;
			this._censorFactory = censorFactory;
			this._authService = authService;
		}

		public async Task Censor(IFieldSet fields, Guid? userId = null)
		{
			this._logger.Debug(new DataLogEntry("censoring fields", fields));
			if (this.IsEmpty(fields)) return;
			await this._authService.AuthorizeOrOwnerForce(userId.HasValue ? new OwnedResource(userId.Value) : null, Permission.BrowseDataObjectReview);
			IFieldSet typeFields = fields.ExtractPrefixed(nameof(DataObjectReview.DataObjectType).AsIndexerPrefix());
			await this._censorFactory.Censor<DataObjectTypeCensor>().Censor(typeFields, userId);

			IFieldSet feedbackFields = fields.ExtractPrefixed(nameof(DataObjectReview.Feedback).AsIndexerPrefix());
			await this._censorFactory.Censor<DataObjectReviewFeedbackCensor>().Censor(feedbackFields, userId);

		}
	}
}
