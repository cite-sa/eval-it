using Cite.EvalIt.Model;
using Cite.Tools.Data.Builder;
using Cite.Tools.FieldSet;
using Cite.Tools.Validation;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectType.DataObjectAttributeHelper
{
    public class ScaleAttributeHelper : DataObjectAttributeHelper<Model.ScaleAttribute, ScaleAttributePersist, Data.ScaleAttribute, Data.ScaleInputOption>
    {
        public ScaleAttributeHelper(BuilderFactory builderFactory, ValidatorFactory validatorFactory) : base(builderFactory, validatorFactory)
        { }

        public override Data.DataObjectAttribute NewData()
        {
            return new Data.ScaleAttribute();
        }

        public override Data.DataObjectAttribute NewData(Data.DataObjectAttribute data)
        {
            return new Data.ScaleAttribute()
            {
                OptionId = data.OptionId,
                AttributeType = data.AttributeType
            };
        }

        public async override Task<Model.DataObjectAttribute> Build(IFieldSet fields, Data.DataObjectAttribute data)
        {
            return await this._builderFactory.Builder<ScaleAttributeBuilder>().Build(fields, data);
        }

        protected override bool Validate(ScaleAttributePersist item, Data.ScaleInputOption option)
        {
            if (option.GetType() != typeof(Data.ScaleInputOption)) return false;
            if (!option.MultiValue && item.Values.Count > 1) return false;
            if (item.Values.Count != item.Values.Distinct().Count()) return false;
            foreach (var val in item.Values) if (!((Data.ScaleInputOption)option).InputScale.Select(x => x.Value).Contains(val)) return false;
            
            return true;
        }

        protected override void PersistChildClassFields(Data.ScaleAttribute data, ScaleAttributePersist model)
        {
            data.Values = model.Values;
        }
    }
}
