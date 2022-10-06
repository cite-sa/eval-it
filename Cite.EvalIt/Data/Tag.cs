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
    public class Tag
    {
        [BsonId]
        [BsonIgnoreIfDefault]
		public Guid Id { get; set; }
		public TagType Type { get; set; }
		public TagAppliesTo AppliesTo { get; set; }
		public string Label { get; set; }
		public IsActive IsActive { get; set; }
		public DateTime CreatedAt { get; set; }
		public DateTime UpdatedAt { get; set; }
	}

}
