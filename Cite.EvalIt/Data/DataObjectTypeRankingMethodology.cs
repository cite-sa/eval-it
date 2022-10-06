using Cite.EvalIt.Common;
using Cite.Tools.Json.Inflater;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.Data
{
    public class DataObjectTypeRankingMethodology
    {
        [BsonId]
        [BsonIgnoreIfDefault]
        public Guid Id { get; set; }
        public string Name { get; set; }
        public RankingConfiguration Config { get; set; }
        public IsActive IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class RankingConfiguration
    {
        public List<BaseRankingProfile> RankingProfiles { get; set; }
    }

    [BsonKnownTypes(typeof(AbsoluteIntegerRankingProfile), typeof(AbsoluteDecimalRankingProfile), typeof(PercentageRankingProfile), typeof(ScaleRankingProfile), typeof(SelectionRankingProfile))]
    public class BaseRankingProfile
    {
        public Guid OptionId { get; set; }
        public RankingProfileType ProfileType { get; set; }
        public float OptionWeight { get; set; }
        public List<float> MappedUserValues { get; set; }
        public IsActive IsActive { get; set; }

    }

    public class AbsoluteIntegerRankingProfile : BaseRankingProfile
    {
        public List<BoundedType<int>> MappedRangeBounds { get; set; }
    }

    public class AbsoluteDecimalRankingProfile : BaseRankingProfile
    {
        public List<BoundedType<float>> MappedRangeBounds { get; set; }

    }

    public class PercentageRankingProfile : BaseRankingProfile
    {
        public List<BoundedType<float>> MappedRangeBounds { get; set; }
    }

    public class ScaleRankingProfile : BaseRankingProfile
    {
    }

    public class SelectionRankingProfile : BaseRankingProfile
    {
    }

}