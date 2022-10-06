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
    public class NetworkTrustObjectRankRecalculationStrategyHelper : BaseObjectRankRecalculationStrategyHelper<Model.NetworkTrustObjectRankRecalculationStrategy, NetworkTrustObjectRankRecalculationStrategyPersist, Data.NetworkTrustObjectRankRecalculationStrategy>
    {
        private readonly UserQuery _userQuery;
        public NetworkTrustObjectRankRecalculationStrategyHelper(BuilderFactory builderFactory, ValidatorFactory validatorFactory, UserQuery userQuery) : base(builderFactory, validatorFactory)
        {
            this._userQuery = userQuery;
        }

        public override Data.BaseObjectRankRecalculationStrategy NewData()
        {
            return new Data.NetworkTrustObjectRankRecalculationStrategy();
        }

        public override Data.BaseObjectRankRecalculationStrategy NewData(Data.BaseObjectRankRecalculationStrategy data)
        {
            return new Data.NetworkTrustObjectRankRecalculationStrategy()
            {
                StrategyType = data.StrategyType,
                StrategyWeight = data.StrategyWeight
            };
        }

        public async override Task<Model.BaseObjectRankRecalculationStrategy> Build(IFieldSet fields, Data.BaseObjectRankRecalculationStrategy data)
        {
            return await this._builderFactory.Builder<NetworkTrustObjectRankRecalculationStrategyBuilder>().Build(fields, data);
        }

        protected override void Validate(NetworkTrustObjectRankRecalculationStrategyPersist item)
        {
            this._validatorFactory.Validator<NetworkTrustObjectRankRecalculationStrategyPersist.NetworkTrustObjectRankRecalculationStrategyPersistValidator>().ValidateForce(item);
        }

        protected override void PersistChildClassFields(Data.NetworkTrustObjectRankRecalculationStrategy data, NetworkTrustObjectRankRecalculationStrategyPersist model)
        {
            data.NetworkTrustPartition = model.NetworkTrustPartition;
        }

        protected override async Task<float?> AggregateReviewRanks(Data.NetworkTrustObjectRankRecalculationStrategy data, Data.DataObject dataObject)
        {
            IEnumerable<Data.DataObjectReview> reviews = dataObject.Reviews.Where(x => x.IsActive == IsActive.Active);

            if (reviews == null) return null;

            float rankWeightedScoreSum = 0, rankWeightSum = 0;

            IEnumerable<Guid> userIds = reviews.Where(x => x.UserId != null).Select(x => x.UserId.Value).Distinct();
            IEnumerable<Data.User> users = await this._userQuery.TrustingIds(userIds).Collect();

            // Map each user to the number of users that follow or trust them
            Dictionary<Guid, int> userMap = userIds.ToDictionary(u => u, u => users.Where(f => f.UserNetworkIds.Select(r => r.Id).Contains(u)).Count() );

            int totalNetworkCount = userMap.Values.Sum();

            foreach (var review in reviews.Where(x => x.UserId != null).Where(x => x.RankScore != null) )
            {
                float reviewWeight = 1;
                int reviewerRelationshipSize = userMap[review.UserId.Value];

                if (data.NetworkTrustPartition.RangeValues?.Count == 0) reviewWeight = reviewerRelationshipSize;
                else
                {
                    float bucketClassificationValue = reviewerRelationshipSize;
                    if(data.NetworkTrustPartition.RangeInterpretation == StrategyRangeInterpretation.Percentage) bucketClassificationValue = (totalNetworkCount > 0) ? (float)(reviewerRelationshipSize * 100) / (float)totalNetworkCount : 100;

                    reviewWeight = data.NetworkTrustPartition.RangeValues.ElementAt(data.NetworkTrustPartition.RangeBounds.SearchBoundList(bucketClassificationValue));
                }
                rankWeightedScoreSum += review.RankScore.Value * reviewWeight;
                rankWeightSum += reviewWeight;
            }

            if (reviews.Count() > 0 && rankWeightSum > 0) return rankWeightedScoreSum / rankWeightSum;
            return null;
        }
    }
}
