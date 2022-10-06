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
    public class AuthorDisciplineVisibilityObjectRankRecalculationStrategyHelper : BaseObjectRankRecalculationStrategyHelper<Model.AuthorDisciplineVisibilityObjectRankRecalculationStrategy, AuthorDisciplineVisibilityObjectRankRecalculationStrategyPersist, Data.AuthorDisciplineVisibilityObjectRankRecalculationStrategy>
    {
        private readonly UserQuery _userQuery;
        private readonly TagQuery _tagQuery;

        public AuthorDisciplineVisibilityObjectRankRecalculationStrategyHelper(BuilderFactory builderFactory, ValidatorFactory validatorFactory, UserQuery userQuery, TagQuery tagQuery) : base(builderFactory, validatorFactory)
        {
            this._userQuery = userQuery;
            this._tagQuery = tagQuery;
        }

        public override Data.BaseObjectRankRecalculationStrategy NewData()
        {
            return new Data.AuthorDisciplineVisibilityObjectRankRecalculationStrategy();
        }

        public override Data.BaseObjectRankRecalculationStrategy NewData(Data.BaseObjectRankRecalculationStrategy data)
        {
            return new Data.AuthorDisciplineVisibilityObjectRankRecalculationStrategy()
            {
                StrategyType = data.StrategyType,
                StrategyWeight = data.StrategyWeight
            };
        }

        public async override Task<Model.BaseObjectRankRecalculationStrategy> Build(IFieldSet fields, Data.BaseObjectRankRecalculationStrategy data)
        {
            return await this._builderFactory.Builder<AuthorDisciplineVisibilityObjectRankRecalculationStrategyBuilder>().Build(fields, data);
        }

        protected override void Validate(AuthorDisciplineVisibilityObjectRankRecalculationStrategyPersist item)
        {
            this._validatorFactory.Validator<AuthorDisciplineVisibilityObjectRankRecalculationStrategyPersist.AuthorDisciplineVisibilityObjectRankRecalculationStrategyPersistValidator>().ValidateForce(item);
        }

        protected override void PersistChildClassFields(Data.AuthorDisciplineVisibilityObjectRankRecalculationStrategy data, AuthorDisciplineVisibilityObjectRankRecalculationStrategyPersist model)
        {
            data.AuthorTrustDisciplinePartition = model.AuthorTrustDisciplinePartition;
            data.AuthorFollowDisciplinePartition = model.AuthorFollowDisciplinePartition;
        }

        protected override async Task<float?> AggregateReviewRanks(Data.AuthorDisciplineVisibilityObjectRankRecalculationStrategy data, Data.DataObject dataObject)
        {
            IEnumerable<Data.DataObjectReview> reviews = dataObject.Reviews.Where(x => x.IsActive == IsActive.Active);

            if (reviews == null) return null;

            float rankWeightedScoreSum = 0, rankWeightSum = 0;

            IEnumerable<Guid> userIds = reviews.Where(x => x.UserId != null).Select(x => x.UserId.Value).Distinct();
            IEnumerable<Guid> tagIds = dataObject.AssignedTagIds;

            IEnumerable<Data.User> users = await this._userQuery.NetworkIds(userIds).Collect();
            IEnumerable<Data.User> authors = await this._userQuery.NetworkIds(null).Ids(userIds).Collect();
            IEnumerable<Data.Tag> tags = await this._tagQuery.Ids(tagIds).Collect();

            IEnumerable<Guid> objectDisciplineIds = tags.Where(t => t.Type == TagType.Discipline && t.AppliesTo == TagAppliesTo.All).Select(t => t.Id);
            Dictionary<Guid, Data.User> userMap = users.ToDictionary(u => u.Id, u => u);

            Dictionary<Guid, int> trustCountMap = authors.ToDictionary(u => u.Id, u => users.Where(f => f.UserNetworkIds.Where(r => r.Relationship == UserNetworkRelationship.Trust && r.Id == u.Id).Any() && f.AssignedTagIds.Intersect(objectDisciplineIds).Any()).Count());
            Dictionary<Guid, int> followCountMap = authors.ToDictionary(u => u.Id, u => users.Where(f => f.UserNetworkIds.Where(r => r.Relationship == UserNetworkRelationship.Follow && r.Id == u.Id).Any() && f.AssignedTagIds.Intersect(objectDisciplineIds).Any()).Count());

            int totalTrustCount = trustCountMap.Values.Sum();
            int totalFollowCount = followCountMap.Values.Sum();

            foreach (var review in reviews.Where(x => x.UserId != null).Where(x => x.RankScore != null))
            {
                float reviewWeight = 0;
                int objectDisciplineTrustingCount = trustCountMap[review.UserId.Value];

                if (data.AuthorTrustDisciplinePartition.RangeValues?.Count == 0) reviewWeight += objectDisciplineTrustingCount;
                else
                {
                    float bucketClassificationValue = objectDisciplineTrustingCount;
                    if (data.AuthorTrustDisciplinePartition.RangeInterpretation == StrategyRangeInterpretation.Percentage) bucketClassificationValue = (totalTrustCount > 0) ? (float)(objectDisciplineTrustingCount * 100) / (float)totalTrustCount : 100;

                    reviewWeight += data.AuthorTrustDisciplinePartition.RangeValues.ElementAt(data.AuthorTrustDisciplinePartition.RangeBounds.SearchBoundList(bucketClassificationValue));
                }

                int objectDisciplineFollowerCount = followCountMap[review.UserId.Value];

                if (data.AuthorFollowDisciplinePartition.RangeValues?.Count == 0) reviewWeight += objectDisciplineFollowerCount;
                else
                {
                    float bucketClassificationValue = objectDisciplineFollowerCount;
                    if (data.AuthorFollowDisciplinePartition.RangeInterpretation == StrategyRangeInterpretation.Percentage) bucketClassificationValue = (totalFollowCount > 0) ? (float)(objectDisciplineFollowerCount * 100) / (float)totalFollowCount : 100;

                    reviewWeight += data.AuthorFollowDisciplinePartition.RangeValues.ElementAt(data.AuthorFollowDisciplinePartition.RangeBounds.SearchBoundList(bucketClassificationValue));
                }

                rankWeightedScoreSum += review.RankScore.Value * reviewWeight;
                rankWeightSum += reviewWeight;
            }

            if (reviews.Count() > 0 && rankWeightSum > 0) return rankWeightedScoreSum / rankWeightSum;
            return null;
        }
    }
}
