using Cite.EvalIt.Common;
using Cite.Tools.Json.Inflater;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.Data
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
        public ObjectRankRecalculationStrategyConfiguration StrategyConfig { get; set; }
        public Guid? SelectedRankingMethodologyId { get; set; }
        public bool MultipleReviewOption { get; set; }
        public IsActive IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class EvaluationConfiguration
    {
        public List<BaseEvaluationOption> EvalOptions { get; set; }
    }

    [BsonKnownTypes(typeof(AbsoluteIntegerEvaluationOption), typeof(AbsoluteDecimalEvaluationOption), typeof(PercentageEvaluationOption), typeof(TextEvaluationOption), typeof(ScaleEvaluationOption), typeof(SelectionEvaluationOption))]
    public class BaseEvaluationOption
    {
        public Guid OptionId { get; set; }
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
        public List<EvaluationScaleValueData> EvaluationScale { get; set; }
    }

    public class SelectionEvaluationOption : BaseEvaluationOption
    {
        public List<EvaluationSelectionOptionsData> EvaluationSelectionOptions { get; set; }
    }

    public class EvaluationSelectionOptionsData
    {
        public string Key { get; set; }
        public string Value { get; set; }
    }

    public class EvaluationScaleValueData
    {
        public string Label { get; set; }
        public IconIdentifierType IdType {get; set;}
        public string IconIdentifier { get; set; }
        public int Value { get; set; } 
    }

    public class RegistrationInformation
    {
        public List<RegistrationInformationInputOption> InputOptions { get; set; }
    }

    [BsonKnownTypes(typeof(AbsoluteIntegerInputOption), typeof(AbsoluteDecimalInputOption), typeof(PercentageInputOption), typeof(TextInputOption), typeof(ScaleInputOption), typeof(SelectionInputOption))]
    public class RegistrationInformationInputOption
    {
        public Guid OptionId { get; set; }
        public string Label { get; set; }
        public Boolean IsMandatory { get; set; }
        public Boolean MultiValue { get; set; }
        public RegistrationInformationType OptionType { get; set; }
        public IsActive IsActive { get; set; }
    }

    public class AbsoluteIntegerInputOption : RegistrationInformationInputOption
    {
        public BoundedType<int> UpperBound { get; set; }
        public BoundedType<int> LowerBound { get; set; }
        public string MeasurementUnit { get; set; }
        public string ValidationRegexp { get; set; }

    }

    public class AbsoluteDecimalInputOption : RegistrationInformationInputOption
    {
        public BoundedType<float> UpperBound { get; set; }
        public BoundedType<float> LowerBound { get; set; }
        public string MeasurementUnit { get; set; }
        public string ValidationRegexp { get; set; }

    }

    public class PercentageInputOption : RegistrationInformationInputOption
    {
        public BoundedType<float> UpperBound { get; set; }
        public BoundedType<float> LowerBound { get; set; }
        public string ValidationRegexp { get; set; }
    }

    public class TextInputOption : RegistrationInformationInputOption
    {
        public string ValidationRegexp { get; set; }
    }

    public class ScaleInputOption : RegistrationInformationInputOption
    {
        public ScaleDisplayOption ScaleDisplayOption { get; set; }
        public List<InputScaleValueData> InputScale { get; set; }
    }

    public class SelectionInputOption : RegistrationInformationInputOption
    {
        public List<InputSelectionOptionsData> InputSelectionOptions { get; set; }
    }

    public class InputSelectionOptionsData
    {
        public string Key { get; set; }
        public string Value { get; set; }
    }

    public class InputScaleValueData
    {
        public string Label { get; set; }
        public IconIdentifierType IdType { get; set; }
        public string IconIdentifier { get; set; }
        public int Value { get; set; }
    }
}

