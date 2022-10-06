using Cite.EvalIt.Common;
using Cite.EvalIt.Common.Validation;
using Cite.EvalIt.Convention;
using Cite.EvalIt.ErrorCode;
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
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Cite.EvalIt.Model
{
    public class EvaluationConfiguration
    {
        public List<BaseEvaluationOption> EvalOptions { get; set; }
    }

    public class BaseEvaluationOption
    {
        public Guid? OptionId { get; set; }
        public string Label { get; set; }
        public Boolean IsMandatory { get; set; }
        public EvaluationConfigurationType OptionType { get; set; }
        public IsActive IsActive { get; set; }
    }

    public class AbsoluteIntegerEvaluationOption : BaseEvaluationOption
    {
        public BoundedType<int> UpperBound { get; set; }
        public BoundedType<int> LowerBound { get; set; }
        public string MeasurementUnit { get; set; }
    }

    public class AbsoluteDecimalEvaluationOption : BaseEvaluationOption
    {
        public BoundedType<float> UpperBound { get; set; }
        public BoundedType<float> LowerBound { get; set; }
        public string MeasurementUnit { get; set; }
    }

    public class PercentageEvaluationOption : BaseEvaluationOption
    {
        public BoundedType<float> UpperBound { get; set; }
        public BoundedType<float> LowerBound { get; set; }
    }

    public class TextEvaluationOption : BaseEvaluationOption
    { }

    public class ScaleEvaluationOption : BaseEvaluationOption
    {
        public ScaleDisplayOption ScaleDisplayOption { get; set; }
        public List<Data.EvaluationScaleValueData> EvaluationScale { get; set; }
    }

    public class SelectionEvaluationOption : BaseEvaluationOption
    {
        public List<Data.EvaluationSelectionOptionsData> EvaluationSelectionOptions { get; set; }
    }


    public class EvaluationConfigurationPersist
    {
        public List<IBaseEvaluationOptionPersist> EvalOptions { get; set; }
    }

    [JsonConverter(typeof(SubTypeConverter))]
    [SubTypeConverterAnchor(nameof(BaseEvaluationOptionPersist.OptionType), typeof(EvaluationConfigurationType))]
    [SubTypeConverterMap(EvaluationConfigurationType.AbsoluteDecimalEvaluationOption, typeof(AbsoluteDecimalEvaluationOptionPersist))]
    [SubTypeConverterMap(EvaluationConfigurationType.AbsoluteIntegerEvaluationOption, typeof(AbsoluteIntegerEvaluationOptionPersist))]
    [SubTypeConverterMap(EvaluationConfigurationType.PercentageEvaluationOption, typeof(PercentageEvaluationOptionPersist))]
    [SubTypeConverterMap(EvaluationConfigurationType.TextEvaluationOption, typeof(TextEvaluationOptionPersist))]
    [SubTypeConverterMap(EvaluationConfigurationType.ScaleEvaluationOption, typeof(ScaleEvaluationOptionPersist))]
    [SubTypeConverterMap(EvaluationConfigurationType.SelectionEvaluationOption, typeof(SelectionEvaluationOptionPersist))]
    public interface IBaseEvaluationOptionPersist
    {
        public Guid? OptionId { get; set; }
        public string Label { get; set; }
        public Boolean IsMandatory { get; set; }
        public EvaluationConfigurationType OptionType { get; set; }
        public IsActive IsActive { get; set; }
    }

    public class BaseEvaluationOptionPersist : IBaseEvaluationOptionPersist
    {
        public Guid? OptionId { get; set; }
        public string Label { get; set; }
        public Boolean IsMandatory { get; set; }
        public EvaluationConfigurationType OptionType { get; set; }
        public IsActive IsActive { get; set; }

        public abstract class BaseEvaluationOptionPersistValidator<T> : BaseValidator<T> where T : BaseEvaluationOptionPersist
        {
            public BaseEvaluationOptionPersistValidator(
                IConventionService conventionService,
                IStringLocalizer<Resources.MySharedResources> localizer,
                ValidatorFactory validatorFactory,
                ILogger<BaseEvaluationOptionPersist> logger,
                ErrorThesaurus errors) : base(conventionService, validatorFactory, logger, errors)
            {
                this._localizer = localizer;
            }

            protected readonly IStringLocalizer<Resources.MySharedResources> _localizer;

            protected abstract IEnumerable<ISpecification> GetSubClassSpecifications(T item);

            protected override IEnumerable<ISpecification> Specifications(T item)
            {
                return new ISpecification[] {
                    //id must be valid guid or null
                    this.Spec()
                        .Must(() => !(item.OptionId.HasValue) || ( item.OptionId.HasValue && this.IsValidGuid(item.OptionId)) )
                        .FailOn(nameof(BaseEvaluationOptionPersist.OptionId)).FailWith(this._localizer["Validation_Required", nameof(BaseEvaluationOptionPersist.OptionId)]),
					//label must be non-empty & up to 250 characters
					this.Spec()
                        .Must(() => (item.Label.Length > 0) && (item.Label.Length <= 250) )
                        .FailOn(nameof(BaseEvaluationOptionPersist.Label)).FailWith(this._localizer["Validation_Required", nameof(BaseEvaluationOptionPersist.Label)]),
					//EvaluationConfigurationType enum must be vaild
					this.Spec()
                        .Must(() => Enum.IsDefined(typeof(EvaluationConfigurationType),item.OptionType) )
                        .FailOn(nameof(BaseEvaluationOptionPersist.OptionType)).FailWith(this._localizer["Validation_Required", nameof(BaseEvaluationOptionPersist.OptionType)]),
                    //IsActive enum must be vaild
					this.Spec()
                        .Must(() => Enum.IsDefined(typeof(IsActive),item.IsActive) )
                        .FailOn(nameof(BaseEvaluationOptionPersist.IsActive)).FailWith(this._localizer["Validation_Required", nameof(BaseEvaluationOptionPersist.IsActive)]),

                }.Concat(GetSubClassSpecifications(item));
            }
        }
    }

    public class AbsoluteIntegerEvaluationOptionPersist : BaseEvaluationOptionPersist
    {
        public BoundedType<int> UpperBound { get; set; }
        public BoundedType<int> LowerBound { get; set; }
        public string MeasurementUnit { get; set; }

        public class AbsoluteIntegerEvaluationOptionPersistValidator : BaseEvaluationOptionPersist.BaseEvaluationOptionPersistValidator<AbsoluteIntegerEvaluationOptionPersist>
        {
            public AbsoluteIntegerEvaluationOptionPersistValidator(
                IConventionService conventionService,
                IStringLocalizer<Resources.MySharedResources> localizer,
                ValidatorFactory validatorFactory,
                ILogger<AbsoluteIntegerEvaluationOptionPersist> logger,
                ErrorThesaurus errors) : base(conventionService, localizer, validatorFactory, logger, errors)
            { }

            private bool ValidateBounds(AbsoluteIntegerEvaluationOptionPersist item)
            {
                if (item.UpperBound != null && !Enum.IsDefined(typeof(UpperBoundType), item.UpperBound.UpperBoundType)) return false;
                if (item.LowerBound != null && !Enum.IsDefined(typeof(UpperBoundType), item.LowerBound.UpperBoundType)) return false;

                if (item.UpperBound != null && item.LowerBound != null)
                {
                    if (item.UpperBound.Value < item.LowerBound.Value) return false;
                    if (item.UpperBound.Value == item.LowerBound.Value && (item.UpperBound.UpperBoundType != UpperBoundType.Inclusive || item.LowerBound.UpperBoundType != UpperBoundType.Inclusive)) return false;
                }

                return true;
            }

            protected override IEnumerable<ISpecification> GetSubClassSpecifications(AbsoluteIntegerEvaluationOptionPersist item)
            {
                //measurement unit must be non-empty & up to 250 characters
                return new ISpecification[] {
                    this.Spec()
                        .Must(() => (item.MeasurementUnit.Length > 0) && (item.MeasurementUnit.Length <= 250) )
                        .FailOn(nameof(AbsoluteIntegerEvaluationOptionPersist.MeasurementUnit)).FailWith(this._localizer["Validation_Required", nameof(AbsoluteIntegerEvaluationOptionPersist.MeasurementUnit)]),
                    this.Spec()
                        .Must(() => this.ValidateBounds(item))
                        .FailOn(nameof(AbsoluteIntegerEvaluationOptionPersist.UpperBound)).FailWith(this._localizer["Validation_Required", nameof(AbsoluteIntegerEvaluationOptionPersist.UpperBound)]),

                };
            }
        }
    }

    public class AbsoluteDecimalEvaluationOptionPersist : BaseEvaluationOptionPersist
    {
        public BoundedType<float> UpperBound { get; set; }
        public BoundedType<float> LowerBound { get; set; }
        public string MeasurementUnit { get; set; }

        public class AbsoluteDecimalEvaluationOptionPersistValidator : BaseEvaluationOptionPersist.BaseEvaluationOptionPersistValidator<AbsoluteDecimalEvaluationOptionPersist>
        {
            public AbsoluteDecimalEvaluationOptionPersistValidator(
                IConventionService conventionService,
                IStringLocalizer<Resources.MySharedResources> localizer,
                ValidatorFactory validatorFactory,
                ILogger<AbsoluteDecimalEvaluationOptionPersist> logger,
                ErrorThesaurus errors) : base(conventionService, localizer, validatorFactory, logger, errors)
            { }

            private bool ValidateBounds(AbsoluteDecimalEvaluationOptionPersist item)
            {
                if (item.UpperBound != null && !Enum.IsDefined(typeof(UpperBoundType), item.UpperBound.UpperBoundType)) return false;
                if (item.LowerBound != null && !Enum.IsDefined(typeof(UpperBoundType), item.LowerBound.UpperBoundType)) return false;

                if (item.UpperBound != null && item.LowerBound != null)
                {
                    if (item.UpperBound.Value < item.LowerBound.Value) return false;
                    if (item.UpperBound.Value == item.LowerBound.Value && (item.UpperBound.UpperBoundType != UpperBoundType.Inclusive || item.LowerBound.UpperBoundType != UpperBoundType.Inclusive)) return false;
                }

                return true;
            }

            protected override IEnumerable<ISpecification> GetSubClassSpecifications(AbsoluteDecimalEvaluationOptionPersist item)
            {
                //measurement unit must be non-empty & up to 250 characters
                return new ISpecification[] {
                    this.Spec()
                        .Must(() => (item.MeasurementUnit.Length > 0) && (item.MeasurementUnit.Length <= 250) )
                        .FailOn(nameof(AbsoluteDecimalEvaluationOptionPersist.MeasurementUnit)).FailWith(this._localizer["Validation_Required", nameof(AbsoluteDecimalEvaluationOptionPersist.MeasurementUnit)]),
                    this.Spec()
                        .Must(() => this.ValidateBounds(item))
                        .FailOn(nameof(AbsoluteDecimalInputOptionPersist.UpperBound)).FailWith(this._localizer["Validation_Required", nameof(AbsoluteDecimalInputOptionPersist.UpperBound)]),

                };
            }
        }
    }

    public class PercentageEvaluationOptionPersist : BaseEvaluationOptionPersist
    {
        public BoundedType<float> UpperBound { get; set; }
        public BoundedType<float> LowerBound { get; set; }

        public class PercentageEvaluationOptionPersistValidator : BaseEvaluationOptionPersist.BaseEvaluationOptionPersistValidator<PercentageEvaluationOptionPersist>
        {
            public PercentageEvaluationOptionPersistValidator(
                IConventionService conventionService,
                IStringLocalizer<Resources.MySharedResources> localizer,
                ValidatorFactory validatorFactory,
                ILogger<PercentageEvaluationOptionPersist> logger,
                ErrorThesaurus errors) : base(conventionService, localizer, validatorFactory, logger, errors)
            { }

            private bool ValidateBounds(PercentageEvaluationOptionPersist item)
            {
                if (item.UpperBound != null && !Enum.IsDefined(typeof(UpperBoundType), item.UpperBound.UpperBoundType)) return false;
                if (item.LowerBound != null && !Enum.IsDefined(typeof(UpperBoundType), item.LowerBound.UpperBoundType)) return false;

                if (item.UpperBound != null && item.LowerBound != null)
                {
                    if (item.UpperBound.Value < item.LowerBound.Value) return false;
                    if (item.UpperBound.Value == item.LowerBound.Value && (item.UpperBound.UpperBoundType != UpperBoundType.Inclusive || item.LowerBound.UpperBoundType != UpperBoundType.Inclusive)) return false;
                }

                return true;
            }

            protected override IEnumerable<ISpecification> GetSubClassSpecifications(PercentageEvaluationOptionPersist item)
            {
                return new ISpecification[] {
                    this.Spec()
                        .Must(() => this.ValidateBounds(item))
                        .FailOn(nameof(AbsoluteDecimalInputOptionPersist.UpperBound)).FailWith(this._localizer["Validation_Required", nameof(AbsoluteDecimalInputOptionPersist.UpperBound)]),

                };
            }
        }
    }

    public class TextEvaluationOptionPersist : BaseEvaluationOptionPersist
    {
        public class TextEvaluationOptionPersistValidator : BaseEvaluationOptionPersist.BaseEvaluationOptionPersistValidator<TextEvaluationOptionPersist>
        {
            public TextEvaluationOptionPersistValidator(
                IConventionService conventionService,
                IStringLocalizer<Resources.MySharedResources> localizer,
                ValidatorFactory validatorFactory,
                ILogger<TextEvaluationOptionPersist> logger,
                ErrorThesaurus errors) : base(conventionService, localizer, validatorFactory, logger, errors)
            { }

            protected override IEnumerable<ISpecification> GetSubClassSpecifications(TextEvaluationOptionPersist item)
            {
                return new ISpecification[] { };
            }
        }
    }

    public class ScaleEvaluationOptionPersist : BaseEvaluationOptionPersist
    {
        public ScaleDisplayOption ScaleDisplayOption { get; set; }
        public List<Data.EvaluationScaleValueData> EvaluationScale { get; set; }

        public class ScaleEvaluationOptionPersistValidator : BaseEvaluationOptionPersist.BaseEvaluationOptionPersistValidator<ScaleEvaluationOptionPersist>
        {
            public ScaleEvaluationOptionPersistValidator(
                IConventionService conventionService,
                IStringLocalizer<Resources.MySharedResources> localizer,
                ValidatorFactory validatorFactory,
                ILogger<ScaleEvaluationOptionPersist> logger,
                ErrorThesaurus errors) : base(conventionService, localizer, validatorFactory, logger, errors)
            { }

            protected override IEnumerable<ISpecification> GetSubClassSpecifications(ScaleEvaluationOptionPersist item)
            {
                return new ISpecification[] {
                    this.Spec()
                        .Must(() => item.EvaluationScale.All(x =>
                            (Enum.IsDefined(typeof(IconIdentifierType),x.IdType)) &&  // enum must be valid
                            (x.Label.Length > 0 && x.Label.Length <= 250) &&  // label must be a non-empty string of length less than or equal 250 characters
                            (x.IconIdentifier.Length > 0 && x.IconIdentifier.Length <= 250)  // iconIdentifier must be a non-empty string of length less than or equal 250 characters
                            )
                        )
                        .FailOn(nameof(ScaleEvaluationOptionPersist.EvaluationScale)).FailWith(this._localizer["Validation_Required", nameof(ScaleEvaluationOptionPersist.EvaluationScale)]),
                    this.Spec()
                        .Must(() => Enum.IsDefined(typeof(ScaleDisplayOption),item.ScaleDisplayOption) )
                        .FailOn(nameof(ScaleEvaluationOptionPersist.ScaleDisplayOption)).FailWith(this._localizer["Validation_Required", nameof(ScaleEvaluationOptionPersist.ScaleDisplayOption)]),

                };
            }
        }
    }

    public class SelectionEvaluationOptionPersist : BaseEvaluationOptionPersist
    {
        public List<Data.EvaluationSelectionOptionsData> EvaluationSelectionOptions { get; set; }

        public class SelectionEvaluationOptionPersistValidator : BaseEvaluationOptionPersist.BaseEvaluationOptionPersistValidator<SelectionEvaluationOptionPersist>
        {
            public SelectionEvaluationOptionPersistValidator(
                IConventionService conventionService,
                IStringLocalizer<Resources.MySharedResources> localizer,
                ValidatorFactory validatorFactory,
                ILogger<SelectionEvaluationOptionPersist> logger,
                ErrorThesaurus errors) : base(conventionService, localizer, validatorFactory, logger, errors)
            { }

            protected override IEnumerable<ISpecification> GetSubClassSpecifications(SelectionEvaluationOptionPersist item)
            {
                return new ISpecification[] {
                    this.Spec()
                        .Must(() => item.EvaluationSelectionOptions.All(x =>
                            (x.Key.Length > 0 && x.Key.Length <= 250) &&  // key must be a non-empty string of length less than or equal 250 characters
                            (x.Value.Length > 0 && x.Value.Length <= 250)  // value must be a non-empty string of length less than or equal 250 characters
                            )
                        )
                        .FailOn(nameof(SelectionEvaluationOptionPersist.EvaluationSelectionOptions)).FailWith(this._localizer["Validation_Required", nameof(SelectionEvaluationOptionPersist.EvaluationSelectionOptions)]),
                };
            }
        }
    }


}
