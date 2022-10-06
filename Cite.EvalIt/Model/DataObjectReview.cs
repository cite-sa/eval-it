using Cite.EvalIt.Common;
using Cite.EvalIt.Common.Validation;
using Cite.EvalIt.Convention;
using Cite.EvalIt.ErrorCode;
using Cite.EvalIt.Service.DataObjectType.EvaluationOptionHelper;
using Cite.EvalIt.Service.DataObjectType.ReviewEvaluationHelper;
using Cite.Tools.Validation;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Cite.EvalIt.Model
{
	public class DataObjectReview
	{
		[BsonId]
		[BsonIgnoreIfDefault]
        public Guid Id { get; set; }
        public ReviewAnonymity Anonymity { get; set; }
        public ReviewVisibility Visibility { get; set; }
		public string UserIdHash { get; set; }
		public Guid? UserId { get; set; }
		public User User { get; set; }
		public Guid? DataObjectId { get; set; }
		public DataObject DataObject { get; set; }
		public DataObjectType DataObjectType { get; set; }
		public float? RankScore { get; set; }
        public ReviewEvaluationData EvaluationData { get; set; }
		public IEnumerable<DataObjectReviewFeedback> Feedback { get; set; }
        public IsActive IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
		public bool CanEdit { get; set; }
		public bool IsMine { get; set; }
		public String Hash { get; set; }
	}
	public class DataObjectReviewPersist
	{
		public Guid? Id { get; set; }
		public ReviewAnonymity Anonymity { get; set; }
		public ReviewVisibility Visibility { get; set; }
        public Guid DataObjectId { get; set; }
		public string UserIdHash { get; set; }
		public Guid? UserId { get; set; }
		public DataObjectTypePersist DataObjectType { get; set; }
		public ReviewEvaluationDataPersist EvaluationData { get; set; }
		public String Hash { get; set; }
		public class DataObjectReviewPersistValidator : BaseValidator<DataObjectReviewPersist>
		{
			public DataObjectReviewPersistValidator(
				EvaluationOptionHelperFactory<EvaluationConfigurationType, IBaseEvaluationOptionHelper> evaluationOptionHelperFactory,
				ReviewEvaluationHelperFactory<ReviewEvaluationType, IReviewEvaluationHelper> reviewEvaluationHelperFactory,
				IConventionService conventionService,
				IStringLocalizer<Resources.MySharedResources> localizer,
				ValidatorFactory validatorFactory,
				ILogger<DataObjectReviewPersist> logger,
				Query.DataObjectQuery objectQuery,
				Query.DataObjectTypeQuery typeQuery,
				ErrorThesaurus errors) : base(conventionService, validatorFactory, logger, errors)
			{
				this._objectQuery = objectQuery;
				this._typeQuery = typeQuery;
				this._localizer = localizer;
				this._evaluationOptionHelperFactory = evaluationOptionHelperFactory;
				this._reviewEvaluationHelperFactory = reviewEvaluationHelperFactory;
			}

			private readonly IStringLocalizer<Resources.MySharedResources> _localizer;
			private readonly Query.DataObjectQuery _objectQuery;
			private readonly Query.DataObjectTypeQuery _typeQuery;
			private readonly ReviewEvaluationHelperFactory<ReviewEvaluationType, IReviewEvaluationHelper> _reviewEvaluationHelperFactory;
			private readonly EvaluationOptionHelperFactory<EvaluationConfigurationType, IBaseEvaluationOptionHelper> _evaluationOptionHelperFactory;

			private async Task<bool> EvaluationDataValidation(DataObjectReviewPersist item)
			{
				var evaluations = item.EvaluationData.Evaluations;
				Data.DataObjectType type = null;

				foreach (var evaluation in evaluations)
				{
					this._validatorFactory.Validator<ReviewEvaluationPersist.ReviewEvaluationPersistValidator>().ValidateForce(evaluation);
				}

				// Try to get self-contained type from review persist
				if (item.DataObjectType != null)
				{
					if (item.DataObjectType.Id == null) return false;
					if (item.DataObjectType.Config == null || item.DataObjectType.Config.EvalOptions == null) return false;

					Data.EvaluationConfiguration config = new Data.EvaluationConfiguration
					{
						EvalOptions = new List<Data.BaseEvaluationOption>()
					};

					foreach (var x in item.DataObjectType.Config.EvalOptions.Where(x => x.IsActive == IsActive.Active))
					{
						var temp = this._evaluationOptionHelperFactory.ChildClass(x.OptionType).NewData();
						temp.Label = x.Label;
						temp.IsMandatory = x.IsMandatory;
						temp.OptionId = x.OptionId.Value;
						temp.OptionType = x.OptionType;
						temp.IsActive = x.IsActive;
						this._evaluationOptionHelperFactory.ChildClass(x.OptionType).PersistChildClassFields(temp, (BaseEvaluationOptionPersist)x);

						config.EvalOptions.Add(temp);
					}

					type = new Data.DataObjectType
					{
						Name = item.DataObjectType.Name,
						Id = item.DataObjectType.Id.Value,
						Config = config
					};

					// Validate self-contained type against pre-existing type
					Data.DataObjectType existingType = (await _typeQuery.Ids(item.DataObjectType.Id.Value).IsActive(IsActive.Active).Collect()).FirstOrDefault();

					if (existingType == null || type.Name != existingType.Name) return false;

					// Self-contained type's options should be a subset of the current existing type's, the only difference being their isActive status

					var dict = existingType.Config.EvalOptions.ToDictionary(x => x.OptionId);

					foreach (var option in config.EvalOptions)
					{
						if (!dict.ContainsKey(option.OptionId)) return false;
					}
				}
                else
                {
					var typeId = (await _objectQuery.Ids(item.DataObjectId).IsActive(IsActive.Active).Collect()).FirstOrDefault().DataObjectTypeId;
					type = (await _typeQuery.Ids(typeId).IsActive(IsActive.Active).Collect()).FirstOrDefault();
				}

				// Failed to get type
				if (type == null) return false;

				foreach (var option in type.Config.EvalOptions)
				{
					var eval = evaluations.Where(a => a.OptionId == option.OptionId).FirstOrDefault();

					if (eval == null && (!option.IsMandatory || option.IsActive == IsActive.Inactive)) continue;
					else if (eval == null) return false;

					if (!this._reviewEvaluationHelperFactory.ChildClass(eval.EvaluationType).Validate((ReviewEvaluationPersist)eval, option)) return false;
				}

				return true;
			}

			private bool UserDataValidation(DataObjectReviewPersist item)
            {
				return  this.IsValidGuid(item.UserId) || ( item.UserId == null && !string.IsNullOrEmpty(item.UserIdHash));
            }

			private bool VisibilityAnonymityValidation(DataObjectReviewPersist item)
            {
				if (item.Anonymity == ReviewAnonymity.Anonymous && item.Visibility != ReviewVisibility.Public) return false;
				return true;
            }

			protected override IEnumerable<ISpecification> Specifications(DataObjectReviewPersist item)
			{
				return new ISpecification[]{
					//id must be valid guid or null
					this.Spec()
						.Must(() => !(item.Id.HasValue) || ( item.Id.HasValue && this.IsValidGuid(item.Id)) )
						.FailOn(nameof(DataObjectReviewPersist.Id)).FailWith(this._localizer["Validation_Required", nameof(DataObjectReviewPersist.Id)]),
					//ReviewAnonymity enum must be vaild
					this.Spec()
						.Must(() => Enum.IsDefined(typeof(ReviewAnonymity),item.Anonymity) )
						.FailOn(nameof(DataObjectReviewPersist.Anonymity)).FailWith(this._localizer["Validation_Required", nameof(DataObjectReviewPersist.Anonymity)]),
					//ReviewVisibility enum must be vaild
					this.Spec()
						.Must(() => Enum.IsDefined(typeof(ReviewVisibility),item.Visibility) && this.VisibilityAnonymityValidation(item) )
						.FailOn(nameof(DataObjectReviewPersist.Visibility)).FailWith(this._localizer["Validation_Required", nameof(DataObjectReviewPersist.Visibility)]),
					//objectid must be valid guid 
					this.Spec()
						.Must(() =>  this.IsValidGuid(item.DataObjectId) )
						.FailOn(nameof(DataObjectReviewPersist.DataObjectId)).FailWith(this._localizer["Validation_Required", nameof(DataObjectReviewPersist.DataObjectId)]),
					//userid must be null (if user hash is non empty/null) or valid guid (if user hash is null)
					this.Spec()
						.Must(() => this.UserDataValidation(item) )
						.FailOn(nameof(DataObjectReviewPersist.UserId)).FailWith(this._localizer["Validation_Required", nameof(DataObjectReviewPersist.UserId)]),
					// Object Evaluations must conform to specifications in their review's Data Object's self-contained type 
					this.Spec()
						.Must(() => this.EvaluationDataValidation(item).Result)
						.FailOn(nameof(DataObjectReviewPersist.EvaluationData)).FailWith(this._localizer["Validation_Required", nameof(DataObjectReviewPersist.EvaluationData)]),

				};
			}
		}
	}



}
