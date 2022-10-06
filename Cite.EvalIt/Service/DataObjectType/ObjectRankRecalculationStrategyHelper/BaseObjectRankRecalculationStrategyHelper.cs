using Cite.EvalIt.Model;
using Cite.Tools.Data.Builder;
using Cite.Tools.FieldSet;
using Cite.Tools.Validation;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectType.BaseObjectRankRecalculationStrategyHelper
{
    public abstract class BaseObjectRankRecalculationStrategyHelper<M, PM, D> : IBaseObjectRankRecalculationStrategyHelper where PM : BaseObjectRankRecalculationStrategyPersist
                                                                                                                           where M : Model.BaseObjectRankRecalculationStrategy
                                                                                                                           where D : Data.BaseObjectRankRecalculationStrategy
    {
        protected readonly BuilderFactory _builderFactory;
        protected readonly ValidatorFactory _validatorFactory;

        public BaseObjectRankRecalculationStrategyHelper(BuilderFactory builderFactory, ValidatorFactory validatorFactory)
        {
            _builderFactory = builderFactory;
            _validatorFactory = validatorFactory;
        }

        public abstract Task<Model.BaseObjectRankRecalculationStrategy> Build(IFieldSet fields, Data.BaseObjectRankRecalculationStrategy data);
        protected abstract void Validate(PM item);
        public abstract Data.BaseObjectRankRecalculationStrategy NewData();
        public abstract Data.BaseObjectRankRecalculationStrategy NewData(Data.BaseObjectRankRecalculationStrategy data);
        protected abstract void PersistChildClassFields(D data, PM model);
        protected abstract Task<float?> AggregateReviewRanks(D data, Data.DataObject dataObject);

        public Task<float?> AggregateReviewRanks(Data.BaseObjectRankRecalculationStrategy strategy, Data.DataObject dataObject)
        {
            if (strategy is D)
                return this.AggregateReviewRanks((D)strategy, dataObject);
            else
                throw new System.ApplicationException("unrecognized type " + strategy.GetType().ToString());
        }
        public void Validate(BaseObjectRankRecalculationStrategyPersist model)
        {
            if (model is PM)
                this.Validate((PM)model);
            else
                throw new System.ApplicationException("unrecognized type " + model.GetType().ToString());
        }

        public void PersistChildClassFields(Data.BaseObjectRankRecalculationStrategy data, BaseObjectRankRecalculationStrategyPersist model)
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
