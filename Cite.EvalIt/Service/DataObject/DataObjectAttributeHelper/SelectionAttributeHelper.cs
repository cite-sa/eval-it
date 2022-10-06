using Cite.EvalIt.Model;
using Cite.Tools.Data.Builder;
using Cite.Tools.FieldSet;
using Cite.Tools.Validation;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectType.DataObjectAttributeHelper
{
    public class SelectionAttributeHelper : DataObjectAttributeHelper<Model.SelectionAttribute, SelectionAttributePersist, Data.SelectionAttribute, Data.SelectionInputOption>
    {
        public SelectionAttributeHelper(BuilderFactory builderFactory, ValidatorFactory validatorFactory) : base(builderFactory, validatorFactory)
        { }

        public override Data.DataObjectAttribute NewData()
        {
            return new Data.SelectionAttribute();
        }

        public override Data.DataObjectAttribute NewData(Data.DataObjectAttribute data)
        {
            return new Data.SelectionAttribute()
            {
                OptionId = data.OptionId,
                AttributeType = data.AttributeType
            };
        }

        public async override Task<Model.DataObjectAttribute> Build(IFieldSet fields, Data.DataObjectAttribute data)
        {
            return await this._builderFactory.Builder<SelectionAttributeBuilder>().Build(fields, data);
        }

        protected override bool Validate(SelectionAttributePersist item, Data.SelectionInputOption option)
        {
            if (option.GetType() != typeof(Data.SelectionInputOption)) return false;
            if (!option.MultiValue && item.Values.Count > 1) return false;
            if (item.Values.Count != item.Values.Distinct().Count()) return false;
            foreach (var val in item.Values) if (!((Data.SelectionInputOption)option).InputSelectionOptions.Select(x => x.Key).Contains(val)) return false;

            return true;
        }

        protected override void PersistChildClassFields(Data.SelectionAttribute data, SelectionAttributePersist model)
        {
            data.Values = model.Values;
        }
    }
}
