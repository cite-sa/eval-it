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
    public class User
    {
        [BsonId]
        [BsonIgnoreIfDefault]
        [Required]
        public Guid Id { get; set; }

        [MaxLength(50)]
        [Required]
        public string Name { get; set; }

        [Required]
        public IsActive IsActive { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; }

        [Required]
        public DateTime UpdatedAt { get; set; }

        public UserProfile Profile { get; set; }
        [BsonIgnoreIfDefault]
        public bool? IsNetworkCandidate { get; set; }
        public IEnumerable<Guid> AssignedTagIds { get; set; }
        public IEnumerable<UserWithRelationship> UserNetworkIds { get; set; }
    }
}