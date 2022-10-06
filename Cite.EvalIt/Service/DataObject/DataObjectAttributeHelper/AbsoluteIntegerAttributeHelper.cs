using Cite.EvalIt.Model;
using Cite.Tools.Data.Builder;
using Cite.Tools.FieldSet;
using Cite.Tools.Validation;
using System;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectType.DataObjectAttributeHelper
{
    public class AbsoluteIntegerAttributeHelper : DataObjectAttributeHelper<Model.AbsoluteIntegerAttribute, AbsoluteIntegerAttributePersist, Data.AbsoluteIntegerAttribute, Data.AbsoluteIntegerInputOption>
    {
        public AbsoluteIntegerAttributeHelper(BuilderFactory builderFactory, ValidatorFactory validatorFactory) : base(builderFactory, validatorFactory)
        { }

        public override Data.DataObjectAttribute NewData()
        {
            return new Data.AbsoluteIntegerAttribute();
        }

        public override Data.DataObjectAttribute NewData(Data.DataObjectAttribute data)
        {
            return new Data.AbsoluteIntegerAttribute()
            {
                OptionId = data.OptionId,
                AttributeType = data.AttributeType
            };
        }

        public async override Task<Model.DataObjectAttribute> Build(IFieldSet fields, Data.DataObjectAttribute data)
        {
            return await this._builderFactory.Builder<AbsoluteIntegerAttributeBuilder>().Build(fields, data);
        }

        protected override bool Validate(AbsoluteIntegerAttributePersist item, Data.AbsoluteIntegerInputOption option)
        {
            if (option.GetType() != typeof(Data.AbsoluteIntegerInputOption)) return false;
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

        protected override void PersistChildClassFields(Data.AbsoluteIntegerAttribute data, AbsoluteIntegerAttributePersist model)
        {
            data.Values = model.Values;
        }
    }
}