using Cite.EvalIt.Common.Validation;
using Cite.EvalIt.Convention;
using Cite.EvalIt.ErrorCode;
using Cite.Tools.Common.Extensions;
using Cite.Tools.Validation;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.Model
{
	public class UserProfile
	{
		public String Timezone { get; set; }
		public String Culture { get; set; }
		public String Language { get; set; }
	}

	public class UserProfilePersist
	{
		public String Timezone { get; set; }
		public String Culture { get; set; }
		public String Language { get; set; }

		//TODO: Here we could validate the language based on the supported ones. Take this under consideration also in the NotificationMessageBuilders where we use the language to retrieve templates
		public class Validator : BaseValidator<UserProfilePersist>
		{
			private readonly static int TimezoneMaxLenth = typeof(Data.UserProfile).MaxLengthOf(nameof(Data.UserProfile.Timezone));
			private readonly static int LanguageMaxLenth = typeof(Data.UserProfile).MaxLengthOf(nameof(Data.UserProfile.Language));

			public Validator(
				IConventionService conventionService,
				IStringLocalizer<Resources.MySharedResources> localizer,
				ValidatorFactory validatorFactory,
				ILogger<Validator> logger,
				ErrorThesaurus errors) : base(conventionService, validatorFactory, logger, errors)
			{
				this._localizer = localizer;
			}

			private readonly IStringLocalizer<Resources.MySharedResources> _localizer;

			protected override IEnumerable<ISpecification> Specifications(UserProfilePersist item)
			{
				return new ISpecification[]{
					//timezone must always be set
					this.Spec()
						.Must(() => !this.IsEmpty(item.Timezone))
						.FailOn(nameof(UserProfilePersist.Timezone)).FailWith(this._localizer["Validation_Required", nameof(UserProfilePersist.Timezone)]),
					//timezone max length
					this.Spec()
						.If(() => !this.IsEmpty(item.Timezone))
						.Must(() => item.Timezone.Length <= Validator.TimezoneMaxLenth)
						.FailOn(nameof(UserProfilePersist.Timezone)).FailWith(this._localizer["Validation_MaxLength", nameof(UserProfilePersist.Timezone)]),
					//timezone must be valid
					this.Spec()
						.If(() => !this.IsEmpty(item.Timezone))
						.Must(() => this.IsValidTimezone(item.Timezone))
						.FailOn(nameof(UserProfilePersist.Timezone)).FailWith(this._localizer["Validation_UnexpectedValue", nameof(UserProfilePersist.Timezone)]),
					//language must always be set
					this.Spec()
						.Must(() => !this.IsEmpty(item.Language))
						.FailOn(nameof(UserProfilePersist.Language)).FailWith(this._localizer["Validation_Required", nameof(UserProfilePersist.Language)]),
					//language max length
					this.Spec()
						.If(() => !this.IsEmpty(item.Language))
						.Must(() => item.Language.Length <= Validator.LanguageMaxLenth)
						.FailOn(nameof(UserProfilePersist.Language)).FailWith(this._localizer["Validation_MaxLength", nameof(UserProfilePersist.Language)]),
					//culture must always be set
					this.Spec()
						.Must(() => !this.IsEmpty(item.Culture))
						.FailOn(nameof(UserProfilePersist.Culture)).FailWith(this._localizer["Validation_Required", nameof(UserProfilePersist.Culture)]),
					//culture must be valid
					this.Spec()
						.If(() => !this.IsEmpty(item.Culture))
						.Must(() => this.IsValidCulture(item.Culture))
						.FailOn(nameof(UserProfilePersist.Culture)).FailWith(this._localizer["Validation_UnexpectedValue", nameof(UserProfilePersist.Culture)])
				};
			}
		}
	}

	public class UserProfileIntegrationPersist
	{
		public Guid? Id { get; set; }
		public String Timezone { get; set; }
		public String Culture { get; set; }
		public String Language { get; set; }

		//TODO: Here we could validate the language based on the supported ones. Take this under consideration also in the NotificationMessageBuilders where we use the language to retrieve templates
		public class Validator : BaseValidator<UserProfileIntegrationPersist>
		{
			private readonly static int TimezoneMaxLenth = typeof(Data.UserProfile).MaxLengthOf(nameof(Data.UserProfile.Timezone));
			private readonly static int LanguageMaxLenth = typeof(Data.UserProfile).MaxLengthOf(nameof(Data.UserProfile.Language));

			public Validator(
				IConventionService conventionService,
				IStringLocalizer<Resources.MySharedResources> localizer,
				ValidatorFactory validatorFactory,
				ILogger<Validator> logger,
				ErrorThesaurus errors) : base(conventionService, validatorFactory, logger, errors)
			{
				this._localizer = localizer;
			}

			private readonly IStringLocalizer<Resources.MySharedResources> _localizer;

			protected override IEnumerable<ISpecification> Specifications(UserProfileIntegrationPersist item)
			{
				return new ISpecification[]{				
					//timezone must always be set
					this.Spec()
						.Must(() => !this.IsEmpty(item.Timezone))
						.FailOn(nameof(UserProfileIntegrationPersist.Timezone)).FailWith(this._localizer["Validation_Required", nameof(UserProfileIntegrationPersist.Timezone)]),
					//timezone max length
					this.Spec()
						.If(() => !this.IsEmpty(item.Timezone))
						.Must(() => item.Timezone.Length <= Validator.TimezoneMaxLenth)
						.FailOn(nameof(UserProfileIntegrationPersist.Timezone)).FailWith(this._localizer["Validation_MaxLength", nameof(UserProfileIntegrationPersist.Timezone)]),
					//timezone must be valid
					this.Spec()
						.If(() => !this.IsEmpty(item.Timezone))
						.Must(() => this.IsValidTimezone(item.Timezone))
						.FailOn(nameof(UserProfileIntegrationPersist.Timezone)).FailWith(this._localizer["Validation_UnexpectedValue", nameof(UserProfileIntegrationPersist.Timezone)]),
					//language must always be set
					this.Spec()
						.Must(() => !this.IsEmpty(item.Language))
						.FailOn(nameof(UserProfileIntegrationPersist.Language)).FailWith(this._localizer["Validation_Required", nameof(UserProfileIntegrationPersist.Language)]),
					//language max length
					this.Spec()
						.If(() => !this.IsEmpty(item.Language))
						.Must(() => item.Language.Length <= Validator.LanguageMaxLenth)
						.FailOn(nameof(UserProfileIntegrationPersist.Language)).FailWith(this._localizer["Validation_MaxLength", nameof(UserProfileIntegrationPersist.Language)]),
					//culture must always be set
					this.Spec()
						.Must(() => !this.IsEmpty(item.Culture))
						.FailOn(nameof(UserProfileIntegrationPersist.Culture)).FailWith(this._localizer["Validation_Required", nameof(UserProfileIntegrationPersist.Culture)]),
					//culture must be valid
					this.Spec()
						.If(() => !this.IsEmpty(item.Culture))
						.Must(() => this.IsValidCulture(item.Culture))
						.FailOn(nameof(UserProfileIntegrationPersist.Culture)).FailWith(this._localizer["Validation_UnexpectedValue", nameof(UserProfileIntegrationPersist.Culture)])
				};
			}
		}
	}
}
