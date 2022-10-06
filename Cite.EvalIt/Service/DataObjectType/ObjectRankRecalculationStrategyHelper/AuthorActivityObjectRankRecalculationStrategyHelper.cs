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
    public class AuthorActivityObjectRankRecalculationStrategyHelper : BaseObjectRankRecalculationStrategyHelper<Model.AuthorActivityObjectRankRecalculationStrategy, AuthorActivityObjectRankRecalculationStrategyPersist, Data.AuthorActivityObjectRankRecalculationStrategy>
    {
        private readonly UserQuery _userQuery;
        private readonly DataObjectQuery _dataObjectQuery;
        private readonly DataObjectReviewQuery _dataObjectReviewQuery;

        public AuthorActivityObjectRankRecalculationStrategyHelper(BuilderFactory builderFactory, ValidatorFactory validatorFactory, UserQuery userQuery, DataObjectQuery dataObjectQuery, DataObjectReviewQuery dataObjectReviewQuery) : base(builderFactory, validatorFactory)
        {
            this._userQuery = userQuery;
            this._dataObjectQuery = dataObjectQuery;
            this._dataObjectReviewQuery = dataObjectReviewQuery;
        }

        public override Data.BaseObjectRankRecalculationStrategy NewData()
        {
            return new Data.AuthorActivityObjectRankRecalculationStrategy();
        }

        public override Data.BaseObjectRankRecalculationStrategy NewData(Data.BaseObjectRankRecalculationStrategy data)
        {
            return new Data.AuthorActivityObjectRankRecalculationStrategy()
            {
                StrategyType = data.StrategyType,
                StrategyWeight = data.StrategyWeight
            };
        }

        public async override Task<Model.BaseObjectRankRecalculationStrategy> Build(IFieldSet fields, Data.BaseObjectRankRecalculationStrategy data)
        {
            return await this._builderFactory.Builder<AuthorActivityObjectRankRecalculationStrategyBuilder>().Build(fields, data);
        }

        protected override void Validate(AuthorActivityObjectRankRecalculationStrategyPersist item)
        {
            this._validatorFactory.Validator<AuthorActivityObjectRankRecalculationStrategyPersist.AuthorActivityObjectRankRecalculationStrategyPersistValidator>().ValidateForce(item);
        }

        protected override void PersistChildClassFields(Data.AuthorActivityObjectRankRecalculationStrategy data, AuthorActivityObjectRankRecalculationStrategyPersist model)
        {
            data.TimeUnit = model.TimeUnit;
            data.TimeUnitCount = model.TimeUnitCount;

            data.AuthorReviewActivityPartition = model.AuthorReviewActivityPartition;
            data.AuthorObjectActivityPartition = model.AuthorObjectActivityPartition;
        }

        protected override async Task<float?> AggregateReviewRanks(Data.AuthorActivityObjectRankRecalculationStrategy data, Data.DataObject dataObject)
        {
            IEnumerable<Data.DataObjectReview> reviews = dataObject.Reviews.Where(x => x.IsActive == IsActive.Active);

            if (reviews == null) return null;

            float rankWeightedScoreSum = 0, rankWeightSum = 0;

            IEnumerable<Guid> userIds = reviews.Where(x => x.UserId != null).Select(x => x.UserId.Value).Distinct();

            DateTime dateTime = DateTime.UtcNow;
            switch (data.TimeUnit)
            {
                case TimeUnit.Days:
                    dateTime = dateTime.AddDays(-data.TimeUnitCount);
                    break;
                case TimeUnit.Weeks:
                    dateTime = dateTime.AddDays(-data.TimeUnitCount*7);
                    break;
                case TimeUnit.Months:
                    dateTime = dateTime.AddMonths(-data.TimeUnitCount);
                    break;
                case TimeUnit.Years:
                    dateTime = dateTime.AddYears(-data.TimeUnitCount);
                    break;
                default:
                    break;
            }

            IEnumerable<Data.DataObject> recentObjects = await this._dataObjectQuery.UserIds(userIds).CreatedAfter(dateTime).Collect();
            IEnumerable<Data.DataObjectReview> recentReviews = await this._dataObjectReviewQuery.UserIds(userIds).CreatedAfter(dateTime).Collect();

            Dictionary<Guid, int> recentObjectCountMap = userIds.ToDictionary(u => u, u => recentObjects.Where(x => x.UserId == u).Count());
            Dictionary<Guid, int> recentReviewCountMap = userIds.ToDictionary(u => u, u => recentReviews.Where(x => x.UserId == u).Count());

            int totalObjectCount = recentObjects.Count();
            int totalReviewCount = recentReviews.Count();

            foreach (var review in reviews.Where(x => x.UserId != null).Where(x => x.RankScore != null))
            {
                float reviewWeight = 0;
                int recentObjectCount = recentObjectCountMap[review.UserId.Value];

                if (data.AuthorObjectActivityPartition.RangeValues?.Count == 0) reviewWeight += recentObjectCount;
                else
                {
                    float bucketClassificationValue = recentObjectCount;
                    if (data.AuthorObjectActivityPartition.RangeInterpretation == StrategyRangeInterpretation.Percentage) bucketClassificationValue = (totalObjectCount > 0) ? (float)(recentObjectCount * 100) / (float)totalObjectCount : 100;

                    reviewWeight += data.AuthorObjectActivityPartition.RangeValues.ElementAt(data.AuthorObjectActivityPartition.RangeBounds.SearchBoundList(bucketClassificationValue));
                }

                int recentReviewCount = recentReviewCountMap[review.UserId.Value];

                if (data.AuthorReviewActivityPartition.RangeValues?.Count == 0) reviewWeight += recentReviewCount;
                else
                {
                    float bucketClassificationValue = recentReviewCount;
                    if (data.AuthorReviewActivityPartition.RangeInterpretation == StrategyRangeInterpretation.Percentage) bucketClassificationValue = (totalReviewCount > 0) ? (float)(recentReviewCount * 100) / (float)totalReviewCount : 100;

                    reviewWeight += data.AuthorReviewActivityPartition.RangeValues.ElementAt(data.AuthorReviewActivityPartition.RangeBounds.SearchBoundList(bucketClassificationValue));
                }

                rankWeightedScoreSum += review.RankScore.Value * reviewWeight;
                rankWeightSum += reviewWeight;
            }

            if (reviews.Count() > 0 && rankWeightSum > 0) return rankWeightedScoreSum / rankWeightSum;
            return null;
        }
    }
}
