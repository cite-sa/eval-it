using Cite.EvalIt.Common;
using Cite.EvalIt.Common.Validation;
using Cite.EvalIt.Convention;
using Cite.EvalIt.ErrorCode;
using Cite.EvalIt.Service.DataObjectType.RankingProfileHelper;
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
    public class DataObjectTypeRankingMethodology
    {
        [BsonId]
        [BsonIgnoreIfDefault]
        public Guid Id { get; set; }
        public string Name { get; set; }
        public RankingConfiguration Config { get; set; }
        public IsActive IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public String Hash { get; set; }
    }

    public class DataObjectTypeRankingMethodologyPersist
    {
        public Guid? Id { get; set; }
        public string Name { get; set; }
        public Guid DataObjectTypeId { get; set; }
        public RankingConfigurationPersist Config { get; set; }
        public String Hash { get; set; }
        public class DataObjectTypeRankingMethodologyPersistValidator : BaseValidator<DataObjectTypeRankingMethodologyPersist>
        {
            public DataObjectTypeRankingMethodologyPersistValidator(
                RankingProfileHelperFactory<RankingProfileType, IBaseRankingProfileHelper> rankingProfileHelperFactory,
                IConventionService conventionService,
                IStringLocalizer<Resources.MySharedResources> localizer,
                ValidatorFactory validatorFactory,
                ILogger<DataObjectTypeRankingMethodologyPersistValidator> logger,
                Query.DataObjectTypeQuery typeQuery,
                ErrorThesaurus errors) : base(conventionService, validatorFactory, logger, errors)
            {
                this._localizer = localizer;
                this._typeQuery = typeQuery;
                this._rankingProfileHelperFactory = rankingProfileHelperFactory;
            }

            private readonly IStringLocalizer<Resources.MySharedResources> _localizer;
            private readonly Query.DataObjectTypeQuery _typeQuery;
            private readonly RankingProfileHelperFactory<RankingProfileType, IBaseRankingProfileHelper> _rankingProfileHelperFactory;

            private async Task<bool> RankingConfigurationValidation(DataObjectTypeRankingMethodologyPersist item)
            {
                var profiles = item.Config.RankingProfiles;
                if (profiles == null) return false;

                foreach (var profile in profiles)
                {
                    this._validatorFactory.Validator<BaseRankingProfilePersist.BaseRankingProfilePersistValidator>().ValidateForce(profile);
                }

                // Try to get type by type id
                Data.DataObjectType type = (await _typeQuery.Ids(item.DataObjectTypeId).IsActive(IsActive.Active).Collect()).FirstOrDefault();

                // Failed to get type
                if (type == null) return false;

                // Check that every ranking profile corresponds to an evaluation option
                // (not necessarily vice-versa; an option can simply not be taken into account)
                foreach (var profile in profiles)
                {
                    var option = type.Config.EvalOptions?.Where(x => x.OptionId == profile.OptionId && x.OptionType != EvaluationConfigurationType.TextEvaluationOption).FirstOrDefault();

                    if (option == null) return false;

                    if (!this._rankingProfileHelperFactory.ChildClass(profile.ProfileType).Validate((BaseRankingProfilePersist)profile, option)) return false;
                }

                return true;
            }

            protected override IEnumerable<ISpecification> Specifications(DataObjectTypeRankingMethodologyPersist item)
            {
                return new ISpecification[]{
					//id must be valid guid or null
					this.Spec()
                        .Must(() => !(item.Id.HasValue) || ( item.Id.HasValue && this.IsValidGuid(item.Id)) )
                        .FailOn(nameof(DataObjectTypeRankingMethodologyPersist.Id)).FailWith(this._localizer["Validation_Required", nameof(DataObjectTypeRankingMethodologyPersist.Id)]),
					//type id must be valid guid
					this.Spec()
                        .Must(() => this.IsValidGuid(item.DataObjectTypeId ) )
                        .FailOn(nameof(DataObjectTypeRankingMethodologyPersist.DataObjectTypeId)).FailWith(this._localizer["Validation_Required", nameof(DataObjectTypeRankingMethodologyPersist.DataObjectTypeId)]),
					//name must be non-empty & up to 250 characters
					this.Spec()
                        .Must(() => (item.Name.Length > 0) && (item.Name.Length <= 250) )
                        .FailOn(nameof(DataObjectTypeRankingMethodologyPersist.Name)).FailWith(this._localizer["Validation_Required", nameof(DataObjectTypeRankingMethodologyPersist.Name)]),
                    this.Spec()
                        .Must(() => this.RankingConfigurationValidation(item).Result )
                        .FailOn(nameof(DataObjectTypeRankingMethodologyPersist.Config)).FailWith(this._localizer["Validation_Required", nameof(DataObjectTypeRankingMethodologyPersist.Config)]),
                };
            }
        }
    }
}