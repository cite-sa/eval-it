using Cite.EvalIt.Common;
using Cite.EvalIt.Model;
using Cite.Tools.Data.Builder;
using Cite.Tools.FieldSet;
using Cite.Tools.Validation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectType.BaseObjectRankRecalculationStrategyHelper
{
    public class AllEqualObjectRankRecalculationStrategyHelper : BaseObjectRankRecalculationStrategyHelper<Model.AllEqualObjectRankRecalculationStrategy, AllEqualObjectRankRecalculationStrategyPersist, Data.AllEqualObjectRankRecalculationStrategy>
    {
        public AllEqualObjectRankRecalculationStrategyHelper(BuilderFactory builderFactory, ValidatorFactory validatorFactory) : base(builderFactory, validatorFactory)
        { }

        public override Data.BaseObjectRankRecalculationStrategy NewData()
        {
            return new Data.AllEqualObjectRankRecalculationStrategy();
        }

        public override Data.BaseObjectRankRecalculationStrategy NewData(Data.BaseObjectRankRecalculationStrategy data)
        {
            return new Data.AllEqualObjectRankRecalculationStrategy()
            {
                StrategyType = data.StrategyType,
                StrategyWeight = data.StrategyWeight
            };
        }

        public async override Task<Model.BaseObjectRankRecalculationStrategy> Build(IFieldSet fields, Data.BaseObjectRankRecalculationStrategy data)
        {
            return await this._builderFactory.Builder<AllEqualObjectRankRecalculationStrategyBuilder>().Build(fields, data);
        }

        protected override void Validate(AllEqualObjectRankRecalculationStrategyPersist item)
        {
            this._validatorFactory.Validator<AllEqualObjectRankRecalculationStrategyPersist.AllEqualObjectRankRecalculationStrategyPersistValidator>().ValidateForce(item);
        }

        protected override void PersistChildClassFields(Data.AllEqualObjectRankRecalculationStrategy data, AllEqualObjectRankRecalculationStrategyPersist model)
        { }

        protected override Task<float?> AggregateReviewRanks(Data.AllEqualObjectRankRecalculationStrategy data, Data.DataObject dataObject)
        {
            IEnumerable<Data.DataObjectReview> reviews = dataObject.Reviews.Where(x => x.IsActive == IsActive.Active);

            float rankSum = 0;
            int reviewCount = 0;
            
            foreach (var review in reviews)
            {
                if (review.RankScore != null)
                {
                    rankSum += review.RankScore.Value;
                    reviewCount++;
                }
            }
            if (reviewCount > 0)
            {
                float? result = rankSum / reviewCount;
                return Task.FromResult(result);
            }
            return Task.FromResult((float?)null);
        }
    }
}
