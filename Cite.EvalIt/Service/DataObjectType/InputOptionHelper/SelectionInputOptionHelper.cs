using Cite.EvalIt.Model;
using Cite.Tools.Data.Builder;
using Cite.Tools.FieldSet;
using Cite.Tools.Validation;
using System;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectType.RegistrationInformationInputOptionHelper
{
    public class SelectionInputOptionHelper : RegistrationInformationInputOptionHelper<Model.SelectionInputOption, SelectionInputOptionPersist, Data.SelectionInputOption>
    {
        public SelectionInputOptionHelper(BuilderFactory builderFactory, ValidatorFactory validatorFactory) : base(builderFactory, validatorFactory)
        { }

        public override Data.RegistrationInformationInputOption NewData()
        {
            return new Data.SelectionInputOption();
        }

        public override Data.RegistrationInformationInputOption NewData(Data.RegistrationInformationInputOption data)
        {
            return new Data.SelectionInputOption()
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
            return await this._builderFactory.Builder<SelectionInputOptionBuilder>().Build(fields, data);
        }

        protected override void Validate(SelectionInputOptionPersist item)
        {
            this._validatorFactory.Validator<SelectionInputOptionPersist.SelectionInputOptionPersistValidator>().ValidateForce(item);
        }

        protected override void PersistChildClassFields(Data.SelectionInputOption data, SelectionInputOptionPersist model)
        {
            data.InputSelectionOptions = model.InputSelectionOptions;
        }

    }
}
