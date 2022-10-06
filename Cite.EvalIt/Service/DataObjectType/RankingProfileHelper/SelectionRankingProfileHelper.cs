using Cite.EvalIt.Model;
using Cite.Tools.Data.Builder;
using Cite.Tools.FieldSet;
using Cite.Tools.Validation;
using System.Linq;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectType.RankingProfileHelper
{
    public class SelectionRankingProfileHelper : BaseRankingProfileHelper<Model.SelectionRankingProfile, SelectionRankingProfilePersist, Data.SelectionRankingProfile, Data.SelectionEvaluationOption, Data.SelectionEvaluation>
    {
        public SelectionRankingProfileHelper(BuilderFactory builderFactory, ValidatorFactory validatorFactory) : base(builderFactory, validatorFactory)
        { }

        public override Data.BaseRankingProfile NewData()
        {
            return new Data.SelectionRankingProfile();
        }

        public override Data.BaseRankingProfile NewData(Data.BaseRankingProfile data)
        {
            return new Data.SelectionRankingProfile()
            {
                OptionId = data.OptionId,
                ProfileType = data.ProfileType,
                OptionWeight = data.OptionWeight,
                MappedUserValues = data.MappedUserValues,
                IsActive = data.IsActive
            };
        }

        protected override float? CalculateOptionRank(Data.SelectionRankingProfile data, Data.SelectionEvaluationOption option, Data.SelectionEvaluation eval)
        {
            if (eval.Values.Count == 0) return null;
            var value = eval.Values.FirstOrDefault();

            var index = option.EvaluationSelectionOptions.FindIndex(x => x.Key == value);

            return this.NormalizeMappedValues(data).ElementAt(index);
        }

        public async override Task<Model.BaseRankingProfile> Build(IFieldSet fields, Data.BaseRankingProfile data)
        {
            return await this._builderFactory.Builder<SelectionRankingProfileBuilder>().Build(fields, data);
        }

        protected override bool Validate(SelectionRankingProfilePersist item, Data.SelectionEvaluationOption option)
        {
            if (item.MappedUserValues.Count != option.EvaluationSelectionOptions.Count) return false;

            return true;
        }

        protected override void PersistChildClassFields(Data.SelectionRankingProfile data, SelectionRankingProfilePersist model)
        {
        }
    }
}
