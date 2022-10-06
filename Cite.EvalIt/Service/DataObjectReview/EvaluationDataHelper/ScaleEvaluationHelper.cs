using Cite.EvalIt.Model;
using Cite.Tools.Data.Builder;
using Cite.Tools.FieldSet;
using Cite.Tools.Validation;
using System;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectType.ReviewEvaluationHelper
{
    public class ScaleEvaluationHelper : ReviewEvaluationHelper<Model.ScaleEvaluation, ScaleEvaluationPersist, Data.ScaleEvaluation, Data.ScaleEvaluationOption>
    {
        public ScaleEvaluationHelper(BuilderFactory builderFactory, ValidatorFactory validatorFactory) : base(builderFactory, validatorFactory)
        { }

        public override Data.ReviewEvaluation NewData()
        {
            return new Data.ScaleEvaluation();
        }

        public override Data.ReviewEvaluation NewData(Data.ReviewEvaluation data)
        {
            return new Data.ScaleEvaluation()
            {
                OptionId = data.OptionId,
                EvaluationType = data.EvaluationType
            };
        }

        public async override Task<Model.ReviewEvaluation> Build(IFieldSet fields, Data.ReviewEvaluation data)
        {
            return await this._builderFactory.Builder<ScaleEvaluationBuilder>().Build(fields, data);
        }

        protected override bool Validate(ScaleEvaluationPersist item, Data.ScaleEvaluationOption option)
        {
            if (item.Values.Count != item.Values.Distinct().Count()) return false;
            foreach (var val in item.Values) if (!((Data.ScaleEvaluationOption)option).EvaluationScale.Select(x => x.Value).Contains(val)) return false;

            return option.GetType() == typeof(Data.ScaleEvaluationOption);
        }

        protected override void PersistChildClassFields(Data.ScaleEvaluation data, ScaleEvaluationPersist model)
        {
            data.Values = model.Values;
        }
    }
}
