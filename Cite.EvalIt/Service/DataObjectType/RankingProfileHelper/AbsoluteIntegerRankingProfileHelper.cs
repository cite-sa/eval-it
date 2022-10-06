using Cite.EvalIt.Common;
using Cite.EvalIt.Model;
using Cite.Tools.Data.Builder;
using Cite.Tools.FieldSet;
using Cite.Tools.Validation;
using System.Linq;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectType.RankingProfileHelper
{
    public class AbsoluteIntegerRankingProfileHelper : BaseRankingProfileHelper<Model.AbsoluteIntegerRankingProfile, AbsoluteIntegerRankingProfilePersist, Data.AbsoluteIntegerRankingProfile, Data.AbsoluteIntegerEvaluationOption, Data.AbsoluteIntegerEvaluation>
    {
        public AbsoluteIntegerRankingProfileHelper(BuilderFactory builderFactory, ValidatorFactory validatorFactory) : base(builderFactory, validatorFactory)
        { }

        public override Data.BaseRankingProfile NewData()
        {
            return new Data.AbsoluteIntegerRankingProfile();
        }

        public override Data.BaseRankingProfile NewData(Data.BaseRankingProfile data)
        {
            return new Data.AbsoluteIntegerRankingProfile()
            {
                OptionId = data.OptionId,
                ProfileType = data.ProfileType,
                OptionWeight = data.OptionWeight,
                MappedUserValues = data.MappedUserValues,
                IsActive = data.IsActive
            };
        }

        protected override float? CalculateOptionRank(Data.AbsoluteIntegerRankingProfile data, Data.AbsoluteIntegerEvaluationOption option, Data.AbsoluteIntegerEvaluation eval)
        {
            if (eval.Values.Count == 0) return null;
            var value = eval.Values.FirstOrDefault();

            return this.NormalizeMappedValues(data).ElementAt(data.MappedRangeBounds.SearchBoundList(value));
        }

        public async override Task<Model.BaseRankingProfile> Build(IFieldSet fields, Data.BaseRankingProfile data)
        {
            return await this._builderFactory.Builder<AbsoluteIntegerRankingProfileBuilder>().Build(fields, data);
        }

        protected override bool Validate(AbsoluteIntegerRankingProfilePersist item, Data.AbsoluteIntegerEvaluationOption option)
        {
            if (item.MappedRangeBounds.Count != (item.MappedUserValues.Count - 1) || item.MappedUserValues.Count <= 0) return false;
            for (int i = 1; i < item.MappedRangeBounds.Count; i++)
            {
                if (item.MappedRangeBounds[i - 1].Value > item.MappedRangeBounds[i].Value) return false;
                if (item.MappedRangeBounds[i - 1].Value == item.MappedRangeBounds[i].Value && (item.MappedRangeBounds[i - 1].UpperBoundType == Common.UpperBoundType.Inclusive || item.MappedRangeBounds[i].UpperBoundType == Common.UpperBoundType.Exclusive)) return false;
            }

            return true;
        }

        protected override void PersistChildClassFields(Data.AbsoluteIntegerRankingProfile data, AbsoluteIntegerRankingProfilePersist model)
        {
            data.MappedRangeBounds = model.MappedRangeBounds;
        }
    }
}
