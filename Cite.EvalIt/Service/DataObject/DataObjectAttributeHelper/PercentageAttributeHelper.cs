using Cite.EvalIt.Model;
using Cite.Tools.Data.Builder;
using Cite.Tools.FieldSet;
using Cite.Tools.Validation;
using System;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectType.DataObjectAttributeHelper
{
    public class PercentageAttributeHelper : DataObjectAttributeHelper<Model.PercentageAttribute, PercentageAttributePersist, Data.PercentageAttribute, Data.PercentageInputOption>
    {
        public PercentageAttributeHelper(BuilderFactory builderFactory, ValidatorFactory validatorFactory) : base(builderFactory, validatorFactory)
        { }

        public override Data.DataObjectAttribute NewData()
        {
            return new Data.PercentageAttribute();
        }

        public override Data.DataObjectAttribute NewData(Data.DataObjectAttribute data)
        {
            return new Data.PercentageAttribute()
            {
                OptionId = data.OptionId,
                AttributeType = data.AttributeType
            };
        }

        public async override Task<Model.DataObjectAttribute> Build(IFieldSet fields, Data.DataObjectAttribute data)
        {
            return await this._builderFactory.Builder<PercentageAttributeBuilder>().Build(fields, data);
        }

        protected override bool Validate(PercentageAttributePersist item, Data.PercentageInputOption option)
        {
            if (option.GetType() != typeof(Data.PercentageInputOption)) return false;
            if (!option.MultiValue && (item.Values.Count > 1)) return false;

            if (!string.IsNullOrEmpty(option.ValidationRegexp))
            {
                Regex regexp = new Regex(option.ValidationRegexp);
                foreach (var val in item.Values) if (!regexp.Match(val.ToString()).Success) return false;
            }

            if (option?.LowerBound?.Value != null)
                foreach (var val in item.Values)
                {
                    if (val < option.LowerBound.Value) return false;
                    if (option.LowerBound.UpperBoundType == Common.UpperBoundType.Exclusive && val == option.LowerBound.Value) return false;
                }

            if (option?.UpperBound?.Value != null)
                foreach (var val in item.Values)
                {
                    if (val > option.UpperBound.Value) return false;
                    if (option.UpperBound.UpperBoundType == Common.UpperBoundType.Exclusive && val == option.UpperBound.Value) return false;
                }

            return true;
        }

        protected override void PersistChildClassFields(Data.PercentageAttribute data, PercentageAttributePersist model)
        {
            data.Values = model.Values;
        }
    }
}