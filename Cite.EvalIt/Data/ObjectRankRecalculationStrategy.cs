using Cite.EvalIt.Common;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace Cite.EvalIt.Data
{
    public class ObjectRankRecalculationStrategyConfiguration
    {
        public List<BaseObjectRankRecalculationStrategy> Strategies { get; set; }
    }

    [BsonKnownTypes(typeof(AllEqualObjectRankRecalculationStrategy), 
                    typeof(LikedObjectRankRecalculationStrategy), 
                    typeof(NetworkPopularityObjectRankRecalculationStrategy), 
                    typeof(NetworkTrustObjectRankRecalculationStrategy), 
                    typeof(ReviewDisciplineVisibilityObjectRankRecalculationStrategy), 
                    typeof(AuthorDisciplineVisibilityObjectRankRecalculationStrategy),
                    typeof(AuthorActivityObjectRankRecalculationStrategy))]
    public class BaseObjectRankRecalculationStrategy
    {
        public Guid Id { get; set; }
        public float StrategyWeight { get; set; }
        public ObjectRankRecalculationStrategyType StrategyType { get; set; }
        public IsActive IsActive { get; set; }
    }

    public class AllEqualObjectRankRecalculationStrategy : BaseObjectRankRecalculationStrategy
    { }

    public class LikedObjectRankRecalculationStrategy : BaseObjectRankRecalculationStrategy
    {
        public RangePartition<float> LikePartition { get; set; }
    }

    public class NetworkPopularityObjectRankRecalculationStrategy : BaseObjectRankRecalculationStrategy
    {
        public RangePartition<float> NetworkPopularityPartition { get; set; }
    }

    public class NetworkTrustObjectRankRecalculationStrategy : BaseObjectRankRecalculationStrategy
    {
        public RangePartition<float> NetworkTrustPartition { get; set; }
    }

    public class ReviewDisciplineVisibilityObjectRankRecalculationStrategy : BaseObjectRankRecalculationStrategy
    {
        public RangePartition<float> ReviewDisciplinePartition { get; set; }
    }

    public class AuthorDisciplineVisibilityObjectRankRecalculationStrategy : BaseObjectRankRecalculationStrategy
    {
        public RangePartition<float> AuthorTrustDisciplinePartition { get; set; }
        public RangePartition<float> AuthorFollowDisciplinePartition { get; set; }
    }

    public class AuthorActivityObjectRankRecalculationStrategy : BaseObjectRankRecalculationStrategy
    {
        public int TimeUnitCount { get; set; }
        public TimeUnit TimeUnit { get; set; }

        public RangePartition<float> AuthorObjectActivityPartition { get; set; }
        public RangePartition<float> AuthorReviewActivityPartition { get; set; }
    }
}
