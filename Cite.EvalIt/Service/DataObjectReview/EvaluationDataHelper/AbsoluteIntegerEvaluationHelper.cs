using Cite.EvalIt.Model;
using Cite.Tools.Data.Builder;
using Cite.Tools.FieldSet;
using Cite.Tools.Validation;
using System;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectType.ReviewEvaluationHelper
{
    public class AbsoluteIntegerEvaluationHelper : ReviewEvaluationHelper<Model.AbsoluteIntegerEvaluation, AbsoluteIntegerEvaluationPersist, Data.AbsoluteIntegerEvaluation, Data.AbsoluteIntegerEvaluationOption>
    {
        public AbsoluteIntegerEvaluationHelper(BuilderFactory builderFactory, ValidatorFactory validatorFactory) : base(builderFactory, validatorFactory)
        { }

        public override Data.ReviewEvaluation NewData()
        {
            return new Data.AbsoluteIntegerEvaluation();
        }

        public override Data.ReviewEvaluation NewData(Data.ReviewEvaluation data)
        {
            return new Data.AbsoluteIntegerEvaluation()
            {
                OptionId = data.OptionId,
                EvaluationType = data.EvaluationType
            };
        }

        public async override Task<Model.ReviewEvaluation> Build(IFieldSet fields, Data.ReviewEvaluation data)
        {
            return await this._builderFactory.Builder<AbsoluteIntegerEvaluationBuilder>().Build(fields, data);
        }

        protected override bool Validate(AbsoluteIntegerEvaluationPersist item, Data.AbsoluteIntegerEvaluationOption option)
        {
            if (option.GetType() != typeof(Data.AbsoluteIntegerEvaluationOption)) return false;

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

        protected override void PersistChildClassFields(Data.AbsoluteIntegerEvaluation data, AbsoluteIntegerEvaluationPersist model)
        {
            data.Values = model.Values;
        }
    }
}
