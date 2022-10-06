using Cite.EvalIt.Model;
using Cite.Tools.Data.Builder;
using Cite.Tools.FieldSet;
using Cite.Tools.Validation;
using System;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectType.DataObjectAttributeHelper
{
    public class AbsoluteDecimalAttributeHelper : DataObjectAttributeHelper<Model.AbsoluteDecimalAttribute, AbsoluteDecimalAttributePersist, Data.AbsoluteDecimalAttribute, Data.AbsoluteDecimalInputOption>
    {
        public AbsoluteDecimalAttributeHelper(BuilderFactory builderFactory, ValidatorFactory validatorFactory) : base(builderFactory, validatorFactory)
        { }

        public override Data.DataObjectAttribute NewData()
        {
            return new Data.AbsoluteDecimalAttribute();
        }

        public override Data.DataObjectAttribute NewData(Data.DataObjectAttribute data)
        {
            return new Data.AbsoluteDecimalAttribute()
            {
                OptionId = data.OptionId,
                AttributeType = data.AttributeType
            };
        }

        public async override Task<Model.DataObjectAttribute> Build(IFieldSet fields, Data.DataObjectAttribute data)
        {
            return await this._builderFactory.Builder<AbsoluteDecimalAttributeBuilder>().Build(fields, data);
        }

        protected override bool Validate(AbsoluteDecimalAttributePersist item, Data.AbsoluteDecimalInputOption option)
        {
            if (option.GetType() != typeof(Data.AbsoluteDecimalInputOption)) return false;
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

        protected override void PersistChildClassFields(Data.AbsoluteDecimalAttribute data, AbsoluteDecimalAttributePersist model)
        {
            data.Values = model.Values;
        }
    }
}
