using Cite.EvalIt.Common;
using Cite.EvalIt.Common.Validation;
using Cite.EvalIt.Convention;
using Cite.EvalIt.ErrorCode;
using Cite.Tools.Validation;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.Model
{
	public class User
	{
		public Guid? Id { get; set; }
		public string Name { get; set; }
		public IsActive? IsActive { get; set; }
		public DateTime? CreatedAt { get; set; }
		public DateTime? UpdatedAt { get; set; }
		public String Hash { get; set; }
		public UserProfile Profile { get; set; }
		public bool? IsNetworkCandidate { get; set; }
		public IEnumerable<Tag> AssignedTagIds { get; set; }
		public IEnumerable<UserWithRelationshipModel> UserNetworkIds { get; set; }
	}

	public class UserTouchedIntegrationEventPersist
	{
		public Guid? Id { get; set; }
		public string Name { get; set; }
		public UserProfileIntegrationPersist Profile { get; set; }


		public class UserTouchedIntegrationEventValidator : BaseValidator<UserTouchedIntegrationEventPersist>
		{
			public UserTouchedIntegrationEventValidator(
				IConventionService conventionService,
				IStringLocalizer<Resources.MySharedResources> localizer,
				ValidatorFactory validatorFactory,
				ILogger<UserTouchedIntegrationEventValidator> logger,
				ErrorThesaurus errors) : base(conventionService, validatorFactory, logger, errors)
			{
				this._localizer = localizer;
			}

			private readonly IStringLocalizer<Resources.MySharedResources> _localizer;

			protected override IEnumerable<ISpecification> Specifications(UserTouchedIntegrationEventPersist item)
			{
				return new ISpecification[]{
					//id must be set
					this.Spec()
						.Must(() => item.Id.HasValue && this.IsValidGuid(item.Id))
						.FailOn(nameof(UserTouchedIntegrationEventPersist.Id)).FailWith(this._localizer["Validation_Required", nameof(UserTouchedIntegrationEventPersist.Id)]),
					//name must be non-empty
					this.Spec()
						.Must(() => item.Name.Length > 0 )
						.FailOn(nameof(UserTouchedIntegrationEventPersist.Name)).FailWith(this._localizer["Validation_Required", nameof(UserTouchedIntegrationEventPersist.Name)]),
					//profile must be set
					this.Spec()
						.Must(() => item.Profile != null)
						.FailOn(nameof(UserTouchedIntegrationEventPersist.Profile)).FailWith(this._localizer["Validation_Required", nameof(UserTouchedIntegrationEventPersist.Profile)]),
					//profile internal validation
					this.RefSpec()
						.If(() => item.Profile != null)
						.On(nameof(UserTouchedIntegrationEventPersist.Profile))
						.Over(item.Profile)
						.Using(() => this._validatorFactory[typeof(UserProfileIntegrationPersist.Validator)])
				};
			}
		}
	}
}
