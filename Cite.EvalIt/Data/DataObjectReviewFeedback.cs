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
    public class DataObjectReviewFeedback
    {
        [BsonId]
        [BsonIgnoreIfDefault]
        public Guid Id { get; set; }
        public ReviewAnonymity Anonymity { get; set; }
        public ReviewVisibility Visibility { get; set; }
        public string UserIdHash { get; set; }
        public Guid? UserId { get; set; }
        [BsonIgnoreIfDefault]
        public Guid? DataObjectReviewId { get; set; }
        public FeedbackData FeedbackData { get; set; }
        public IsActive IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

    }
}
