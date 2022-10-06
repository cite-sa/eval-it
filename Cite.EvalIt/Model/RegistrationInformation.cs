using Cite.EvalIt.Common;
using Cite.EvalIt.Common.Validation;
using Cite.EvalIt.Common.Validation.Extensions;
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
    public class RegistrationInformation
    {
        public List<RegistrationInformationInputOption> InputOptions { get; set; }
    }

    public class RegistrationInformationInputOption
    {
        public Guid? OptionId { get; set; }
        public string Label { get; set; }
        public Boolean IsMandatory { get; set; }
        public Boolean MultiValue { get; set; }
        public string ValidationRegexp { get; set; }
        public RegistrationInformationType OptionType { get; set; }
        public IsActive IsActive { get; set; }
    }

    public class AbsoluteIntegerInputOption : RegistrationInformationInputOption
    {
        public BoundedType<int> UpperBound { get; set; }
        public BoundedType<int> LowerBound { get; set; }
        public string MeasurementUnit { get; set; }
    }

    public class AbsoluteDecimalInputOption : RegistrationInformationInputOption
    {
        public BoundedType<float> UpperBound { get; set; }
        public BoundedType<float> LowerBound { get; set; }
        public string MeasurementUnit { get; set; }
    }

    public class PercentageInputOption : RegistrationInformationInputOption
    {
        public BoundedType<float> UpperBound { get; set; }
        public BoundedType<float> LowerBound { get; set; }
    }

    public class TextInputOption : RegistrationInformationInputOption
    { }

    public class ScaleInputOption : RegistrationInformationInputOption
    {
        public ScaleDisplayOption ScaleDisplayOption { get; set; }
        public List<Data.InputScaleValueData> InputScale { get; set; }
    }

    public class SelectionInputOption : RegistrationInformationInputOption
    {
        public List<Data.InputSelectionOptionsData> InputSelectionOptions { get; set; }
    }


    public class RegistrationInformationPersist
    {
        public List<IRegistrationInformationInputOptionPersist> InputOptions { get; set; }
    }

    [JsonConverter(typeof(SubTypeConverter))]
    [SubTypeConverterAnchor(nameof(RegistrationInformationInputOptionPersist.OptionType), typeof(RegistrationInformationType))]
    [SubTypeConverterMap(RegistrationInformationType.AbsoluteDecimalInputOption, typeof(AbsoluteDecimalInputOptionPersist))]
    [SubTypeConverterMap(RegistrationInformationType.AbsoluteIntegerInputOption, typeof(AbsoluteIntegerInputOptionPersist))]
    [SubTypeConverterMap(RegistrationInformationType.PercentageInputOption, typeof(PercentageInputOptionPersist))]
    [SubTypeConverterMap(RegistrationInformationType.TextInputOption, typeof(TextInputOptionPersist))]
    [SubTypeConverterMap(RegistrationInformationType.ScaleInputOption, typeof(ScaleInputOptionPersist))]
    [SubTypeConverterMap(RegistrationInformationType.SelectionInputOption, typeof(SelectionInputOptionPersist))]
    public interface IRegistrationInformationInputOptionPersist
    {
        public Guid? OptionId { get; set; }
        public string Label { get; set; }
        public Boolean IsMandatory { get; set; }
        public Boolean MultiValue { get; set; }
        public RegistrationInformationType OptionType { get; set; }
        public IsActive IsActive { get; set; }
    }

    public class RegistrationInformationInputOptionPersist : IRegistrationInformationInputOptionPersist
    {
        public Guid? OptionId { get; set; }
        public string Label { get; set; }
        public Boolean IsMandatory { get; set; }
        public Boolean MultiValue { get; set; }
        public RegistrationInformationType OptionType { get; set; }
        public IsActive IsActive { get; set; }

        public abstract class RegistrationInformationInputOptionPersistValidator<T> : BaseValidator<T> where T : RegistrationInformationInputOptionPersist
        {
            public RegistrationInformationInputOptionPersistValidator(
                IConventionService conventionService,
                IStringLocalizer<Resources.MySharedResources> localizer,
                ValidatorFactory validatorFactory,
                ILogger<RegistrationInformationInputOptionPersist> logger,
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
                        .FailOn(nameof(RegistrationInformationInputOptionPersist.OptionId)).FailWith(this._localizer["Validation_Required", nameof(RegistrationInformationInputOptionPersist.OptionId)]),
					//label must be non-empty & up to 250 characters
					this.Spec()
                        .Must(() => (item.Label.Length > 0) && (item.Label.Length <= 250) )
                        .FailOn(nameof(RegistrationInformationInputOptionPersist.Label)).FailWith(this._localizer["Validation_Required", nameof(RegistrationInformationInputOptionPersist.Label)]),
					//RegistrationInformationType enum must be vaild
					this.Spec()
                        .Must(() => Enum.IsDefined(typeof(RegistrationInformationType),item.OptionType) )
                        .FailOn(nameof(RegistrationInformationInputOptionPersist.OptionType)).FailWith(this._localizer["Validation_Required", nameof(RegistrationInformationInputOptionPersist.OptionType)]),
                    //IsActive enum must be vaild
					this.Spec()
                        .Must(() => Enum.IsDefined(typeof(IsActive),item.IsActive) )
                        .FailOn(nameof(RegistrationInformationInputOptionPersist.IsActive)).FailWith(this._localizer["Validation_Required", nameof(RegistrationInformationInputOptionPersist.IsActive)]),
                }.Concat(GetSubClassSpecifications(item));
            }
        }
    }

    public class AbsoluteIntegerInputOptionPersist : RegistrationInformationInputOptionPersist
    {
        public BoundedType<int> UpperBound { get; set; }
        public BoundedType<int> LowerBound { get; set; }
        public string MeasurementUnit { get; set; }
        public string ValidationRegexp { get; set; }

        public class AbsoluteIntegerInputOptionPersistValidator : RegistrationInformationInputOptionPersist.RegistrationInformationInputOptionPersistValidator<AbsoluteIntegerInputOptionPersist>
        {
            public AbsoluteIntegerInputOptionPersistValidator(
                IConventionService conventionService,
                IStringLocalizer<Resources.MySharedResources> localizer,
                ValidatorFactory validatorFactory,
                ILogger<AbsoluteIntegerInputOptionPersist> logger,
                ErrorThesaurus errors) : base(conventionService, localizer, validatorFactory, logger, errors)
            { }

            private bool ValidateBounds(AbsoluteIntegerInputOptionPersist item)
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

            protected override IEnumerable<ISpecification> GetSubClassSpecifications(AbsoluteIntegerInputOptionPersist item)
            {
                //measurement unit must be non-empty & up to 250 characters
                return new ISpecification[] {
                    this.Spec()
                        .Must(() => (item.MeasurementUnit.Length > 0) && (item.MeasurementUnit.Length <= 250) )
                        .FailOn(nameof(AbsoluteIntegerInputOptionPersist.MeasurementUnit)).FailWith(this._localizer["Validation_Required", nameof(AbsoluteIntegerInputOptionPersist.MeasurementUnit)]),
                //Regexp must be null or vaild
					this.Spec()
                        .Must(() => (item.ValidationRegexp == null || item.ValidationRegexp == "" || item.ValidationRegexp.IsValidRegexp()))
                        .FailOn(nameof(AbsoluteIntegerInputOptionPersist.ValidationRegexp)).FailWith(this._localizer["Validation_Required", nameof(AbsoluteIntegerInputOptionPersist.ValidationRegexp)]),
                    this.Spec()
                        .Must(() => this.ValidateBounds(item))
                        .FailOn(nameof(AbsoluteIntegerInputOptionPersist.UpperBound)).FailWith(this._localizer["Validation_Required", nameof(AbsoluteIntegerInputOptionPersist.UpperBound)]),

                };
            }
        }
    }

    public class AbsoluteDecimalInputOptionPersist : RegistrationInformationInputOptionPersist
    {
        public BoundedType<float> UpperBound { get; set; }
        public BoundedType<float> LowerBound { get; set; }
        public string MeasurementUnit { get; set; }
        public string ValidationRegexp { get; set; }

        public class AbsoluteDecimalInputOptionPersistValidator : RegistrationInformationInputOptionPersist.RegistrationInformationInputOptionPersistValidator<AbsoluteDecimalInputOptionPersist>
        {
            public AbsoluteDecimalInputOptionPersistValidator(
                IConventionService conventionService,
                IStringLocalizer<Resources.MySharedResources> localizer,
                ValidatorFactory validatorFactory,
                ILogger<AbsoluteDecimalInputOptionPersist> logger,
                ErrorThesaurus errors) : base(conventionService, localizer, validatorFactory, logger, errors)
            { }

            private bool ValidateBounds(AbsoluteDecimalInputOptionPersist item)
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

            protected override IEnumerable<ISpecification> GetSubClassSpecifications(AbsoluteDecimalInputOptionPersist item)
            {
                //measurement unit must be non-empty & up to 250 characters
                return new ISpecification[] {
                    this.Spec()
                        .Must(() => (item.MeasurementUnit.Length > 0) && (item.MeasurementUnit.Length <= 250) )
                        .FailOn(nameof(AbsoluteDecimalInputOptionPersist.MeasurementUnit)).FailWith(this._localizer["Validation_Required", nameof(AbsoluteDecimalInputOptionPersist.MeasurementUnit)]),
                //Regexp must be null or vaild
					this.Spec()
                        .Must(() => (item.ValidationRegexp == null || item.ValidationRegexp == "" || item.ValidationRegexp.IsValidRegexp()))
                        .FailOn(nameof(AbsoluteDecimalInputOptionPersist.ValidationRegexp)).FailWith(this._localizer["Validation_Required", nameof(AbsoluteDecimalInputOptionPersist.ValidationRegexp)]),
                    this.Spec()
                        .Must(() => this.ValidateBounds(item))
                        .FailOn(nameof(AbsoluteDecimalInputOptionPersist.UpperBound)).FailWith(this._localizer["Validation_Required", nameof(AbsoluteDecimalInputOptionPersist.UpperBound)]),
                };
            }
        }
    }

    public class PercentageInputOptionPersist : RegistrationInformationInputOptionPersist
    {
        public BoundedType<float> UpperBound { get; set; }
        public BoundedType<float> LowerBound { get; set; }
        public string ValidationRegexp { get; set; }

        public class PercentageInputOptionPersistValidator : RegistrationInformationInputOptionPersist.RegistrationInformationInputOptionPersistValidator<PercentageInputOptionPersist>
        {
            public PercentageInputOptionPersistValidator(
                IConventionService conventionService,
                IStringLocalizer<Resources.MySharedResources> localizer,
                ValidatorFactory validatorFactory,
                ILogger<PercentageInputOptionPersist> logger,
                ErrorThesaurus errors) : base(conventionService, localizer, validatorFactory, logger, errors)
            { }

            private bool ValidateBounds(PercentageInputOptionPersist item)
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

            protected override IEnumerable<ISpecification> GetSubClassSpecifications(PercentageInputOptionPersist item)
            {
                return new ISpecification[] {
                //Regexp must be null or vaild
					this.Spec()
                        .Must(() => (item.ValidationRegexp == null || item.ValidationRegexp == "" || item.ValidationRegexp.IsValidRegexp()))
                        .FailOn(nameof(PercentageInputOptionPersist.ValidationRegexp)).FailWith(this._localizer["Validation_Required", nameof(PercentageInputOptionPersist.ValidationRegexp)]),
                    this.Spec()
                        .Must(() => this.ValidateBounds(item))
                        .FailOn(nameof(PercentageInputOptionPersist.UpperBound)).FailWith(this._localizer["Validation_Required", nameof(PercentageInputOptionPersist.UpperBound)]),

                };
            }
        }
    }

    public class TextInputOptionPersist : RegistrationInformationInputOptionPersist
    {
        public string ValidationRegexp { get; set; }

        public class TextInputOptionPersistValidator : RegistrationInformationInputOptionPersist.RegistrationInformationInputOptionPersistValidator<TextInputOptionPersist>
        {
            public TextInputOptionPersistValidator(
                IConventionService conventionService,
                IStringLocalizer<Resources.MySharedResources> localizer,
                ValidatorFactory validatorFactory,
                ILogger<TextInputOptionPersist> logger,
                ErrorThesaurus errors) : base(conventionService, localizer, validatorFactory, logger, errors)
            { }

            protected override IEnumerable<ISpecification> GetSubClassSpecifications(TextInputOptionPersist item)
            {
                return new ISpecification[] {
                //Regexp must be null or vaild
					this.Spec()
                        .Must(() => (item.ValidationRegexp == null || item.ValidationRegexp == "" || item.ValidationRegexp.IsValidRegexp()))
                        .FailOn(nameof(TextInputOptionPersist.ValidationRegexp)).FailWith(this._localizer["Validation_Required", nameof(TextInputOptionPersist.ValidationRegexp)]),
                };
            }
        }
    }

    public class ScaleInputOptionPersist : RegistrationInformationInputOptionPersist
    {
        public ScaleDisplayOption ScaleDisplayOption { get; set; }
        public List<Data.InputScaleValueData> InputScale { get; set; }

        public class ScaleInputOptionPersistValidator : RegistrationInformationInputOptionPersist.RegistrationInformationInputOptionPersistValidator<ScaleInputOptionPersist>
        {
            public ScaleInputOptionPersistValidator(
                IConventionService conventionService,
                IStringLocalizer<Resources.MySharedResources> localizer,
                ValidatorFactory validatorFactory,
                ILogger<ScaleInputOptionPersist> logger,
                ErrorThesaurus errors) : base(conventionService, localizer, validatorFactory, logger, errors)
            { }

            protected override IEnumerable<ISpecification> GetSubClassSpecifications(ScaleInputOptionPersist item)
            {
                return new ISpecification[] {
                    this.Spec()
                        .Must(() => item.InputScale.All(x =>
                            (Enum.IsDefined(typeof(IconIdentifierType),x.IdType)) &&  // enum must be valid
                            (x.Label.Length > 0 && x.Label.Length <= 250) &&  // label must be a non-empty string of length less than or equal 250 characters
                            (x.IconIdentifier.Length > 0 && x.IconIdentifier.Length <= 250)  // iconIdentifier must be a non-empty string of length less than or equal 250 characters
                            )
                        )
                        .FailOn(nameof(ScaleInputOptionPersist.InputScale)).FailWith(this._localizer["Validation_Required", nameof(ScaleInputOptionPersist.InputScale)]),
                    this.Spec()
                        .Must(() => Enum.IsDefined(typeof(ScaleDisplayOption),item.ScaleDisplayOption) )
                        .FailOn(nameof(ScaleInputOptionPersist.ScaleDisplayOption)).FailWith(this._localizer["Validation_Required", nameof(ScaleInputOptionPersist.ScaleDisplayOption)]),
                };
            }
        }
    }

    public class SelectionInputOptionPersist : RegistrationInformationInputOptionPersist
    {
        public List<Data.InputSelectionOptionsData> InputSelectionOptions { get; set; }

        public class SelectionInputOptionPersistValidator : RegistrationInformationInputOptionPersist.RegistrationInformationInputOptionPersistValidator<SelectionInputOptionPersist>
        {
            public SelectionInputOptionPersistValidator(
                IConventionService conventionService,
                IStringLocalizer<Resources.MySharedResources> localizer,
                ValidatorFactory validatorFactory,
                ILogger<SelectionInputOptionPersist> logger,
                ErrorThesaurus errors) : base(conventionService, localizer, validatorFactory, logger, errors)
            { }

            protected override IEnumerable<ISpecification> GetSubClassSpecifications(SelectionInputOptionPersist item)
            {
                return new ISpecification[] {
                    this.Spec()
                        .Must(() => item.InputSelectionOptions.All(x =>
                            (x.Key.Length > 0 && x.Key.Length <= 250) &&  // key must be a non-empty string of length less than or equal 250 characters
                            (x.Value.Length > 0 && x.Value.Length <= 250)  // value must be a non-empty string of length less than or equal 250 characters
                            )
                        )
                        .FailOn(nameof(SelectionInputOptionPersist.InputSelectionOptions)).FailWith(this._localizer["Validation_Required", nameof(SelectionInputOptionPersist.InputSelectionOptions)]),
                };
            }
        }
    }
}
