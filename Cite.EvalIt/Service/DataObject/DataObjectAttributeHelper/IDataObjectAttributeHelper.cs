using Cite.EvalIt.Model;
using Cite.Tools.FieldSet;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectType.DataObjectAttributeHelper
{
    public interface IDataObjectAttributeHelper
    {
        Task<Model.DataObjectAttribute> Build(IFieldSet fields, Data.DataObjectAttribute data);
        bool Validate(DataObjectAttributePersist item, Data.RegistrationInformationInputOption option);
        Data.DataObjectAttribute NewData();
        Data.DataObjectAttribute NewData(Data.DataObjectAttribute data);
        void PersistChildClassFields(Data.DataObjectAttribute data, DataObjectAttributePersist model);
    }
}
