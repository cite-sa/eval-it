using Cite.EvalIt.Model;
using Cite.Tools.Data.Builder;
using Cite.Tools.FieldSet;
using Cite.Tools.Validation;
using System;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectType.EvaluationOptionHelper
{
    public class AbsoluteDecimalEvaluationOptionHelper : BaseEvaluationOptionHelper<Model.AbsoluteDecimalEvaluationOption, AbsoluteDecimalEvaluationOptionPersist, Data.AbsoluteDecimalEvaluationOption>
    {
        public AbsoluteDecimalEvaluationOptionHelper(BuilderFactory builderFactory, ValidatorFactory validatorFactory) : base(builderFactory, validatorFactory)
        { }

        public override Data.BaseEvaluationOption NewData()
        {
            return new Data.AbsoluteDecimalEvaluationOption();
        }

        public override Data.BaseEvaluationOption NewData(Data.BaseEvaluationOption data)
        {
            return new Data.AbsoluteDecimalEvaluationOption()
            {
                IsMandatory = data.IsMandatory,
                Label = data.Label,
                OptionId = data.OptionId,
                OptionType = data.OptionType,
            };
        }

        public async override Task<Model.BaseEvaluationOption> Build(IFieldSet fields, Data.BaseEvaluationOption data)
        {
            return await this._builderFactory.Builder<AbsoluteDecimalEvaluationOptionBuilder>().Build(fields, data);
        }

        protected override void Validate(AbsoluteDecimalEvaluationOptionPersist item)
        {
            this._validatorFactory.Validator<AbsoluteDecimalEvaluationOptionPersist.AbsoluteDecimalEvaluationOptionPersistValidator>().ValidateForce(item);
        }

        protected override void PersistChildClassFields(Data.AbsoluteDecimalEvaluationOption data, AbsoluteDecimalEvaluationOptionPersist model)
        {
            data.LowerBound = model.LowerBound;
            data.UpperBound = model.UpperBound;
            data.MeasurementUnit = model.MeasurementUnit;
        }

    }
}
