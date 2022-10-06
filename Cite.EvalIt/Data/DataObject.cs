using Cite.EvalIt.Common;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json;
using Cite.Tools.Json.Inflater;
using Newtonsoft.Json.Linq;
using System.Linq;

namespace Cite.EvalIt.Data
{
    public abstract class DataObjectBase
    {
        [BsonId]
        [BsonIgnoreIfDefault]
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public List<PersistentID> UserDefinedIds { get; set; }
        public Guid DataObjectTypeId { get; set; }
        public Guid UserId { get; set; }
        public DataObjectType DataObjectType { get; set; }
        public DataObjectAttributeData AttributeData { get; set; }
        public float? RankScore { get; set; }
        public IsActive IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public IEnumerable<Guid> AssignedTagIds { get; set; }
    }

    public class DataObject : DataObjectBase
    {
        public IEnumerable<DataObjectReview> Reviews { get; set; }
    }

    public class DataObjectUnwound : DataObjectBase
    {
        public DataObjectReview Reviews { get; set; }
        public bool ReviewAuthorInNetwork { get; set; }
    }


    public class DataObjectTwiceUnwound : DataObjectBase
    {
        public DataObjectReviewUnwound Reviews { get; set; }
        public bool ReviewAuthorInNetwork { get; set; }
    }

    public class DataObjectAttributeData
    {
        public List<DataObjectAttribute> Attributes { get; set; }
    }

    [BsonKnownTypes(typeof(AbsoluteIntegerAttribute), typeof(AbsoluteDecimalAttribute), typeof(PercentageAttribute), typeof(TextAttribute), typeof(ScaleAttribute), typeof(SelectionAttribute))]
    public class DataObjectAttribute
    {
        public Guid OptionId { get; set; }
        public DataObjectAttributeType AttributeType { get; set; }
    }

    public class AbsoluteIntegerAttribute : DataObjectAttribute
    {
        public List<int> Values { get; set; }
    }

    public class AbsoluteDecimalAttribute : DataObjectAttribute
    {
        public List<float> Values { get; set; }
    }

    public class PercentageAttribute : DataObjectAttribute
    {
        public List<float> Values { get; set; }
    }

    public class TextAttribute : DataObjectAttribute
    {
        public List<string> Values { get; set; }
    }

    public class ScaleAttribute : DataObjectAttribute
    {
        public List<int> Values { get; set; }
    }

    public class SelectionAttribute : DataObjectAttribute
    {
        public List<string> Values { get; set; }
    }

    public class PersistentID
    {
        public PersistentIDType Type;
        public string Key;
        public string Value;
    }
}