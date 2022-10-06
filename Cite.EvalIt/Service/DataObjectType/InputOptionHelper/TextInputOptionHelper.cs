using Cite.EvalIt.Model;
using Cite.Tools.Data.Builder;
using Cite.Tools.FieldSet;
using Cite.Tools.Validation;
using System;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectType.RegistrationInformationInputOptionHelper
{
    public class TextInputOptionHelper : RegistrationInformationInputOptionHelper<Model.TextInputOption, TextInputOptionPersist, Data.TextInputOption>
    {
        public TextInputOptionHelper(BuilderFactory builderFactory, ValidatorFactory validatorFactory) : base(builderFactory, validatorFactory)
        { }

        public override Data.RegistrationInformationInputOption NewData()
        {
            return new Data.TextInputOption();
        }

        public override Data.RegistrationInformationInputOption NewData(Data.RegistrationInformationInputOption data)
        {
            return new Data.TextInputOption()
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
            return await this._builderFactory.Builder<TextInputOptionBuilder>().Build(fields, data);
        }

        protected override void Validate(TextInputOptionPersist item)
        {
            this._validatorFactory.Validator<TextInputOptionPersist.TextInputOptionPersistValidator>().ValidateForce(item);
        }

        protected override void PersistChildClassFields(Data.TextInputOption data, TextInputOptionPersist model)
        {
            data.ValidationRegexp = model.ValidationRegexp;
        }

    }
}
