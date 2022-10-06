using Cite.EvalIt.Common;
using Cite.EvalIt.Common.Validation;
using Cite.EvalIt.Convention;
using Cite.EvalIt.ErrorCode;
using Cite.Tools.Validation;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.Model
{
	public class Tag
	{
		public Guid Id { get; set; }
		public TagType Type { get; set; }
		public TagAppliesTo AppliesTo { get; set; }
		public string Label { get; set; }
		public IsActive IsActive { get; set; }
		public DateTime CreatedAt { get; set; }
		public DateTime UpdatedAt { get; set; }
		public String Hash { get; set; }
		public List<Model.User> AssociatedUsers { get; set; }
		public List<Model.DataObject> AssociatedDataObjects { get; set; }
	}

	public class TagPersist
    {
		public Guid? Id { get; set; }
		public TagType Type { get; set; }
		public TagAppliesTo AppliesTo { get; set; }
		public string Label { get; set; }
		public String Hash { get; set; }

		public class TagPersistValidator : BaseValidator<TagPersist>
		{
			public TagPersistValidator(
				IConventionService conventionService,
				IStringLocalizer<Resources.MySharedResources> localizer,
				ValidatorFactory validatorFactory,
				ILogger<TagPersist> logger,
				ErrorThesaurus errors) : base(conventionService, validatorFactory, logger, errors)
			{
				this._localizer = localizer;
			}

			private readonly IStringLocalizer<Resources.MySharedResources> _localizer;

			protected override IEnumerable<ISpecification> Specifications(TagPersist item)
			{
				return new ISpecification[]{
					//id must be valid guid or null
					this.Spec()
                        .Must(() => !(item.Id.HasValue) || ( item.Id.HasValue && this.IsValidGuid(item.Id)) )
                        .FailOn(nameof(TagPersist.Id)).FailWith(this._localizer["Validation_Required", nameof(TagPersist.Id)]),
					//label must be non-empty & up to 250 characters
					this.Spec()
                        .Must(() => (item.Label.Length > 0) && (item.Label.Length <= 250) )
                        .FailOn(nameof(TagPersist.Label)).FailWith(this._localizer["Validation_Required", nameof(TagPersist.Label)]),
					//tagtype enum must be vaild
					this.Spec()
                        .Must(() => Enum.IsDefined(typeof(TagType),item.Type) )
                        .FailOn(nameof(TagPersist.Type)).FailWith(this._localizer["Validation_Required", nameof(TagPersist.Type)]),
					//tagappliesto enum must be vaild
					this.Spec()
						.Must(() => Enum.IsDefined(typeof(TagAppliesTo),item.AppliesTo) )
						.FailOn(nameof(TagPersist.AppliesTo)).FailWith(this._localizer["Validation_Required", nameof(TagPersist.AppliesTo)]),

				};
			}
		}
	}
	
	public class TagSetPersist
    {
		public List<Guid> TagIds { get; set; }
		
		public class TagAssignPersistValidator : BaseValidator<TagSetPersist>
        {
			public TagAssignPersistValidator(
			   IConventionService conventionService,
			   IStringLocalizer<Resources.MySharedResources> localizer,
			   ValidatorFactory validatorFactory,
			   ILogger<TagSetPersist> logger,
			   ErrorThesaurus errors) : base(conventionService, validatorFactory, logger, errors)
			{
				this._localizer = localizer;
			}

			private readonly IStringLocalizer<Resources.MySharedResources> _localizer;

			protected override IEnumerable<ISpecification> Specifications(TagSetPersist item)
			{
				return new ISpecification[]{
					//id must be valid guid or null
					this.Spec()
						.Must(() => item.TagIds.TrueForAll(id => this.IsValidGuid(id)) )
						.FailOn(nameof(TagSetPersist.TagIds)).FailWith(this._localizer["Validation_Required", nameof(TagSetPersist.TagIds)]),
				};
			}
		}
	}
}
