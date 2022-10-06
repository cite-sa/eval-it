using Cite.EvalIt.Model;
using Cite.Tools.Data.Builder;
using Cite.Tools.FieldSet;
using Cite.Tools.Validation;
using System;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectType.RegistrationInformationInputOptionHelper
{
    public class PercentageInputOptionHelper : RegistrationInformationInputOptionHelper<Model.PercentageInputOption, PercentageInputOptionPersist, Data.PercentageInputOption>
    {
        public PercentageInputOptionHelper(BuilderFactory builderFactory, ValidatorFactory validatorFactory) : base(builderFactory, validatorFactory)
        { }

        public override Data.RegistrationInformationInputOption NewData()
        {
            return new Data.PercentageInputOption();
        }

        public override Data.RegistrationInformationInputOption NewData(Data.RegistrationInformationInputOption data)
        {
            return new Data.PercentageInputOption()
            {
                IsMandatory = data.IsMandatory,
                Label = data.Label,
                MultiValue = data.MultiValue,
                OptionId = data.OptionId,
                OptionType = data.OptionType
            };
        }

        public async override Task<Model.RegistrationInformationInputOption> Build(IFieldSet fields, Data.RegistrationInformationInputOption data)
        {
            return await this._builderFactory.Builder<PercentageInputOptionBuilder>().Build(fields, data);
        }

        protected override void Validate(PercentageInputOptionPersist item)
        {
            this._validatorFactory.Validator<PercentageInputOptionPersist.PercentageInputOptionPersistValidator>().ValidateForce(item);
        }

        protected override void PersistChildClassFields(Data.PercentageInputOption data, PercentageInputOptionPersist model)
        {
            data.UpperBound = model.UpperBound;
            data.LowerBound = model.LowerBound;
            data.ValidationRegexp = model.ValidationRegexp;
        }

    }
}
