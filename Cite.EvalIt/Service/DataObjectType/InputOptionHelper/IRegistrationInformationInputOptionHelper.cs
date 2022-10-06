using Cite.EvalIt.Model;
using Cite.Tools.FieldSet;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectType.RegistrationInformationInputOptionHelper
{
    public interface IRegistrationInformationInputOptionHelper
    {
        Task<Model.RegistrationInformationInputOption> Build(IFieldSet fields, Data.RegistrationInformationInputOption data);
        void Validate(RegistrationInformationInputOptionPersist item);
        Data.RegistrationInformationInputOption NewData();
        Data.RegistrationInformationInputOption NewData(Data.RegistrationInformationInputOption data);
        void PersistChildClassFields(Data.RegistrationInformationInputOption data, RegistrationInformationInputOptionPersist model);
    }
}
