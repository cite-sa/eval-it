using Cite.EvalIt.Model;
using Cite.EvalIt.Common;
using Cite.Tools.Data.Builder;
using Cite.Tools.FieldSet;
using Cite.Tools.Validation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Cite.EvalIt.Query;

namespace Cite.EvalIt.Service.DataObjectType.BaseObjectRankRecalculationStrategyHelper
{
    public class ReviewDisciplineVisibilityObjectRankRecalculationStrategyHelper : BaseObjectRankRecalculationStrategyHelper<Model.ReviewDisciplineVisibilityObjectRankRecalculationStrategy, ReviewDisciplineVisibilityObjectRankRecalculationStrategyPersist, Data.ReviewDisciplineVisibilityObjectRankRecalculationStrategy>
    {
        private readonly UserQuery _userQuery;
        private readonly TagQuery _tagQuery;

        public ReviewDisciplineVisibilityObjectRankRecalculationStrategyHelper(BuilderFactory builderFactory, ValidatorFactory validatorFactory, UserQuery userQuery, TagQuery tagQuery) : base(builderFactory, validatorFactory)
        {
            this._userQuery = userQuery;
            this._tagQuery = tagQuery;
        }

        public override Data.BaseObjectRankRecalculationStrategy NewData()
        {
            return new Data.ReviewDisciplineVisibilityObjectRankRecalculationStrategy();
        }

        public override Data.BaseObjectRankRecalculationStrategy NewData(Data.BaseObjectRankRecalculationStrategy data)
        {
            return new Data.ReviewDisciplineVisibilityObjectRankRecalculationStrategy()
            {
                StrategyType = data.StrategyType,
                StrategyWeight = data.StrategyWeight
            };
        }

        public async override Task<Model.BaseObjectRankRecalculationStrategy> Build(IFieldSet fields, Data.BaseObjectRankRecalculationStrategy data)
        {
            return await this._builderFactory.Builder<ReviewDisciplineVisibilityObjectRankRecalculationStrategyBuilder>().Build(fields, data);
        }

        protected override void Validate(ReviewDisciplineVisibilityObjectRankRecalculationStrategyPersist item)
        {
            this._validatorFactory.Validator<ReviewDisciplineVisibilityObjectRankRecalculationStrategyPersist.ReviewDisciplineVisibilityObjectRankRecalculationStrategyPersistValidator>().ValidateForce(item);
        }

        protected override void PersistChildClassFields(Data.ReviewDisciplineVisibilityObjectRankRecalculationStrategy data, ReviewDisciplineVisibilityObjectRankRecalculationStrategyPersist model)
        {
            data.ReviewDisciplinePartition = model.ReviewDisciplinePartition;
        }

        protected override async Task<float?> AggregateReviewRanks(Data.ReviewDisciplineVisibilityObjectRankRecalculationStrategy data, Data.DataObject dataObject)
        {
            IEnumerable<Data.DataObjectReview> reviews = dataObject.Reviews.Where(x => x.IsActive == IsActive.Active);
            IEnumerable<Guid> tagIds = dataObject.AssignedTagIds;

            if (reviews == null || tagIds == null) return null;

            IEnumerable<Data.Tag> tags = await this._tagQuery.Ids(tagIds).Collect();
            IEnumerable<Guid> disciplineIds = tags.Where(x => x.Type == TagType.Discipline).Select(x => x.Id);

            IEnumerable<Guid> likedUserIds = reviews.SelectMany(x => x.Feedback, (review, feedback) => feedback)
                                      .Where(p => p.IsActive == IsActive.Active && p.UserId != null && p.FeedbackData.Like)
                                      .Select(p => p.UserId.Value)
                                      .Distinct();

            IEnumerable<Data.User> sharedDisciplineLikedUsers = await this._userQuery.Ids(likedUserIds).TagIds(disciplineIds).Collect();
            IEnumerable<Guid> sharedDisciplineLikedUserIds = sharedDisciplineLikedUsers.Select(x => x.Id);

            float rankWeightedScoreSum = 0, rankWeightSum = 0;
            int totalReviewLikes = reviews.SelectMany(review => review.Feedback, (review, feedback) => feedback).Where(x => x.FeedbackData.Like && x.UserId != null && sharedDisciplineLikedUserIds.Contains(x.UserId.Value)).Count();

            foreach (var review in reviews.Where(x => x.RankScore != null))
            {
                int reviewLikeCount = review.Feedback.Where(x => x.FeedbackData.Like && x.UserId != null && sharedDisciplineLikedUserIds.Contains(x.UserId.Value)).Count();
                float reviewWeight = 1;

                if (data.ReviewDisciplinePartition.RangeValues?.Count == 0) reviewWeight = reviewLikeCount;
                else
                {
                    float bucketClassificationValue = reviewLikeCount;
                    if (data.ReviewDisciplinePartition.RangeInterpretation == StrategyRangeInterpretation.Percentage) bucketClassificationValue = (totalReviewLikes > 0) ? (float)(reviewLikeCount * 100) / (float)totalReviewLikes : 100;

                    reviewWeight = data.ReviewDisciplinePartition.RangeValues.ElementAt(data.ReviewDisciplinePartition.RangeBounds.SearchBoundList(bucketClassificationValue));
                }
                rankWeightedScoreSum += review.RankScore.Value * reviewWeight;
                rankWeightSum += reviewWeight;
            }

            if (reviews.Count() > 0 && rankWeightSum > 0)
            {
                float? result = rankWeightedScoreSum / rankWeightSum;
                return result;
            }
            return null;
        }
    }
}
