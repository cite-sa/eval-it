using Cite.EvalIt.Model;
using Cite.Tools.Data.Builder;
using Cite.Tools.FieldSet;
using Cite.Tools.Validation;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectType.RankingProfileHelper
{
    public abstract class BaseRankingProfileHelper<M, PM, D, O, E> : IBaseRankingProfileHelper  where PM : BaseRankingProfilePersist
                                                                                                where M : Model.BaseRankingProfile
                                                                                                where D : Data.BaseRankingProfile
                                                                                                where O : Data.BaseEvaluationOption
                                                                                                where E : Data.ReviewEvaluation
    {
        protected readonly BuilderFactory _builderFactory;
        protected readonly ValidatorFactory _validatorFactory;

        public BaseRankingProfileHelper(BuilderFactory builderFactory, ValidatorFactory validatorFactory)
        {
            _builderFactory = builderFactory;
            _validatorFactory = validatorFactory;
        }

        public abstract Task<Model.BaseRankingProfile> Build(IFieldSet fields, Data.BaseRankingProfile data);
        protected abstract bool Validate(PM item, O option);
        public abstract Data.BaseRankingProfile NewData();
        public abstract Data.BaseRankingProfile NewData(Data.BaseRankingProfile data);
        protected abstract void PersistChildClassFields(D data, PM model);
        protected abstract float? CalculateOptionRank(D data, O option, E eval);

        public float? CalculateOptionRank(Data.BaseRankingProfile data, Data.BaseEvaluationOption option, Data.ReviewEvaluation eval)
        {
            if (data is D && eval is E)
                return this.CalculateOptionRank((D)data, (O)option, (E)eval);
            else
                throw new System.ApplicationException("unrecognized type " + data.GetType().ToString());
        }

        public bool Validate(BaseRankingProfilePersist model, Data.BaseEvaluationOption config)
        {
            if (model is PM && config is O)
                return this.Validate((PM)model, (O)config);
            else
                throw new System.ApplicationException("unrecognized type " + model.GetType().ToString());
        }

        public void PersistChildClassFields(Data.BaseRankingProfile data, BaseRankingProfilePersist model)
        {
            if (model is PM)
                if (data is D)
                    this.PersistChildClassFields((D)data, (PM)model);
                else
                    throw new System.ApplicationException("unrecognized type " + data.GetType().ToString());
            else
                throw new System.ApplicationException("unrecognized type " + model.GetType().ToString());
        }

        public List<float> NormalizeMappedValues(Data.BaseRankingProfile data)
        {
            return this.MinMaxNormalization(data.MappedUserValues);
        }

        // TODO: Move, possibly make normalization function a delegate to be passed to NormalizeMappedValues?
        private List<float> MinMaxNormalization(List<float> userValues)
        {
            if (userValues.Count <= 1) return userValues.Select(x => 1f).ToList();

            float min = userValues.Min();
            float max = userValues.Max();

            if (min == max) return userValues.Select(x => 1f).ToList();

            return userValues.Select(x => (x - min) / (max - min)).ToList();
        }
    }
}
