using Cite.EvalIt.Model;
using Cite.Tools.Data.Builder;
using Cite.Tools.FieldSet;
using Cite.Tools.Validation;
using System;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectType.EvaluationOptionHelper
{
    public class AbsoluteIntegerEvaluationOptionHelper : BaseEvaluationOptionHelper<Model.AbsoluteIntegerEvaluationOption, AbsoluteIntegerEvaluationOptionPersist, Data.AbsoluteIntegerEvaluationOption>
    {
        public AbsoluteIntegerEvaluationOptionHelper(BuilderFactory builderFactory, ValidatorFactory validatorFactory) : base(builderFactory, validatorFactory)
        { }

        public override Data.BaseEvaluationOption NewData()
        {
            return new Data.AbsoluteIntegerEvaluationOption();
        }

        public override Data.BaseEvaluationOption NewData(Data.BaseEvaluationOption data)
        {
            return new Data.AbsoluteIntegerEvaluationOption()
            {
                IsMandatory = data.IsMandatory,
                Label = data.Label,
                OptionId = data.OptionId,
                OptionType = data.OptionType,
            };
        }

        public async override Task<Model.BaseEvaluationOption> Build(IFieldSet fields, Data.BaseEvaluationOption data)
        {
            return await this._builderFactory.Builder<AbsoluteIntegerEvaluationOptionBuilder>().Build(fields, data);
        }

        protected override void Validate(AbsoluteIntegerEvaluationOptionPersist item)
        {
            this._validatorFactory.Validator<AbsoluteIntegerEvaluationOptionPersist.AbsoluteIntegerEvaluationOptionPersistValidator>().ValidateForce(item);
        }

        protected override void PersistChildClassFields(Data.AbsoluteIntegerEvaluationOption data, AbsoluteIntegerEvaluationOptionPersist model)
        {
            data.LowerBound = model.LowerBound;
            data.UpperBound = model.UpperBound;
            data.MeasurementUnit = model.MeasurementUnit;
        }

    }
}
