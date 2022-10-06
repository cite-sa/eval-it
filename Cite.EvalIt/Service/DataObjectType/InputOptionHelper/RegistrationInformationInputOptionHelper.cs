using Cite.EvalIt.Model;
using Cite.Tools.Data.Builder;
using Cite.Tools.FieldSet;
using Cite.Tools.Validation;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectType.RegistrationInformationInputOptionHelper
{
    public abstract class RegistrationInformationInputOptionHelper<M, PM, D> : IRegistrationInformationInputOptionHelper where PM : RegistrationInformationInputOptionPersist
                                                                                                                         where M : Model.RegistrationInformationInputOption
                                                                                                                         where D : Data.RegistrationInformationInputOption
    {
        protected readonly BuilderFactory _builderFactory;
        protected readonly ValidatorFactory _validatorFactory;

        public RegistrationInformationInputOptionHelper(BuilderFactory builderFactory, ValidatorFactory validatorFactory)
        {
            _builderFactory = builderFactory;
            _validatorFactory = validatorFactory;
        }

        public abstract Task<Model.RegistrationInformationInputOption> Build(IFieldSet fields, Data.RegistrationInformationInputOption data);
        protected abstract void Validate(PM item);
        public abstract Data.RegistrationInformationInputOption NewData();
        public abstract Data.RegistrationInformationInputOption NewData(Data.RegistrationInformationInputOption data);
        protected abstract void PersistChildClassFields(D data, PM model);

        public void Validate(RegistrationInformationInputOptionPersist model)
        {
            if (model is PM)
                this.Validate((PM)model);
            else
                throw new System.ApplicationException("unrecognized type " + model.GetType().ToString());
        }

        public void PersistChildClassFields(Data.RegistrationInformationInputOption data, RegistrationInformationInputOptionPersist model)
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
