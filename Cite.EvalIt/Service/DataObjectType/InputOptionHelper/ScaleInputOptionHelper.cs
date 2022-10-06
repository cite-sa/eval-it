using Cite.EvalIt.Model;
using Cite.Tools.Data.Builder;
using Cite.Tools.FieldSet;
using Cite.Tools.Validation;
using System;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectType.RegistrationInformationInputOptionHelper
{
    public class ScaleInputOptionHelper : RegistrationInformationInputOptionHelper<Model.ScaleInputOption, ScaleInputOptionPersist, Data.ScaleInputOption>
    {
        public ScaleInputOptionHelper(BuilderFactory builderFactory, ValidatorFactory validatorFactory) : base(builderFactory, validatorFactory)
        { }

        public override Data.RegistrationInformationInputOption NewData()
        {
            return new Data.ScaleInputOption();
        }

        public override Data.RegistrationInformationInputOption NewData(Data.RegistrationInformationInputOption data)
        {
            return new Data.ScaleInputOption()
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
            return await this._builderFactory.Builder<ScaleInputOptionBuilder>().Build(fields, data);
        }

        protected override void Validate(ScaleInputOptionPersist item)
        {
            this._validatorFactory.Validator<ScaleInputOptionPersist.ScaleInputOptionPersistValidator>().ValidateForce(item);
        }

        protected override void PersistChildClassFields(Data.ScaleInputOption data, ScaleInputOptionPersist model)
        {
            data.InputScale = model.InputScale;
            data.ScaleDisplayOption = model.ScaleDisplayOption;
        }

    }
}
