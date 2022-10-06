using Cite.EvalIt.Model;
using Cite.Tools.FieldSet;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectType.ReviewEvaluationHelper
{
    public interface IReviewEvaluationHelper
    {
        Task<Model.ReviewEvaluation> Build(IFieldSet fields, Data.ReviewEvaluation data);
        bool Validate(ReviewEvaluationPersist item, Data.BaseEvaluationOption option);
        Data.ReviewEvaluation NewData();
        Data.ReviewEvaluation NewData(Data.ReviewEvaluation data);
        void PersistChildClassFields(Data.ReviewEvaluation data, ReviewEvaluationPersist model);
    }
}
