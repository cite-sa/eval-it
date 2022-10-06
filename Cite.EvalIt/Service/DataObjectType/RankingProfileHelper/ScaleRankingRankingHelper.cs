using Cite.EvalIt.Model;
using Cite.Tools.Data.Builder;
using Cite.Tools.FieldSet;
using Cite.Tools.Validation;
using System.Linq;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectType.RankingProfileHelper
{
    public class ScaleRankingProfileHelper : BaseRankingProfileHelper<Model.ScaleRankingProfile, ScaleRankingProfilePersist, Data.ScaleRankingProfile, Data.ScaleEvaluationOption, Data.ScaleEvaluation>
    {
        public ScaleRankingProfileHelper(BuilderFactory builderFactory, ValidatorFactory validatorFactory) : base(builderFactory, validatorFactory)
        { }

        public override Data.BaseRankingProfile NewData()
        {
            return new Data.ScaleRankingProfile();
        }

        public override Data.BaseRankingProfile NewData(Data.BaseRankingProfile data)
        {
            return new Data.ScaleRankingProfile()
            {
                OptionId = data.OptionId,
                ProfileType = data.ProfileType,
                OptionWeight = data.OptionWeight,
                MappedUserValues = data.MappedUserValues,
                IsActive = data.IsActive
            };
        }

        protected override float? CalculateOptionRank(Data.ScaleRankingProfile data, Data.ScaleEvaluationOption option, Data.ScaleEvaluation eval)
        {
            if (eval.Values.Count == 0) return null;
            var value = eval.Values.FirstOrDefault();

            return this.NormalizeMappedValues(data).ElementAt(value);
        }

        public async override Task<Model.BaseRankingProfile> Build(IFieldSet fields, Data.BaseRankingProfile data)
        {
            return await this._builderFactory.Builder<ScaleRankingProfileBuilder>().Build(fields, data);
        }

        protected override bool Validate(ScaleRankingProfilePersist item, Data.ScaleEvaluationOption option)
        {
            if (item.MappedUserValues.Count != option.EvaluationScale.Count) return false;

            return true;
        }

        protected override void PersistChildClassFields(Data.ScaleRankingProfile data, ScaleRankingProfilePersist model)
        {
        }
    }
}
