using Cite.EvalIt.Model;
using Cite.Tools.Data.Builder;
using Cite.Tools.FieldSet;
using Cite.Tools.Validation;
using System;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectType.EvaluationOptionHelper
{
    public class ScaleEvaluationOptionHelper : BaseEvaluationOptionHelper<Model.ScaleEvaluationOption, ScaleEvaluationOptionPersist, Data.ScaleEvaluationOption>
    {
        public ScaleEvaluationOptionHelper(BuilderFactory builderFactory, ValidatorFactory validatorFactory) : base(builderFactory, validatorFactory)
        { }

        public override Data.BaseEvaluationOption NewData()
        {
            return new Data.ScaleEvaluationOption();
        }

        public override Data.BaseEvaluationOption NewData(Data.BaseEvaluationOption data)
        {
            return new Data.ScaleEvaluationOption()
            {
                IsMandatory = data.IsMandatory,
                Label = data.Label,
                OptionId = data.OptionId,
                OptionType = data.OptionType,
            };
        }

        public async override Task<Model.BaseEvaluationOption> Build(IFieldSet fields, Data.BaseEvaluationOption data)
        {
            return await this._builderFactory.Builder<ScaleEvaluationOptionBuilder>().Build(fields, data);
        }

        protected override void Validate(ScaleEvaluationOptionPersist item)
        {
            this._validatorFactory.Validator<ScaleEvaluationOptionPersist.ScaleEvaluationOptionPersistValidator>().ValidateForce(item);
        }

        protected override void PersistChildClassFields(Data.ScaleEvaluationOption data, ScaleEvaluationOptionPersist model)
        {
            data.EvaluationScale = model.EvaluationScale;
            data.ScaleDisplayOption = model.ScaleDisplayOption;
        }

    }
}
