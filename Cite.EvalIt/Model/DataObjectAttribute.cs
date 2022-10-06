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
    public class DataObjectAttributeData
    {
        public List<DataObjectAttribute> Attributes { get; set; }
    }

    public class DataObjectAttribute
    {
        public Guid OptionId { get; set; }
        public DataObjectAttributeType AttributeType { get; set; }
    }

    public class AbsoluteIntegerAttribute : DataObjectAttribute
    {
        public List<int> Values { get; set; }
    }

    public class AbsoluteDecimalAttribute : DataObjectAttribute
    {
        public List<float> Values { get; set; }
    }

    public class PercentageAttribute : DataObjectAttribute
    {
        public List<float> Values { get; set; }
    }

    public class TextAttribute : DataObjectAttribute
    {
        public List<string> Values { get; set; }
    }

    public class ScaleAttribute : DataObjectAttribute
    {
        public List<int> Values { get; set; }
    }

    public class SelectionAttribute : DataObjectAttribute
    {
        public List<string> Values { get; set; }
    }


    public class DataObjectAttributeDataPersist
    {
        public List<IDataObjectAttributePersist> Attributes { get; set; }
    }

    [JsonConverter(typeof(SubTypeConverter))]
    [SubTypeConverterAnchor(nameof(IDataObjectAttributePersist.AttributeType), typeof(DataObjectAttributeType))]
    [SubTypeConverterMap(DataObjectAttributeType.AbsoluteDecimalAttribute, typeof(AbsoluteDecimalAttributePersist))]
    [SubTypeConverterMap(DataObjectAttributeType.AbsoluteIntegerAttribute, typeof(AbsoluteIntegerAttributePersist))]
    [SubTypeConverterMap(DataObjectAttributeType.PercentageAttribute, typeof(PercentageAttributePersist))]
    [SubTypeConverterMap(DataObjectAttributeType.TextAttribute, typeof(TextAttributePersist))]
    [SubTypeConverterMap(DataObjectAttributeType.ScaleAttribute, typeof(ScaleAttributePersist))]
    [SubTypeConverterMap(DataObjectAttributeType.SelectionAttribute, typeof(SelectionAttributePersist))]
    public interface IDataObjectAttributePersist
    {
        public Guid OptionId { get; set; }
        public DataObjectAttributeType AttributeType { get; set; }
    }

    public class DataObjectAttributePersist : IDataObjectAttributePersist
    {
        public Guid OptionId { get; set; }
        public DataObjectAttributeType AttributeType { get; set; }

        public class DataObjectAttributePersistValidator : BaseValidator<DataObjectAttributePersist>
        {
            public DataObjectAttributePersistValidator(
                IConventionService conventionService,
                IStringLocalizer<Resources.MySharedResources> localizer,
                ValidatorFactory validatorFactory,
                ILogger<DataObjectAttributePersist> logger,
                ErrorThesaurus errors) : base(conventionService, validatorFactory, logger, errors)
            {
                this._localizer = localizer;
            }

            protected readonly IStringLocalizer<Resources.MySharedResources> _localizer;

            protected override IEnumerable<ISpecification> Specifications(DataObjectAttributePersist item)
            {
                return new ISpecification[] {
                    //optionid must be valid guid
                    this.Spec()
                        .Must(() => this.IsValidGuid(item.OptionId))
                        .FailOn(nameof(DataObjectAttributePersist.OptionId)).FailWith(this._localizer["Validation_Required", nameof(DataObjectAttributePersist.OptionId)]),
					//EvaluationConfigurationType enum must be vaild
					this.Spec()
                        .Must(() => Enum.IsDefined(typeof(DataObjectAttributeType),item.AttributeType) )
                        .FailOn(nameof(DataObjectAttributePersist.AttributeType)).FailWith(this._localizer["Validation_Required", nameof(DataObjectAttributePersist.AttributeType)]),
                };
            }
        }
    }

    public class AbsoluteIntegerAttributePersist : DataObjectAttributePersist
    {
        public List<int> Values { get; set; }
    }

    public class AbsoluteDecimalAttributePersist : DataObjectAttributePersist
    {
        public List<float> Values { get; set; }
    }

    public class PercentageAttributePersist : DataObjectAttributePersist
    {
        public List<float> Values { get; set; }
    }

    public class TextAttributePersist : DataObjectAttributePersist
    {
        public List<string> Values { get; set; }
    }

    public class ScaleAttributePersist : DataObjectAttributePersist
    {
        public List<int> Values { get; set; }
    }

    public class SelectionAttributePersist : DataObjectAttributePersist
    {
        public List<string> Values { get; set; }
    }
}
