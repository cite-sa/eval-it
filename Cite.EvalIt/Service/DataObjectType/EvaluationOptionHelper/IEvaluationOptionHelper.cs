using Cite.EvalIt.Model;
using Cite.Tools.FieldSet;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectType.EvaluationOptionHelper
{
    public interface IBaseEvaluationOptionHelper
    {
        Task<Model.BaseEvaluationOption> Build(IFieldSet fields, Data.BaseEvaluationOption data);
        void Validate(BaseEvaluationOptionPersist item);
        Data.BaseEvaluationOption NewData();
        Data.BaseEvaluationOption NewData(Data.BaseEvaluationOption data);
        void PersistChildClassFields(Data.BaseEvaluationOption data, BaseEvaluationOptionPersist model);
    }
}
