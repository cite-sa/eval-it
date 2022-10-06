using Cite.EvalIt.Model;
using Cite.Tools.Data.Builder;
using Cite.Tools.FieldSet;
using Cite.Tools.Validation;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectType.EvaluationOptionHelper
{
    public abstract class BaseEvaluationOptionHelper<M, PM, D> : IBaseEvaluationOptionHelper where PM : BaseEvaluationOptionPersist
                                                                                             where M : Model.BaseEvaluationOption
                                                                                             where D : Data.BaseEvaluationOption
    {
        protected readonly BuilderFactory _builderFactory;
        protected readonly ValidatorFactory _validatorFactory;

        public BaseEvaluationOptionHelper(BuilderFactory builderFactory, ValidatorFactory validatorFactory)
        {
            _builderFactory = builderFactory;
            _validatorFactory = validatorFactory;
        }

        public abstract Task<Model.BaseEvaluationOption> Build(IFieldSet fields, Data.BaseEvaluationOption data);
        protected abstract void Validate(PM item);
        public abstract Data.BaseEvaluationOption NewData();
        public abstract Data.BaseEvaluationOption NewData(Data.BaseEvaluationOption data);
        protected abstract void PersistChildClassFields(D data, PM model);

        public void Validate(BaseEvaluationOptionPersist model)
        {
            if (model is PM)
                this.Validate((PM)model);
            else
                throw new System.ApplicationException("unrecognized type " + model.GetType().ToString());
        }

        public void PersistChildClassFields(Data.BaseEvaluationOption data, BaseEvaluationOptionPersist model)
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
