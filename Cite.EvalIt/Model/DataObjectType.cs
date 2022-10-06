using Cite.EvalIt.Common;
using Cite.EvalIt.Common.Validation;
using Cite.EvalIt.Convention;
using Cite.EvalIt.ErrorCode;
using Cite.EvalIt.Service.DataObjectType.BaseObjectRankRecalculationStrategyHelper;
using Cite.EvalIt.Service.DataObjectType.EvaluationOptionHelper;
using Cite.EvalIt.Service.DataObjectType.RegistrationInformationInputOptionHelper;
using Cite.Tools.Json.Inflater;
using Cite.Tools.Validation;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Linq;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Cite.EvalIt.Model
{
    public class DataObjectType
    {
        [BsonId]
        [BsonIgnoreIfDefault]
        public Guid Id { get; set; }
        public string Name { get; set; }
		public EvaluationConfiguration Config { get; set; }
		public RegistrationInformation Info { get; set; }
        public List<DataObjectTypeRankingMethodology> RankingMethodologies { get; set; }
        public Guid? SelectedRankingMethodologyId { get; set; }
        public ObjectRankRecalculationStrategyConfiguration StrategyConfig { get; set; }
        public bool MultipleReviewOption { get; set; }
        public IsActive IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public String Hash { get; set; }
    }

	public class DataObjectTypePersist
	{
		public Guid? Id { get; set; }
		public string Name { get; set; }
		public EvaluationConfigurationPersist Config { get; set; }
		public RegistrationInformationPersist Info { get; set; }
        public ObjectRankRecalculationStrategyConfigurationPersist StrategyConfig { get; set; }
        public Guid? SelectedRankingMethodologyId { get; set; }
        public bool MultipleReviewOption { get; set; }
        public String Hash { get; set; }
		public class DataObjectTypePersistValidator : BaseValidator<DataObjectTypePersist>
		{
			public DataObjectTypePersistValidator(
                EvaluationOptionHelperFactory<EvaluationConfigurationType, IBaseEvaluationOptionHelper> evaluationOptionHelperFactory,
                RegistrationInformationInputOptionHelperFactory<RegistrationInformationType, IRegistrationInformationInputOptionHelper> registrationInformationInputOptionHelperFactory,
                BaseObjectRankRecalculationStrategyHelperFactory<ObjectRankRecalculationStrategyType, IBaseObjectRankRecalculationStrategyHelper> baseObjectRankRecalculationStrategyHelperFactory,
                IConventionService conventionService,
				IStringLocalizer<Resources.MySharedResources> localizer,
				ValidatorFactory validatorFactory,
				ILogger<DataObjectTypePersist> logger,
				ErrorThesaurus errors) : base(conventionService, validatorFactory, logger, errors)
			{
				this._localizer = localizer;
                this._evaluationOptionHelperFactory = evaluationOptionHelperFactory;
                this._registrationInformationInputOptionHelperFactory = registrationInformationInputOptionHelperFactory;
                this._baseObjectRankRecalculationStrategyHelperFactory = baseObjectRankRecalculationStrategyHelperFactory;
            }

            private readonly IStringLocalizer<Resources.MySharedResources> _localizer;
            private readonly EvaluationOptionHelperFactory<EvaluationConfigurationType, IBaseEvaluationOptionHelper> _evaluationOptionHelperFactory;
            private readonly RegistrationInformationInputOptionHelperFactory<RegistrationInformationType, IRegistrationInformationInputOptionHelper> _registrationInformationInputOptionHelperFactory;
            private readonly BaseObjectRankRecalculationStrategyHelperFactory<ObjectRankRecalculationStrategyType, IBaseObjectRankRecalculationStrategyHelper> _baseObjectRankRecalculationStrategyHelperFactory;

            private bool EvaluationConfigurationValidation(EvaluationConfigurationPersist config)
            {
                if (config == null || config.EvalOptions == null || config.EvalOptions.Count == 0) return false;

                foreach (var option in config.EvalOptions) this._evaluationOptionHelperFactory.ChildClass(option.OptionType).Validate((BaseEvaluationOptionPersist)option);

                return true;
            }

            private bool RegistrationInformationValidation(RegistrationInformationPersist info)
            {
                if (info == null || info.InputOptions == null || info.InputOptions.Count == 0) return false;

                foreach (var option in info.InputOptions) this._registrationInformationInputOptionHelperFactory.ChildClass(option.OptionType).Validate((RegistrationInformationInputOptionPersist)option);

                return true;
            }

            private bool ObjectRankRecalculationStrategyValidation(ObjectRankRecalculationStrategyConfigurationPersist strategyConfig)
            {
                if (strategyConfig == null || strategyConfig.Strategies == null || strategyConfig.Strategies.Count == 0) return true;

                if (strategyConfig.Strategies.Where(x => x.IsActive == IsActive.Active).Select(x => x.StrategyWeight).Sum() == 0) return true;

                foreach (var strategy in strategyConfig.Strategies) this._baseObjectRankRecalculationStrategyHelperFactory.ChildClass(strategy.StrategyType).Validate((BaseObjectRankRecalculationStrategyPersist)strategy);

                return true;
            }

            protected override IEnumerable<ISpecification> Specifications(DataObjectTypePersist item)
			{
				return new ISpecification[]{
					//id must be valid guid or null
					this.Spec()
						.Must(() => !(item.Id.HasValue) || ( item.Id.HasValue && this.IsValidGuid(item.Id)) )
						.FailOn(nameof(DataObjectTypePersist.Id)).FailWith(this._localizer["Validation_Required", nameof(DataObjectTypePersist.Id)]),
					//label must be non-empty & up to 250 characters
					this.Spec()
						.Must(() => (item.Name.Length > 0) && (item.Name.Length <= 250) )
						.FailOn(nameof(DataObjectTypePersist.Name)).FailWith(this._localizer["Validation_Required", nameof(DataObjectTypePersist.Name)]),
                    this.Spec()
                         .Must(() =>this.EvaluationConfigurationValidation(item.Config))
                         .FailOn(nameof(DataObjectTypePersist.Config)).FailWith(this._localizer["Validation_Required", nameof(DataObjectTypePersist.Config)]),
                    this.Spec()
                         .Must(() => this.RegistrationInformationValidation(item.Info))
                         .FailOn(nameof(DataObjectTypePersist.Info)).FailWith(this._localizer["Validation_Required", nameof(DataObjectTypePersist.Info)]),
                    this.Spec()
                         .Must(() => this.ObjectRankRecalculationStrategyValidation(item.StrategyConfig))
                         .FailOn(nameof(DataObjectTypePersist.StrategyConfig)).FailWith(this._localizer["Validation_Required", nameof(DataObjectTypePersist.StrategyConfig)]),
                };
			}
        }
    }
}
