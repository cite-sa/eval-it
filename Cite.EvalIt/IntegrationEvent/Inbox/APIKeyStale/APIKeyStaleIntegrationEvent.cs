using Cite.EvalIt.ErrorCode;
using Cite.EvalIt.Convention;
using Cite.EvalIt.Common.Validation;
using Cite.Tools.Validation;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.IntegrationEvent.Inbox
{
	public class APIKeyStaleIntegrationEvent : TrackedEvent
	{
		public Guid? UserId { get; set; }
		public String KeyHash { get; set; }
	}

	public class APIKeyStaleIntegrationEventValidatingModel
	{
		public Guid? UserId { get; set; }
		public String KeyHash { get; set; }

		public class Validator : BaseValidator<APIKeyStaleIntegrationEventValidatingModel>
		{
			public Validator(
				IConventionService conventionService,
				IStringLocalizer<Cite.EvalIt.Resources.MySharedResources> localizer,
				ValidatorFactory validatorFactory,
				ILogger<Validator> logger,
				ErrorThesaurus errors) : base(conventionService, validatorFactory, logger, errors)
			{
				this._localizer = localizer;
			}

			private readonly IStringLocalizer<EvalIt.Resources.MySharedResources> _localizer;

			protected override IEnumerable<ISpecification> Specifications(APIKeyStaleIntegrationEventValidatingModel item)
			{
				return new ISpecification[]{
                    //user must always be set
                    this.Spec()
						.Must(() => this.IsValidGuid(item.UserId))
						.FailOn(nameof(APIKeyStaleIntegrationEventValidatingModel.UserId)).FailWith(this._localizer["Validation_Required", nameof(APIKeyStaleIntegrationEventValidatingModel.UserId)]),
					this.Spec()
						.Must(() => !this.IsEmpty(item.KeyHash))
						.FailOn(nameof(APIKeyStaleIntegrationEventValidatingModel.KeyHash)).FailWith(this._localizer["Validation_Required", nameof(APIKeyStaleIntegrationEventValidatingModel.KeyHash)]),
				};
			}
		}
	}
}
