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
    public class SelectionEvaluationHelper : ReviewEvaluationHelper<Model.SelectionEvaluation, SelectionEvaluationPersist, Data.SelectionEvaluation, Data.SelectionEvaluationOption>
    {
        public SelectionEvaluationHelper(BuilderFactory builderFactory, ValidatorFactory validatorFactory) : base(builderFactory, validatorFactory)
        { }

        public override Data.ReviewEvaluation NewData()
        {
            return new Data.SelectionEvaluation();
        }

        public override Data.ReviewEvaluation NewData(Data.ReviewEvaluation data)
        {
            return new Data.SelectionEvaluation()
            {
                OptionId = data.OptionId,
                EvaluationType = data.EvaluationType
            };
        }

        public async override Task<Model.ReviewEvaluation> Build(IFieldSet fields, Data.ReviewEvaluation data)
        {
            return await this._builderFactory.Builder<SelectionEvaluationBuilder>().Build(fields, data);
        }

        protected override bool Validate(SelectionEvaluationPersist item, Data.SelectionEvaluationOption option)
        {
            if (item.Values.Count != item.Values.Distinct().Count()) return false;
            foreach (var val in item.Values) if (!((Data.SelectionEvaluationOption)option).EvaluationSelectionOptions.Select(x => x.Key).Contains(val)) return false;

            return option.GetType() == typeof(Data.SelectionEvaluationOption);
        }

        protected override void PersistChildClassFields(Data.SelectionEvaluation data, SelectionEvaluationPersist model)
        {
            data.Values = model.Values;
        }
    }
}
