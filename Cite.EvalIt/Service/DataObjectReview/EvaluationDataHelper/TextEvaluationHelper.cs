using Cite.EvalIt.Model;
using Cite.Tools.Data.Builder;
using Cite.Tools.FieldSet;
using Cite.Tools.Validation;
using System;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectType.ReviewEvaluationHelper
{
    public class TextEvaluationHelper : ReviewEvaluationHelper<Model.TextEvaluation, TextEvaluationPersist, Data.TextEvaluation, Data.TextEvaluationOption>
    {
        public TextEvaluationHelper(BuilderFactory builderFactory, ValidatorFactory validatorFactory) : base(builderFactory, validatorFactory)
        { }

        public override Data.ReviewEvaluation NewData()
        {
            return new Data.TextEvaluation();
        }

        public override Data.ReviewEvaluation NewData(Data.ReviewEvaluation data)
        {
            return new Data.TextEvaluation()
            {
                OptionId = data.OptionId,
                EvaluationType = data.EvaluationType
            };
        }

        public async override Task<Model.ReviewEvaluation> Build(IFieldSet fields, Data.ReviewEvaluation data)
        {
            return await this._builderFactory.Builder<TextEvaluationBuilder>().Build(fields, data);
        }

        protected override bool Validate(TextEvaluationPersist item, Data.TextEvaluationOption option)
        {
            return option.GetType() == typeof(Data.TextEvaluationOption);
        }

        protected override void PersistChildClassFields(Data.TextEvaluation data, TextEvaluationPersist model)
        {
            data.Values = model.Values;
        }
    }
}
