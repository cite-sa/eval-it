using Cite.EvalIt.Model;
using Cite.Tools.FieldSet;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectType.BaseObjectRankRecalculationStrategyHelper
{
    public interface IBaseObjectRankRecalculationStrategyHelper
    {
        Task<Model.BaseObjectRankRecalculationStrategy> Build(IFieldSet fields, Data.BaseObjectRankRecalculationStrategy data);
        void Validate(BaseObjectRankRecalculationStrategyPersist item);
        Data.BaseObjectRankRecalculationStrategy NewData();
        Data.BaseObjectRankRecalculationStrategy NewData(Data.BaseObjectRankRecalculationStrategy data);
        void PersistChildClassFields(Data.BaseObjectRankRecalculationStrategy data, BaseObjectRankRecalculationStrategyPersist model);
        Task<float?> AggregateReviewRanks(Data.BaseObjectRankRecalculationStrategy strategy, Data.DataObject dataObject);
    }
}
