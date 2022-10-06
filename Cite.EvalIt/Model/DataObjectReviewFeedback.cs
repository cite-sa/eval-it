using Cite.EvalIt.Common;
using Cite.EvalIt.Common.Validation;
using Cite.EvalIt.Convention;
using Cite.EvalIt.ErrorCode;
using Cite.Tools.Validation;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using static Cite.EvalIt.Model.FeedbackDataPersist;

namespace Cite.EvalIt.Model
{
	public class DataObjectReviewFeedback
	{
		[BsonId]
		[BsonIgnoreIfDefault]
        public Guid Id { get; set; }
		public ReviewAnonymity Anonymity { get; set; }
		public ReviewVisibility Visibility { get; set; }
		public string UserIdHash { get; set; }
		public Guid? UserId { get; set; }
		public User User { get; set; }
		public Guid DataObjectReviewId { get; set; }
		public DataObjectReview DataObjectReview { get; set; }
		public IsActive IsActive { get; set; }
        public FeedbackData FeedbackData { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
		public bool IsMine { get; set; }
		public bool CanEdit { get; set; }
		public String Hash { get; set; }
	}

	public class DataObjectReviewFeedbackPersist
	{
		public Guid? Id { get; set; }
		public ReviewAnonymity Anonymity { get; set; }
		public ReviewVisibility Visibility { get; set; }
		public Guid DataObjectId { get; set; }
		public Guid DataObjectReviewId { get; set; }
		public string UserIdHash { get; set; }
		public Guid? UserId { get; set; }
		public FeedbackDataPersist FeedbackData { get; set; }
		public String Hash { get; set; }
		public class DataObjectReviewFeedbackPersistValidator : BaseValidator<DataObjectReviewFeedbackPersist>
		{
			public DataObjectReviewFeedbackPersistValidator(
				IConventionService conventionService,
				IStringLocalizer<Resources.MySharedResources> localizer,
				ValidatorFactory validatorFactory,
				ILogger<DataObjectReviewPersist> logger,
				ErrorThesaurus errors) : base(conventionService, validatorFactory, logger, errors)
			{
				this._localizer = localizer;
			}

			private readonly IStringLocalizer<Resources.MySharedResources> _localizer;
			private bool UserDataValidation(DataObjectReviewFeedbackPersist item)
			{
				return this.IsValidGuid(item.UserId) || (item.UserId == null && !string.IsNullOrEmpty(item.UserIdHash));
			}

			private bool VisibilityAnonymityValidation(DataObjectReviewFeedbackPersist item)
			{
				if (item.Anonymity == ReviewAnonymity.Anonymous && item.Visibility != ReviewVisibility.Public) return false;
				return true;
			}

			private bool ValidateFeedbackData(DataObjectReviewFeedbackPersist item)
            {
				if (item.FeedbackData == null) return false;
				this._validatorFactory.Validator<FeedbackDataPersistValidator>().ValidateForce(item.FeedbackData);
				return true;
            }

			protected override IEnumerable<ISpecification> Specifications(DataObjectReviewFeedbackPersist item)
			{
				return new ISpecification[]{
					//id must be valid guid or null
					this.Spec()
						.Must(() => !(item.Id.HasValue) || ( item.Id.HasValue && this.IsValidGuid(item.Id)) )
						.FailOn(nameof(DataObjectReviewFeedbackPersist.Id)).FailWith(this._localizer["Validation_Required", nameof(DataObjectReviewFeedbackPersist.Id)]),
					//ReviewAnonymity enum must be vaild
					this.Spec()
						.Must(() => Enum.IsDefined(typeof(ReviewAnonymity),item.Anonymity) )
						.FailOn(nameof(DataObjectReviewFeedbackPersist.Anonymity)).FailWith(this._localizer["Validation_Required", nameof(DataObjectReviewFeedbackPersist.Anonymity)]),
					//ReviewVisibility enum must be vaild
					this.Spec()
						.Must(() => Enum.IsDefined(typeof(ReviewVisibility),item.Visibility) && this.VisibilityAnonymityValidation(item) )
						.FailOn(nameof(DataObjectReviewFeedbackPersist.Visibility)).FailWith(this._localizer["Validation_Required", nameof(DataObjectReviewFeedbackPersist.Visibility)]),
					//objectid must be valid guid 
					this.Spec()
						.Must(() =>  this.IsValidGuid(item.DataObjectId) )
						.FailOn(nameof(DataObjectReviewFeedbackPersist.DataObjectId)).FailWith(this._localizer["Validation_Required", nameof(DataObjectReviewFeedbackPersist.DataObjectId)]),
					//review must be valid guid 
					this.Spec()
						.Must(() =>  this.IsValidGuid(item.DataObjectReviewId) )
						.FailOn(nameof(DataObjectReviewFeedbackPersist.DataObjectReviewId)).FailWith(this._localizer["Validation_Required", nameof(DataObjectReviewFeedbackPersist.DataObjectReviewId)]),
					//userid must be null (if user hash is non empty/null) or valid guid (if user hash is null)
					this.Spec()
						.Must(() => this.UserDataValidation(item) )
						.FailOn(nameof(DataObjectReviewFeedbackPersist.UserId)).FailWith(this._localizer["Validation_Required", nameof(DataObjectReviewFeedbackPersist.UserId)]),
					this.Spec()
						.Must(() => this.ValidateFeedbackData(item) )
						.FailOn(nameof(DataObjectReviewFeedbackPersist.FeedbackData)).FailWith(this._localizer["Validation_Required", nameof(DataObjectReviewFeedbackPersist.FeedbackData)]),
				};
			}
		}
	}



}
