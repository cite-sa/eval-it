using Cite.EvalIt.Model;
using Cite.Tools.Data.Builder;
using Cite.Tools.FieldSet;
using Cite.Tools.Validation;
using System;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectType.DataObjectAttributeHelper
{
    public class TextAttributeHelper : DataObjectAttributeHelper<Model.TextAttribute, TextAttributePersist, Data.TextAttribute, Data.TextInputOption>
    {
        public TextAttributeHelper(BuilderFactory builderFactory, ValidatorFactory validatorFactory) : base(builderFactory, validatorFactory)
        { }

        public override Data.DataObjectAttribute NewData()
        {
            return new Data.TextAttribute();
        }

        public override Data.DataObjectAttribute NewData(Data.DataObjectAttribute data)
        {
            return new Data.TextAttribute()
            {
                OptionId = data.OptionId,
                AttributeType = data.AttributeType
            };
        }

        public async override Task<Model.DataObjectAttribute> Build(IFieldSet fields, Data.DataObjectAttribute data)
        {
            return await this._builderFactory.Builder<TextAttributeBuilder>().Build(fields, data);
        }

        protected override bool Validate(TextAttributePersist item, Data.TextInputOption option)
        {
            if (option.GetType() != typeof(Data.TextInputOption)) return false;
            if (!option.MultiValue && (item.Values.Count > 1)) return false;

            if (!string.IsNullOrEmpty(option.ValidationRegexp))
            {
                Regex regexp = new Regex(option.ValidationRegexp);
                foreach (var val in item.Values) if (!regexp.Match(val.ToString()).Success) return false;
            }

            return true;
        }

        protected override void PersistChildClassFields(Data.TextAttribute data, TextAttributePersist model)
        {
            data.Values = model.Values;
        }
    }
}
