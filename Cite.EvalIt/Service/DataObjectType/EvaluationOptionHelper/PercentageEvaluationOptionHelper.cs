using Cite.EvalIt.Model;
using Cite.Tools.Data.Builder;
using Cite.Tools.FieldSet;
using Cite.Tools.Validation;
using System;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectType.EvaluationOptionHelper
{
    public class PercentageEvaluationOptionHelper : BaseEvaluationOptionHelper<Model.PercentageEvaluationOption, PercentageEvaluationOptionPersist, Data.PercentageEvaluationOption>
    {
        public PercentageEvaluationOptionHelper(BuilderFactory builderFactory, ValidatorFactory validatorFactory) : base(builderFactory, validatorFactory)
        { }

        public override Data.BaseEvaluationOption NewData()
        {
            return new Data.PercentageEvaluationOption();
        }

        public override Data.BaseEvaluationOption NewData(Data.BaseEvaluationOption data)
        {
            return new Data.PercentageEvaluationOption()
            {
                IsMandatory = data.IsMandatory,
                Label = data.Label,
                OptionId = data.OptionId,
                OptionType = data.OptionType,
            };
        }

        public async override Task<Model.BaseEvaluationOption> Build(IFieldSet fields, Data.BaseEvaluationOption data)
        {
            return await this._builderFactory.Builder<PercentageEvaluationOptionBuilder>().Build(fields, data);
        }

        protected override void Validate(PercentageEvaluationOptionPersist item)
        {
            this._validatorFactory.Validator<PercentageEvaluationOptionPersist.PercentageEvaluationOptionPersistValidator>().ValidateForce(item);
        }

        protected override void PersistChildClassFields(Data.PercentageEvaluationOption data, PercentageEvaluationOptionPersist model)
        {
            data.LowerBound = model.LowerBound;
            data.UpperBound = model.UpperBound;
        }

    }
}
