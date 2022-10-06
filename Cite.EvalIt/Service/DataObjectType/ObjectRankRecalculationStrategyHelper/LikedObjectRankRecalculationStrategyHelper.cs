using Cite.EvalIt.Model;
using Cite.EvalIt.Common;
using Cite.Tools.Data.Builder;
using Cite.Tools.FieldSet;
using Cite.Tools.Validation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectType.BaseObjectRankRecalculationStrategyHelper
{
    public class LikedObjectRankRecalculationStrategyHelper : BaseObjectRankRecalculationStrategyHelper<Model.LikedObjectRankRecalculationStrategy, LikedObjectRankRecalculationStrategyPersist, Data.LikedObjectRankRecalculationStrategy>
    {
        public LikedObjectRankRecalculationStrategyHelper(BuilderFactory builderFactory, ValidatorFactory validatorFactory) : base(builderFactory, validatorFactory)
        { }

        public override Data.BaseObjectRankRecalculationStrategy NewData()
        {
            return new Data.LikedObjectRankRecalculationStrategy();
        }

        public override Data.BaseObjectRankRecalculationStrategy NewData(Data.BaseObjectRankRecalculationStrategy data)
        {
            return new Data.LikedObjectRankRecalculationStrategy()
            {
                StrategyType = data.StrategyType,
                StrategyWeight = data.StrategyWeight
            };
        }

        public async override Task<Model.BaseObjectRankRecalculationStrategy> Build(IFieldSet fields, Data.BaseObjectRankRecalculationStrategy data)
        {
            return await this._builderFactory.Builder<LikedObjectRankRecalculationStrategyBuilder>().Build(fields, data);
        }

        protected override void Validate(LikedObjectRankRecalculationStrategyPersist item)
        {
            this._validatorFactory.Validator<LikedObjectRankRecalculationStrategyPersist.LikedObjectRankRecalculationStrategyPersistValidator>().ValidateForce(item);
        }

        protected override void PersistChildClassFields(Data.LikedObjectRankRecalculationStrategy data, LikedObjectRankRecalculationStrategyPersist model)
        {
            data.LikePartition = model.LikePartition;
        }

        protected override Task<float?> AggregateReviewRanks(Data.LikedObjectRankRecalculationStrategy data, Data.DataObject dataObject)
        {
            IEnumerable<Data.DataObjectReview> reviews = dataObject.Reviews.Where(x => x.IsActive == IsActive.Active);

            if (reviews == null) return Task.FromResult((float?)null); ;

            float rankWeightedScoreSum = 0, rankWeightSum = 0;
            int totalReviewLikes = reviews.SelectMany(review => review.Feedback, (review, feedback) => feedback.FeedbackData.Like).Where(x => x).Count();

            foreach (var review in reviews.Where(x => x.RankScore != null))
            {
                int reviewLikeCount = review.Feedback.Where(x => x.FeedbackData.Like).Count();
                float reviewWeight = 1;

                if (data.LikePartition.RangeValues?.Count == 0) reviewWeight = reviewLikeCount;
                else
                {
                    float bucketClassificationValue = reviewLikeCount;
                    if(data.LikePartition.RangeInterpretation == StrategyRangeInterpretation.Percentage) bucketClassificationValue = (totalReviewLikes > 0) ? (float)(reviewLikeCount * 100) / (float)totalReviewLikes : 100;

                    reviewWeight = data.LikePartition.RangeValues.ElementAt(data.LikePartition.RangeBounds.SearchBoundList(bucketClassificationValue));
                }
                rankWeightedScoreSum += review.RankScore.Value * reviewWeight;
                rankWeightSum += reviewWeight;
            }

            if (reviews.Count() > 0 && rankWeightSum > 0)
            {
                float? result = rankWeightedScoreSum / rankWeightSum;
                return Task.FromResult(result);
            }
            return Task.FromResult((float?)null); ;
        }
    }
}
