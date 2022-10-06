using Cite.EvalIt.Model;
using Cite.Tools.Data.Builder;
using Cite.Tools.FieldSet;
using Cite.Tools.Validation;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectType.ReviewEvaluationHelper
{
    public abstract class ReviewEvaluationHelper<M, PM, D, O> : IReviewEvaluationHelper where PM : ReviewEvaluationPersist
                                                                                        where M : Model.ReviewEvaluation
                                                                                        where D : Data.ReviewEvaluation
                                                                                        where O : Data.BaseEvaluationOption
    {
        protected readonly BuilderFactory _builderFactory;
        protected readonly ValidatorFactory _validatorFactory;

        public ReviewEvaluationHelper(BuilderFactory builderFactory, ValidatorFactory validatorFactory)
        {
            _builderFactory = builderFactory;
            _validatorFactory = validatorFactory;
        }

        public abstract Task<Model.ReviewEvaluation> Build(IFieldSet fields, Data.ReviewEvaluation data);
        protected abstract bool Validate(PM item, O info);
        public abstract Data.ReviewEvaluation NewData();
        public abstract Data.ReviewEvaluation NewData(Data.ReviewEvaluation data);
        protected abstract void PersistChildClassFields(D data, PM model);

        public bool Validate(ReviewEvaluationPersist model, Data.BaseEvaluationOption info)
        {
            if (model is PM && info is O)
                return this.Validate((PM)model, (O)info);
            else
                throw new System.ApplicationException("unrecognized type " + model.GetType().ToString());
        }

        public void PersistChildClassFields(Data.ReviewEvaluation data, ReviewEvaluationPersist model)
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
