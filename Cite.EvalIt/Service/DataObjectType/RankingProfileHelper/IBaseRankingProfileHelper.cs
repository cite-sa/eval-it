using Cite.EvalIt.Model;
using Cite.Tools.FieldSet;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectType.RankingProfileHelper
{
    public interface IBaseRankingProfileHelper
    {
        Task<Model.BaseRankingProfile> Build(IFieldSet fields, Data.BaseRankingProfile data);
        bool Validate(BaseRankingProfilePersist item, Data.BaseEvaluationOption option);
        Data.BaseRankingProfile NewData();
        Data.BaseRankingProfile NewData(Data.BaseRankingProfile data);
        void PersistChildClassFields(Data.BaseRankingProfile data, BaseRankingProfilePersist model);
        float? CalculateOptionRank(Data.BaseRankingProfile data, Data.BaseEvaluationOption option, Data.ReviewEvaluation eval);
        System.Collections.Generic.List<float> NormalizeMappedValues(Data.BaseRankingProfile data);
    }
}
