using Cite.EvalIt.Model;
using Cite.Tools.Data.Builder;
using Cite.Tools.FieldSet;
using Cite.Tools.Validation;
using System;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectType.RegistrationInformationInputOptionHelper
{
    public class AbsoluteIntegerInputOptionHelper : RegistrationInformationInputOptionHelper<Model.AbsoluteIntegerInputOption, AbsoluteIntegerInputOptionPersist, Data.AbsoluteIntegerInputOption>
    {
        public AbsoluteIntegerInputOptionHelper(BuilderFactory builderFactory, ValidatorFactory validatorFactory) : base(builderFactory, validatorFactory)
        { }

        public override Data.RegistrationInformationInputOption NewData()
        {
            return new Data.AbsoluteIntegerInputOption();
        }

        public override Data.RegistrationInformationInputOption NewData(Data.RegistrationInformationInputOption data)
        {
            return new Data.AbsoluteIntegerInputOption()
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
            return await this._builderFactory.Builder<AbsoluteIntegerInputOptionBuilder>().Build(fields, data);
        }

        protected override void Validate(AbsoluteIntegerInputOptionPersist item)
        {
            this._validatorFactory.Validator<AbsoluteIntegerInputOptionPersist.AbsoluteIntegerInputOptionPersistValidator>().ValidateForce(item);
        }

        protected override void PersistChildClassFields(Data.AbsoluteIntegerInputOption data, AbsoluteIntegerInputOptionPersist model)
        {
            data.UpperBound = model.UpperBound;
            data.LowerBound = model.LowerBound;
            data.MeasurementUnit = model.MeasurementUnit;
            data.ValidationRegexp = model.ValidationRegexp;
        }

    }
}
