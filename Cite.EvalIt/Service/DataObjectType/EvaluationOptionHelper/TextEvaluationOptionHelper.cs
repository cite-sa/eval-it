using Cite.EvalIt.Model;
using Cite.Tools.Data.Builder;
using Cite.Tools.FieldSet;
using Cite.Tools.Validation;
using System;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectType.EvaluationOptionHelper
{
    public class TextEvaluationOptionHelper : BaseEvaluationOptionHelper<Model.TextEvaluationOption, TextEvaluationOptionPersist, Data.TextEvaluationOption>
    {
        public TextEvaluationOptionHelper(BuilderFactory builderFactory, ValidatorFactory validatorFactory) : base(builderFactory, validatorFactory)
        { }

        public override Data.BaseEvaluationOption NewData()
        {
            return new Data.TextEvaluationOption();
        }

        public override Data.BaseEvaluationOption NewData(Data.BaseEvaluationOption data)
        {
            return new Data.TextEvaluationOption()
            {
                IsMandatory = data.IsMandatory,
                Label = data.Label,
                OptionId = data.OptionId,
                OptionType = data.OptionType,
            };
        }

        public async override Task<Model.BaseEvaluationOption> Build(IFieldSet fields, Data.BaseEvaluationOption data)
        {
            return await this._builderFactory.Builder<TextEvaluationOptionBuilder>().Build(fields, data);
        }

        protected override void Validate(TextEvaluationOptionPersist item)
        {
            this._validatorFactory.Validator<TextEvaluationOptionPersist.TextEvaluationOptionPersistValidator>().ValidateForce(item);
        }

        protected override void PersistChildClassFields(Data.TextEvaluationOption data, TextEvaluationOptionPersist model)
        { }

    }
}
