using Cite.EvalIt.Common;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace Cite.EvalIt.Data
{

    public abstract class DataObjectReviewBase
    {
        [BsonId]
        [BsonIgnoreIfDefault]
        public Guid Id { get; set; }
        public ReviewAnonymity Anonymity { get; set; }
        public ReviewVisibility Visibility { get; set; }
        public string UserIdHash { get; set; }
        public Guid? UserId { get; set; }
        [BsonIgnoreIfDefault]
        public Guid? DataObjectId { get; set; }
        public DataObjectType DataObjectType { get; set; }
        public float? RankScore { get; set; }
        public ReviewEvaluationData EvaluationData { get; set; }
        public IsActive IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class DataObjectReview : DataObjectReviewBase
    {
        public IEnumerable<DataObjectReviewFeedback> Feedback { get; set; }
    }

    public class DataObjectReviewUnwound : DataObjectReviewBase
    {
        public DataObjectReviewFeedback Feedback { get; set; }
        public bool FeedbackAuthorInNetwork { get; set; }
    }
    

    public class ReviewEvaluationData
    {
        public List<ReviewEvaluation> Evaluations { get; set; }
    }

    [BsonKnownTypes(typeof(AbsoluteIntegerEvaluation), typeof(AbsoluteDecimalEvaluation), typeof(PercentageEvaluation), typeof(TextEvaluation), typeof(ScaleEvaluation), typeof(SelectionEvaluation))]
    public class ReviewEvaluation
    {
        public Guid OptionId { get; set; }
        public ReviewEvaluationType EvaluationType { get; set; }
    }

    public class AbsoluteIntegerEvaluation : ReviewEvaluation
    {
        public List<int> Values { get; set; }
    }

    public class AbsoluteDecimalEvaluation : ReviewEvaluation
    {
        public List<float> Values { get; set; }
    }

    public class PercentageEvaluation : ReviewEvaluation
    {
        public List<float> Values { get; set; }
    }

    public class TextEvaluation : ReviewEvaluation
    {
        public List<string> Values { get; set; }
    }

    public class ScaleEvaluation : ReviewEvaluation
    {
        public List<int> Values { get; set; }
    }

    public class SelectionEvaluation : ReviewEvaluation
    {
        public List<string> Values { get; set; }
    }
}
