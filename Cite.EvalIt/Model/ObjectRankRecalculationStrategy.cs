using Cite.EvalIt.Common;
using Cite.EvalIt.Common.Validation;
using Cite.EvalIt.Convention;
using Cite.EvalIt.ErrorCode;
using Cite.Tools.Json.Inflater;
using Cite.Tools.Validation;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Cite.EvalIt.Model
{
	public class ObjectRankRecalculationStrategyConfiguration
	{
		public List<BaseObjectRankRecalculationStrategy> Strategies { get; set; }
	}

	public class BaseObjectRankRecalculationStrategy
	{
		public Guid Id { get; set; }
		public ObjectRankRecalculationStrategyType StrategyType { get; set; }
		public float StrategyWeight { get; set; }
		public IsActive IsActive { get; set; }
	}

	public class AllEqualObjectRankRecalculationStrategy : BaseObjectRankRecalculationStrategy
	{ }

	public class LikedObjectRankRecalculationStrategy : BaseObjectRankRecalculationStrategy
	{
		public RangePartition<float> LikePartition { get; set; }
	}

	public class NetworkPopularityObjectRankRecalculationStrategy : BaseObjectRankRecalculationStrategy
	{
		public RangePartition<float> NetworkPopularityPartition { get; set; }
	}

	public class NetworkTrustObjectRankRecalculationStrategy : BaseObjectRankRecalculationStrategy
	{
		public RangePartition<float> NetworkTrustPartition { get; set; }
	}

	public class ReviewDisciplineVisibilityObjectRankRecalculationStrategy : BaseObjectRankRecalculationStrategy
	{
		public RangePartition<float> ReviewDisciplinePartition { get; set; }
	}

	public class AuthorDisciplineVisibilityObjectRankRecalculationStrategy : BaseObjectRankRecalculationStrategy
	{
		public RangePartition<float> AuthorTrustDisciplinePartition { get; set; }
		public RangePartition<float> AuthorFollowDisciplinePartition { get; set; }
	}

	public class AuthorActivityObjectRankRecalculationStrategy : BaseObjectRankRecalculationStrategy
	{
		public int TimeUnitCount { get; set; }
		public TimeUnit TimeUnit { get; set; }

		public RangePartition<float> AuthorObjectActivityPartition { get; set; }
		public RangePartition<float> AuthorReviewActivityPartition { get; set; }
	}

	public class ObjectRankRecalculationStrategyConfigurationPersist
	{
		public Guid DataObjectTypeId { get; set; }
		public List<IBaseObjectRankRecalculationStrategyPersist> Strategies { get; set; }
		public class ObjectRankRecalculationStrategyConfigurationPersistValidator : BaseValidator<ObjectRankRecalculationStrategyConfigurationPersist>
		{
			public ObjectRankRecalculationStrategyConfigurationPersistValidator(
				IConventionService conventionService,
				IStringLocalizer<Resources.MySharedResources> localizer,
				ValidatorFactory validatorFactory,
				ILogger<ObjectRankRecalculationStrategyConfigurationPersist> logger,
				ErrorThesaurus errors) : base(conventionService, validatorFactory, logger, errors)
			{
				this._localizer = localizer;
			}

			private readonly IStringLocalizer<Resources.MySharedResources> _localizer;

			protected override IEnumerable<ISpecification> Specifications(ObjectRankRecalculationStrategyConfigurationPersist item)
			{
				return new ISpecification[]{
					//id must be valid guid or null
					this.Spec()
						.Must(() => item.Strategies.ToLookup(u => u.StrategyType).Count == item.Strategies.Count)
						.FailOn(nameof(ObjectRankRecalculationStrategyConfigurationPersist.Strategies)).FailWith(this._localizer["Validation_Required", nameof(ObjectRankRecalculationStrategyConfigurationPersist.Strategies)]),
				};
			}
		}
	}

	[JsonConverter(typeof(SubTypeConverter))]
	[SubTypeConverterAnchor(nameof(BaseObjectRankRecalculationStrategyPersist.StrategyType), typeof(ObjectRankRecalculationStrategyType))]
	[SubTypeConverterMap(ObjectRankRecalculationStrategyType.AllEqual, typeof(AllEqualObjectRankRecalculationStrategyPersist))]
	[SubTypeConverterMap(ObjectRankRecalculationStrategyType.Liked, typeof(LikedObjectRankRecalculationStrategyPersist))]
	[SubTypeConverterMap(ObjectRankRecalculationStrategyType.NetworkPopularity, typeof(NetworkPopularityObjectRankRecalculationStrategyPersist))]
	[SubTypeConverterMap(ObjectRankRecalculationStrategyType.NetworkTrust, typeof(NetworkTrustObjectRankRecalculationStrategyPersist))]
	[SubTypeConverterMap(ObjectRankRecalculationStrategyType.ReviewDisciplineVisibility, typeof(ReviewDisciplineVisibilityObjectRankRecalculationStrategyPersist))]
	[SubTypeConverterMap(ObjectRankRecalculationStrategyType.AuthorDisciplineVisibility, typeof(AuthorDisciplineVisibilityObjectRankRecalculationStrategyPersist))]
	[SubTypeConverterMap(ObjectRankRecalculationStrategyType.AuthorActivity, typeof(AuthorActivityObjectRankRecalculationStrategyPersist))]
	public interface IBaseObjectRankRecalculationStrategyPersist
    {
		public Guid? Id { get; set; }
		public ObjectRankRecalculationStrategyType StrategyType { get; set; }
		public float StrategyWeight { get; set; }
		public IsActive IsActive { get; set; }
	}

	public class BaseObjectRankRecalculationStrategyPersist : IBaseObjectRankRecalculationStrategyPersist
	{
		public Guid? Id { get; set; }
		public ObjectRankRecalculationStrategyType StrategyType { get; set; }
		public float StrategyWeight { get; set; }
		public IsActive IsActive { get; set; }

		public abstract class BaseObjectRankRecalculationStrategyPersistValidator<T> : BaseValidator<T> where T : BaseObjectRankRecalculationStrategyPersist
		{
			public BaseObjectRankRecalculationStrategyPersistValidator(
				IConventionService conventionService,
				IStringLocalizer<Resources.MySharedResources> localizer,
				ValidatorFactory validatorFactory,
				ILogger<BaseObjectRankRecalculationStrategyPersist> logger,
				ErrorThesaurus errors) : base(conventionService, validatorFactory, logger, errors)
			{
				this._localizer = localizer;
			}

			protected readonly IStringLocalizer<Resources.MySharedResources> _localizer;

			protected abstract IEnumerable<ISpecification> GetSubClassSpecifications(T item);

			protected override IEnumerable<ISpecification> Specifications(T item)
			{
				return new ISpecification[]{
                    //StrategyType enum must be vaild
					this.Spec()
						.Must(() => Enum.IsDefined(typeof(ObjectRankRecalculationStrategyType) ,item.StrategyType) )
						.FailOn(nameof(BaseObjectRankRecalculationStrategyPersist.StrategyType)).FailWith(this._localizer["Validation_Required", nameof(BaseObjectRankRecalculationStrategyPersist.StrategyType)]),
					}.Concat(GetSubClassSpecifications(item));
			}
		}
	}

	public class AllEqualObjectRankRecalculationStrategyPersist : BaseObjectRankRecalculationStrategyPersist
	{
		public class AllEqualObjectRankRecalculationStrategyPersistValidator : BaseObjectRankRecalculationStrategyPersist.BaseObjectRankRecalculationStrategyPersistValidator<AllEqualObjectRankRecalculationStrategyPersist>
		{
			public AllEqualObjectRankRecalculationStrategyPersistValidator(
				IConventionService conventionService,
				IStringLocalizer<Resources.MySharedResources> localizer,
				ValidatorFactory validatorFactory,
				ILogger<AllEqualObjectRankRecalculationStrategyPersist> logger,
				ErrorThesaurus errors) : base(conventionService, localizer, validatorFactory, logger, errors)
			{ }

			protected override IEnumerable<ISpecification> GetSubClassSpecifications(AllEqualObjectRankRecalculationStrategyPersist item)
			{
				return new ISpecification[] {};
			}
		}
	}

	public class LikedObjectRankRecalculationStrategyPersist : BaseObjectRankRecalculationStrategyPersist
	{
		public RangePartition<float> LikePartition { get; set; }

		public class LikedObjectRankRecalculationStrategyPersistValidator : BaseObjectRankRecalculationStrategyPersist.BaseObjectRankRecalculationStrategyPersistValidator<LikedObjectRankRecalculationStrategyPersist>
		{
			public LikedObjectRankRecalculationStrategyPersistValidator(
				IConventionService conventionService,
				IStringLocalizer<Resources.MySharedResources> localizer,
				ValidatorFactory validatorFactory,
				ILogger<LikedObjectRankRecalculationStrategyPersist> logger,
				ErrorThesaurus errors) : base(conventionService, localizer, validatorFactory, logger, errors)
			{ }

			private bool ValidateLikeRanges(LikedObjectRankRecalculationStrategyPersist item)
            {
				var partition = item.LikePartition;
				if(partition.RangeBounds?.Count > 0)
                {
					if (partition.RangeInterpretation == null) return false;
					if (partition.RangeInterpretation == StrategyRangeInterpretation.Percentage && (partition.RangeBounds[0].Value > 100 || partition.RangeBounds[0].Value < 0)) return false;
					if (partition.RangeBounds.Count != (partition.RangeValues.Count - 1) || partition.RangeValues.Count <= 0) return false;

					for (int i = 1; i < partition.RangeBounds.Count; i++)
					{
						if (partition.RangeInterpretation == StrategyRangeInterpretation.Percentage && (partition.RangeBounds[i].Value > 100 || partition.RangeBounds[i].Value < 0)) return false;

						if (partition.RangeBounds[i - 1].Value > partition.RangeBounds[i].Value) return false;
						if (partition.RangeBounds[i - 1].Value == partition.RangeBounds[i].Value && (partition.RangeBounds[i - 1].UpperBoundType == Common.UpperBoundType.Exclusive || partition.RangeBounds[i].UpperBoundType == Common.UpperBoundType.Inclusive)) return false;
					}

					return true;
				}

				if (partition.RangeValues?.Count > 1) return false;
				return true;
            }

			protected override IEnumerable<ISpecification> GetSubClassSpecifications(LikedObjectRankRecalculationStrategyPersist item)
			{
				return new ISpecification[] {
					this.Spec()
						.Must(() => this.ValidateLikeRanges(item) )
						.FailOn(nameof(LikedObjectRankRecalculationStrategyPersist.LikePartition)).FailWith(this._localizer["Validation_Required", nameof(LikedObjectRankRecalculationStrategyPersist.LikePartition)]),
				};
			}
		}
	}

	public class NetworkPopularityObjectRankRecalculationStrategyPersist : BaseObjectRankRecalculationStrategyPersist
	{
		public RangePartition<float> NetworkPopularityPartition { get; set; }
		public class NetworkPopularityObjectRankRecalculationStrategyPersistValidator : BaseObjectRankRecalculationStrategyPersist.BaseObjectRankRecalculationStrategyPersistValidator<NetworkPopularityObjectRankRecalculationStrategyPersist>
		{
			public NetworkPopularityObjectRankRecalculationStrategyPersistValidator(
				IConventionService conventionService,
				IStringLocalizer<Resources.MySharedResources> localizer,
				ValidatorFactory validatorFactory,
				ILogger<NetworkPopularityObjectRankRecalculationStrategyPersist> logger,
				ErrorThesaurus errors) : base(conventionService, localizer, validatorFactory, logger, errors)
			{ }

			private bool ValidateLikeRanges(NetworkPopularityObjectRankRecalculationStrategyPersist item)
			{
				var partition = item.NetworkPopularityPartition;
				if (partition.RangeBounds?.Count > 0)
				{
					if (partition.RangeInterpretation == null) return false;
					if (partition.RangeInterpretation == StrategyRangeInterpretation.Percentage && (partition.RangeBounds[0].Value > 100 || partition.RangeBounds[0].Value < 0)) return false;
					if (partition.RangeBounds.Count != (partition.RangeValues.Count - 1) || partition.RangeValues.Count <= 0) return false;

					for (int i = 1; i < partition.RangeBounds.Count; i++)
					{
						if (partition.RangeInterpretation == StrategyRangeInterpretation.Percentage && (partition.RangeBounds[i].Value > 100 || partition.RangeBounds[i].Value < 0)) return false;

						if (partition.RangeBounds[i - 1].Value > partition.RangeBounds[i].Value) return false;
						if (partition.RangeBounds[i - 1].Value == partition.RangeBounds[i].Value && (partition.RangeBounds[i - 1].UpperBoundType == Common.UpperBoundType.Exclusive || partition.RangeBounds[i].UpperBoundType == Common.UpperBoundType.Inclusive)) return false;
					}

					return true;
				}

				if (partition.RangeValues?.Count > 1) return false;
				return true;
			}

			protected override IEnumerable<ISpecification> GetSubClassSpecifications(NetworkPopularityObjectRankRecalculationStrategyPersist item)
			{
				return new ISpecification[] {
					this.Spec()
						.Must(() => this.ValidateLikeRanges(item) )
						.FailOn(nameof(NetworkPopularityObjectRankRecalculationStrategyPersist.NetworkPopularityPartition)).FailWith(this._localizer["Validation_Required", nameof(NetworkPopularityObjectRankRecalculationStrategyPersist.NetworkPopularityPartition)]),
				};
			}
		}
	}

	public class NetworkTrustObjectRankRecalculationStrategyPersist : BaseObjectRankRecalculationStrategyPersist
	{
		public RangePartition<float> NetworkTrustPartition { get; set; }
		public class NetworkTrustObjectRankRecalculationStrategyPersistValidator : BaseObjectRankRecalculationStrategyPersist.BaseObjectRankRecalculationStrategyPersistValidator<NetworkTrustObjectRankRecalculationStrategyPersist>
		{
			public NetworkTrustObjectRankRecalculationStrategyPersistValidator(
				IConventionService conventionService,
				IStringLocalizer<Resources.MySharedResources> localizer,
				ValidatorFactory validatorFactory,
				ILogger<NetworkTrustObjectRankRecalculationStrategyPersist> logger,
				ErrorThesaurus errors) : base(conventionService, localizer, validatorFactory, logger, errors)
			{ }

			private bool ValidateLikeRanges(NetworkTrustObjectRankRecalculationStrategyPersist item)
			{
				var partition = item.NetworkTrustPartition;
				if (partition.RangeBounds?.Count > 0)
				{
					if (partition.RangeInterpretation == null) return false;
					if (partition.RangeInterpretation == StrategyRangeInterpretation.Percentage && (partition.RangeBounds[0].Value > 100 || partition.RangeBounds[0].Value < 0)) return false;
					if (partition.RangeBounds.Count != (partition.RangeValues.Count - 1) || partition.RangeValues.Count <= 0) return false;

					for (int i = 1; i < partition.RangeBounds.Count; i++)
					{
						if (partition.RangeInterpretation == StrategyRangeInterpretation.Percentage && (partition.RangeBounds[i].Value > 100 || partition.RangeBounds[i].Value < 0)) return false;

						if (partition.RangeBounds[i - 1].Value > partition.RangeBounds[i].Value) return false;
						if (partition.RangeBounds[i - 1].Value == partition.RangeBounds[i].Value && (partition.RangeBounds[i - 1].UpperBoundType == Common.UpperBoundType.Exclusive || partition.RangeBounds[i].UpperBoundType == Common.UpperBoundType.Inclusive)) return false;
					}

					return true;
				}

				if (partition.RangeValues?.Count > 1) return false;
				return true;
			}

			protected override IEnumerable<ISpecification> GetSubClassSpecifications(NetworkTrustObjectRankRecalculationStrategyPersist item)
			{
				return new ISpecification[] {
					this.Spec()
						.Must(() => this.ValidateLikeRanges(item) )
						.FailOn(nameof(NetworkTrustObjectRankRecalculationStrategyPersist.NetworkTrustPartition)).FailWith(this._localizer["Validation_Required", nameof(NetworkTrustObjectRankRecalculationStrategyPersist.NetworkTrustPartition)]),
				};
			}
		}
	}

	public class ReviewDisciplineVisibilityObjectRankRecalculationStrategyPersist : BaseObjectRankRecalculationStrategyPersist
	{
		public RangePartition<float> ReviewDisciplinePartition { get; set; }
		public class ReviewDisciplineVisibilityObjectRankRecalculationStrategyPersistValidator : BaseObjectRankRecalculationStrategyPersist.BaseObjectRankRecalculationStrategyPersistValidator<ReviewDisciplineVisibilityObjectRankRecalculationStrategyPersist>
		{
			public ReviewDisciplineVisibilityObjectRankRecalculationStrategyPersistValidator(
				IConventionService conventionService,
				IStringLocalizer<Resources.MySharedResources> localizer,
				ValidatorFactory validatorFactory,
				ILogger<ReviewDisciplineVisibilityObjectRankRecalculationStrategyPersist> logger,
				ErrorThesaurus errors) : base(conventionService, localizer, validatorFactory, logger, errors)
			{ }

			private bool ValidateLikeRanges(ReviewDisciplineVisibilityObjectRankRecalculationStrategyPersist item)
			{
				var partition = item.ReviewDisciplinePartition;
				if (partition.RangeBounds?.Count > 0)
				{
					if (partition.RangeInterpretation == null) return false;
					if (partition.RangeInterpretation == StrategyRangeInterpretation.Percentage && (partition.RangeBounds[0].Value > 100 || partition.RangeBounds[0].Value < 0)) return false;
					if (partition.RangeBounds.Count != (partition.RangeValues.Count - 1) || partition.RangeValues.Count <= 0) return false;

					for (int i = 1; i < partition.RangeBounds.Count; i++)
					{
						if (partition.RangeInterpretation == StrategyRangeInterpretation.Percentage && (partition.RangeBounds[i].Value > 100 || partition.RangeBounds[i].Value < 0)) return false;

						if (partition.RangeBounds[i - 1].Value > partition.RangeBounds[i].Value) return false;
						if (partition.RangeBounds[i - 1].Value == partition.RangeBounds[i].Value && (partition.RangeBounds[i - 1].UpperBoundType == Common.UpperBoundType.Exclusive || partition.RangeBounds[i].UpperBoundType == Common.UpperBoundType.Inclusive)) return false;
					}

					return true;
				}

				if (partition.RangeValues?.Count > 1) return false;
				return true;
			}

			protected override IEnumerable<ISpecification> GetSubClassSpecifications(ReviewDisciplineVisibilityObjectRankRecalculationStrategyPersist item)
			{
				return new ISpecification[] {
					this.Spec()
						.Must(() => this.ValidateLikeRanges(item) )
						.FailOn(nameof(ReviewDisciplineVisibilityObjectRankRecalculationStrategyPersist.ReviewDisciplinePartition)).FailWith(this._localizer["Validation_Required", nameof(ReviewDisciplineVisibilityObjectRankRecalculationStrategyPersist.ReviewDisciplinePartition)]),
				};
			}
		}
	}

	public class AuthorDisciplineVisibilityObjectRankRecalculationStrategyPersist : BaseObjectRankRecalculationStrategyPersist
	{
		public RangePartition<float> AuthorTrustDisciplinePartition { get; set; }
		public RangePartition<float> AuthorFollowDisciplinePartition { get; set; }
		public class AuthorDisciplineVisibilityObjectRankRecalculationStrategyPersistValidator : BaseObjectRankRecalculationStrategyPersist.BaseObjectRankRecalculationStrategyPersistValidator<AuthorDisciplineVisibilityObjectRankRecalculationStrategyPersist>
		{
			public AuthorDisciplineVisibilityObjectRankRecalculationStrategyPersistValidator(
				IConventionService conventionService,
				IStringLocalizer<Resources.MySharedResources> localizer,
				ValidatorFactory validatorFactory,
				ILogger<AuthorDisciplineVisibilityObjectRankRecalculationStrategyPersist> logger,
				ErrorThesaurus errors) : base(conventionService, localizer, validatorFactory, logger, errors)
			{ }

			private bool ValidateTrustLikeRanges(AuthorDisciplineVisibilityObjectRankRecalculationStrategyPersist item)
			{
				var partition = item.AuthorTrustDisciplinePartition;
				if (partition.RangeBounds?.Count > 0)
				{
					if (partition.RangeInterpretation == null) return false;
					if (partition.RangeInterpretation == StrategyRangeInterpretation.Percentage && (partition.RangeBounds[0].Value > 100 || partition.RangeBounds[0].Value < 0)) return false;
					if (partition.RangeBounds.Count != (partition.RangeValues.Count - 1) || partition.RangeValues.Count <= 0) return false;

					for (int i = 1; i < partition.RangeBounds.Count; i++)
					{
						if (partition.RangeInterpretation == StrategyRangeInterpretation.Percentage && (partition.RangeBounds[i].Value > 100 || partition.RangeBounds[i].Value < 0)) return false;

						if (partition.RangeBounds[i - 1].Value > partition.RangeBounds[i].Value) return false;
						if (partition.RangeBounds[i - 1].Value == partition.RangeBounds[i].Value && (partition.RangeBounds[i - 1].UpperBoundType == Common.UpperBoundType.Exclusive || partition.RangeBounds[i].UpperBoundType == Common.UpperBoundType.Inclusive)) return false;
					}

					return true;
				}

				if (partition.RangeValues?.Count > 1) return false;
				return true;
			}

			private bool ValidateFollowLikeRanges(AuthorDisciplineVisibilityObjectRankRecalculationStrategyPersist item)
			{
				var partition = item.AuthorFollowDisciplinePartition;
				if (partition.RangeBounds?.Count > 0)
				{
					if (partition.RangeInterpretation == null) return false;
					if (partition.RangeInterpretation == StrategyRangeInterpretation.Percentage && (partition.RangeBounds[0].Value > 100 || partition.RangeBounds[0].Value < 0)) return false;
					if (partition.RangeBounds.Count != (partition.RangeValues.Count - 1) || partition.RangeValues.Count <= 0) return false;

					for (int i = 1; i < partition.RangeBounds.Count; i++)
					{
						if (partition.RangeInterpretation == StrategyRangeInterpretation.Percentage && (partition.RangeBounds[i].Value > 100 || partition.RangeBounds[i].Value < 0)) return false;

						if (partition.RangeBounds[i - 1].Value > partition.RangeBounds[i].Value) return false;
						if (partition.RangeBounds[i - 1].Value == partition.RangeBounds[i].Value && (partition.RangeBounds[i - 1].UpperBoundType == Common.UpperBoundType.Exclusive || partition.RangeBounds[i].UpperBoundType == Common.UpperBoundType.Inclusive)) return false;
					}

					return true;
				}

				if (partition.RangeValues?.Count > 1) return false;
				return true;
			}

			protected override IEnumerable<ISpecification> GetSubClassSpecifications(AuthorDisciplineVisibilityObjectRankRecalculationStrategyPersist item)
			{
				return new ISpecification[] {
					this.Spec()
						.Must(() => this.ValidateTrustLikeRanges(item) )
						.FailOn(nameof(AuthorDisciplineVisibilityObjectRankRecalculationStrategyPersist.AuthorTrustDisciplinePartition)).FailWith(this._localizer["Validation_Required", nameof(AuthorDisciplineVisibilityObjectRankRecalculationStrategyPersist.AuthorTrustDisciplinePartition)]),
					this.Spec()
						.Must(() => this.ValidateFollowLikeRanges(item) )
						.FailOn(nameof(AuthorDisciplineVisibilityObjectRankRecalculationStrategyPersist.AuthorFollowDisciplinePartition)).FailWith(this._localizer["Validation_Required", nameof(AuthorDisciplineVisibilityObjectRankRecalculationStrategyPersist.AuthorFollowDisciplinePartition)]),
				};
			}
		}
	}

	public class AuthorActivityObjectRankRecalculationStrategyPersist : BaseObjectRankRecalculationStrategyPersist
	{
		public int TimeUnitCount { get; set; }
		public TimeUnit TimeUnit { get; set; }

		public RangePartition<float> AuthorObjectActivityPartition { get; set; }
		public RangePartition<float> AuthorReviewActivityPartition { get; set; }
		public class AuthorActivityObjectRankRecalculationStrategyPersistValidator : BaseObjectRankRecalculationStrategyPersist.BaseObjectRankRecalculationStrategyPersistValidator<AuthorActivityObjectRankRecalculationStrategyPersist>
		{
			public AuthorActivityObjectRankRecalculationStrategyPersistValidator(
				IConventionService conventionService,
				IStringLocalizer<Resources.MySharedResources> localizer,
				ValidatorFactory validatorFactory,
				ILogger<AuthorActivityObjectRankRecalculationStrategyPersist> logger,
				ErrorThesaurus errors) : base(conventionService, localizer, validatorFactory, logger, errors)
			{ }

			private bool ValidateObjectUploadedRanges(AuthorActivityObjectRankRecalculationStrategyPersist item)
			{
				var partition = item.AuthorObjectActivityPartition;
				if (partition.RangeBounds?.Count > 0)
				{
					if (partition.RangeInterpretation == null) return false;
					if (partition.RangeInterpretation == StrategyRangeInterpretation.Percentage && (partition.RangeBounds[0].Value > 100 || partition.RangeBounds[0].Value < 0)) return false;
					if (partition.RangeBounds.Count != (partition.RangeValues.Count - 1) || partition.RangeValues.Count <= 0) return false;

					for (int i = 1; i < partition.RangeBounds.Count; i++)
					{
						if (partition.RangeInterpretation == StrategyRangeInterpretation.Percentage && (partition.RangeBounds[i].Value > 100 || partition.RangeBounds[i].Value < 0)) return false;

						if (partition.RangeBounds[i - 1].Value > partition.RangeBounds[i].Value) return false;
						if (partition.RangeBounds[i - 1].Value == partition.RangeBounds[i].Value && (partition.RangeBounds[i - 1].UpperBoundType == Common.UpperBoundType.Exclusive || partition.RangeBounds[i].UpperBoundType == Common.UpperBoundType.Inclusive)) return false;
					}

					return true;
				}

				if (partition.RangeValues?.Count > 1) return false;
				return true;
			}

			private bool ValidateReviewUploadedRanges(AuthorActivityObjectRankRecalculationStrategyPersist item)
			{
				var partition = item.AuthorReviewActivityPartition;
				if (partition.RangeBounds?.Count > 0)
				{
					if (partition.RangeInterpretation == null) return false;
					if (partition.RangeInterpretation == StrategyRangeInterpretation.Percentage && (partition.RangeBounds[0].Value > 100 || partition.RangeBounds[0].Value < 0)) return false;
					if (partition.RangeBounds.Count != (partition.RangeValues.Count - 1) || partition.RangeValues.Count <= 0) return false;

					for (int i = 1; i < partition.RangeBounds.Count; i++)
					{
						if (partition.RangeInterpretation == StrategyRangeInterpretation.Percentage && (partition.RangeBounds[i].Value > 100 || partition.RangeBounds[i].Value < 0)) return false;

						if (partition.RangeBounds[i - 1].Value > partition.RangeBounds[i].Value) return false;
						if (partition.RangeBounds[i - 1].Value == partition.RangeBounds[i].Value && (partition.RangeBounds[i - 1].UpperBoundType == Common.UpperBoundType.Exclusive || partition.RangeBounds[i].UpperBoundType == Common.UpperBoundType.Inclusive)) return false;
					}

					return true;
				}

				if (partition.RangeValues?.Count > 1) return false;
				return true;
			}

			protected override IEnumerable<ISpecification> GetSubClassSpecifications(AuthorActivityObjectRankRecalculationStrategyPersist item)
			{
				return new ISpecification[] {
					this.Spec()
						.Must(() => Enum.IsDefined(typeof(TimeUnit),item.TimeUnit) )
						.FailOn(nameof(AuthorActivityObjectRankRecalculationStrategyPersist.TimeUnit)).FailWith(this._localizer["Validation_Required", nameof(AuthorActivityObjectRankRecalculationStrategyPersist.TimeUnit)]),
					this.Spec()
						.Must(() => item.TimeUnitCount > 0 )
						.FailOn(nameof(AuthorActivityObjectRankRecalculationStrategyPersist.TimeUnitCount)).FailWith(this._localizer["Validation_Required", nameof(AuthorActivityObjectRankRecalculationStrategyPersist.TimeUnitCount)]),
					this.Spec()
						.Must(() => this.ValidateObjectUploadedRanges(item) )
						.FailOn(nameof(AuthorActivityObjectRankRecalculationStrategyPersist.AuthorObjectActivityPartition)).FailWith(this._localizer["Validation_Required", nameof(AuthorActivityObjectRankRecalculationStrategyPersist.AuthorObjectActivityPartition)]),
					this.Spec()
						.Must(() => this.ValidateReviewUploadedRanges(item) )
						.FailOn(nameof(AuthorActivityObjectRankRecalculationStrategyPersist.AuthorReviewActivityPartition)).FailWith(this._localizer["Validation_Required", nameof(AuthorActivityObjectRankRecalculationStrategyPersist.AuthorReviewActivityPartition)]),
				};
			}
		}
	}

}
