using Cite.EvalIt.Common;
using Cite.EvalIt.Common.Validation;
using Cite.EvalIt.Convention;
using Cite.EvalIt.ErrorCode;
using Cite.Tools.Json.Inflater;
using Cite.Tools.Validation;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Cite.EvalIt.Model
{
    public class RankingConfiguration
    {
        public List<BaseRankingProfile> RankingProfiles { get; set; }
    }

    public class BaseRankingProfile
    {
        public Guid OptionId { get; set; }
        public RankingProfileType ProfileType { get; set; }
        public float OptionWeight { get; set; }
        public List<float> MappedUserValues { get; set; }
        public List<float> MappedNormalizedValues { get; set; }
        public IsActive IsActive { get; set; }
    }

    public class AbsoluteIntegerRankingProfile : BaseRankingProfile
    {
        public List<BoundedType<int>> MappedRangeBounds { get; set; }
    }

    public class AbsoluteDecimalRankingProfile : BaseRankingProfile
    {
        public List<BoundedType<float>> MappedRangeBounds { get; set; }

    }

    public class PercentageRankingProfile : BaseRankingProfile
    {
        public List<BoundedType<float>> MappedRangeBounds { get; set; }
    }

    public class ScaleRankingProfile : BaseRankingProfile
    {
    }

    public class SelectionRankingProfile : BaseRankingProfile
    {
    }


    public class RankingConfigurationPersist
    {
        public List<IBaseRankingProfilePersist> RankingProfiles { get; set; }
    }

    [JsonConverter(typeof(SubTypeConverter))]
    [SubTypeConverterAnchor(nameof(IBaseRankingProfilePersist.ProfileType), typeof(RankingProfileType))]
    [SubTypeConverterMap(RankingProfileType.AbsoluteDecimalRankingProfile, typeof(AbsoluteDecimalRankingProfilePersist))]
    [SubTypeConverterMap(RankingProfileType.AbsoluteIntegerRankingProfile, typeof(AbsoluteIntegerRankingProfilePersist))]
    [SubTypeConverterMap(RankingProfileType.PercentageRankingProfile, typeof(PercentageRankingProfilePersist))]
    [SubTypeConverterMap(RankingProfileType.ScaleRankingProfile, typeof(ScaleRankingProfilePersist))]
    [SubTypeConverterMap(RankingProfileType.SelectionRankingProfile, typeof(SelectionRankingProfilePersist))]
    public interface IBaseRankingProfilePersist
    {
        public Guid OptionId { get; set; }
        public RankingProfileType ProfileType { get; set; }
        public float OptionWeight { get; set; }
        public List<float> MappedUserValues { get; set; }
        public IsActive IsActive { get; set; }
    }

    public class BaseRankingProfilePersist : IBaseRankingProfilePersist
    {
        public Guid OptionId { get; set; }
        public RankingProfileType ProfileType { get; set; }
        public float OptionWeight { get; set; }
        public List<float> MappedUserValues { get; set; }
        public IsActive IsActive { get; set; }

        public class BaseRankingProfilePersistValidator : BaseValidator<BaseRankingProfilePersist>
        {
            public BaseRankingProfilePersistValidator(
                IConventionService conventionService,
                IStringLocalizer<Resources.MySharedResources> localizer,
                ValidatorFactory validatorFactory,
                ILogger<BaseRankingProfilePersist> logger,
                ErrorThesaurus errors) : base(conventionService, validatorFactory, logger, errors)
            {
                this._localizer = localizer;
            }

            protected readonly IStringLocalizer<Resources.MySharedResources> _localizer;

            protected override IEnumerable<ISpecification> Specifications(BaseRankingProfilePersist item)
            {
                return new ISpecification[] {
                    //optionid must be valid guid
					this.Spec()
                        .Must(() => this.IsValidGuid(item.OptionId))
                        .FailOn(nameof(BaseRankingProfilePersist.OptionId)).FailWith(this._localizer["Validation_Required", nameof(BaseRankingProfilePersist.OptionId)]),
                    //RankingMethodologyType enum must be vaild
					this.Spec()
                        .Must(() => Enum.IsDefined(typeof(RankingProfileType),item.ProfileType) )
                        .FailOn(nameof(BaseRankingProfilePersist.ProfileType)).FailWith(this._localizer["Validation_Required", nameof(BaseRankingProfilePersist.ProfileType)]),
                    //IsActive enum must be vaild
					this.Spec()
                        .Must(() => Enum.IsDefined(typeof(IsActive),item.IsActive) )
                        .FailOn(nameof(BaseRankingProfilePersist.IsActive)).FailWith(this._localizer["Validation_Required", nameof(BaseRankingProfilePersist.IsActive)]),

                };
            }
        }
    }

    public class AbsoluteIntegerRankingProfilePersist : BaseRankingProfilePersist
    {
        public List<BoundedType<int>> MappedRangeBounds { get; set; }
    }

    public class AbsoluteDecimalRankingProfilePersist : BaseRankingProfilePersist
    {
        public List<BoundedType<float>> MappedRangeBounds { get; set; }
    }

    public class PercentageRankingProfilePersist : BaseRankingProfilePersist
    {
        public List<BoundedType<float>> MappedRangeBounds { get; set; }
    }

    public class ScaleRankingProfilePersist : BaseRankingProfilePersist
    {
    }

    public class SelectionRankingProfilePersist : BaseRankingProfilePersist
    {
    }
}
