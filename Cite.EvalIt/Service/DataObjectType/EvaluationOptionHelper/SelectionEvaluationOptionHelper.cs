using Cite.EvalIt.Model;
using Cite.Tools.Data.Builder;
using Cite.Tools.FieldSet;
using Cite.Tools.Validation;
using System;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectType.EvaluationOptionHelper
{
    public class SelectionEvaluationOptionHelper : BaseEvaluationOptionHelper<Model.SelectionEvaluationOption, SelectionEvaluationOptionPersist, Data.SelectionEvaluationOption>
    {
        public SelectionEvaluationOptionHelper(BuilderFactory builderFactory, ValidatorFactory validatorFactory) : base(builderFactory, validatorFactory)
        { }

        public override Data.BaseEvaluationOption NewData()
        {
            return new Data.SelectionEvaluationOption();
        }

        public override Data.BaseEvaluationOption NewData(Data.BaseEvaluationOption data)
        {
            return new Data.SelectionEvaluationOption()
            {
                IsMandatory = data.IsMandatory,
                Label = data.Label,
                OptionId = data.OptionId,
                OptionType = data.OptionType,
            };
        }

        public async override Task<Model.BaseEvaluationOption> Build(IFieldSet fields, Data.BaseEvaluationOption data)
        {
            return await this._builderFactory.Builder<SelectionEvaluationOptionBuilder>().Build(fields, data);
        }

        protected override void Validate(SelectionEvaluationOptionPersist item)
        {
            this._validatorFactory.Validator<SelectionEvaluationOptionPersist.SelectionEvaluationOptionPersistValidator>().ValidateForce(item);
        }

        protected override void PersistChildClassFields(Data.SelectionEvaluationOption data, SelectionEvaluationOptionPersist model)
        {
            data.EvaluationSelectionOptions = model.EvaluationSelectionOptions;
        }

    }
}
