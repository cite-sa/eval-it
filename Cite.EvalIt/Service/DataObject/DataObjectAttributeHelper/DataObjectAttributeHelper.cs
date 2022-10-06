using Cite.EvalIt.Model;
using Cite.Tools.Data.Builder;
using Cite.Tools.FieldSet;
using Cite.Tools.Validation;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectType.DataObjectAttributeHelper
{
    public abstract class DataObjectAttributeHelper<M, PM, D, O> : IDataObjectAttributeHelper where PM : DataObjectAttributePersist
                                                                                             where M : Model.DataObjectAttribute
                                                                                             where D : Data.DataObjectAttribute
                                                                                             where O : Data.RegistrationInformationInputOption
    {
        protected readonly BuilderFactory _builderFactory;
        protected readonly ValidatorFactory _validatorFactory;

        public DataObjectAttributeHelper(BuilderFactory builderFactory, ValidatorFactory validatorFactory)
        {
            _builderFactory = builderFactory;
            _validatorFactory = validatorFactory;
        }

        public abstract Task<Model.DataObjectAttribute> Build(IFieldSet fields, Data.DataObjectAttribute data);
        protected abstract bool Validate(PM item, O info);
        public abstract Data.DataObjectAttribute NewData();
        public abstract Data.DataObjectAttribute NewData(Data.DataObjectAttribute data);
        protected abstract void PersistChildClassFields(D data, PM model);

        public bool Validate(DataObjectAttributePersist model, Data.RegistrationInformationInputOption info)
        {
            if (model is PM && info is O)
                return this.Validate((PM)model, (O)info);
            else
                throw new System.ApplicationException("unrecognized type " + model.GetType().ToString());
        }

        public void PersistChildClassFields(Data.DataObjectAttribute data, DataObjectAttributePersist model)
        {
            if (model is PM)
                if (data is D)
                    this.PersistChildClassFields((D)data, (PM)model);
                else
                    throw new System.ApplicationException("unrecognized type " + data.GetType().ToString());
            else
                throw new System.ApplicationException("unrecognized type " + model.GetType().ToString());
        }
    }
}
