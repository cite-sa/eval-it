using Cite.EvalIt.Common;
using Cite.EvalIt.Model;
using Cite.Tools.Data.Builder;
using Cite.Tools.FieldSet;
using Cite.Tools.Validation;
using System.Linq;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectType.RankingProfileHelper
{
    public class PercentageRankingProfileHelper : BaseRankingProfileHelper<Model.PercentageRankingProfile, PercentageRankingProfilePersist, Data.PercentageRankingProfile, Data.PercentageEvaluationOption, Data.PercentageEvaluation>
    {
        public PercentageRankingProfileHelper(BuilderFactory builderFactory, ValidatorFactory validatorFactory) : base(builderFactory, validatorFactory)
        { }

        public override Data.BaseRankingProfile NewData()
        {
            return new Data.PercentageRankingProfile();
        }

        public override Data.BaseRankingProfile NewData(Data.BaseRankingProfile data)
        {
            return new Data.PercentageRankingProfile()
            {
                OptionId = data.OptionId,
                ProfileType = data.ProfileType,
                OptionWeight = data.OptionWeight,
                MappedUserValues = data.MappedUserValues,
                IsActive = data.IsActive
            };
        }

        protected override float? CalculateOptionRank(Data.PercentageRankingProfile data, Data.PercentageEvaluationOption option, Data.PercentageEvaluation eval)
        {
            if (eval.Values.Count == 0) return null;
            var value = eval.Values.FirstOrDefault();

            return this.NormalizeMappedValues(data).ElementAt(data.MappedRangeBounds.SearchBoundList(value));
        }

        public async override Task<Model.BaseRankingProfile> Build(IFieldSet fields, Data.BaseRankingProfile data)
        {
            return await this._builderFactory.Builder<PercentageRankingProfileBuilder>().Build(fields, data);
        }

        protected override bool Validate(PercentageRankingProfilePersist item, Data.PercentageEvaluationOption option)
        {
            if (item.MappedRangeBounds.Count != ( item.MappedUserValues.Count - 1 ) || item.MappedUserValues.Count <= 0) return false;
            for (int i = 1; i < item.MappedRangeBounds.Count; i++)
            {
                if (item.MappedRangeBounds[i - 1].Value > item.MappedRangeBounds[i].Value) return false;
                if (item.MappedRangeBounds[i - 1].Value == item.MappedRangeBounds[i].Value && (item.MappedRangeBounds[i - 1].UpperBoundType == Common.UpperBoundType.Exclusive || item.MappedRangeBounds[i].UpperBoundType == Common.UpperBoundType.Inclusive)) return false;
            }

            return true;
        }

        protected override void PersistChildClassFields(Data.PercentageRankingProfile data, PercentageRankingProfilePersist model)
        {
            data.MappedRangeBounds = model.MappedRangeBounds;
        }
    }
}
