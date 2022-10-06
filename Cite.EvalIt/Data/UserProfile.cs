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
	public class UserProfile
	{
		[MaxLength(50)]
		[Required]
		public String Timezone { get; set; }

		[Required]
		public String Culture { get; set; }

		[MaxLength(50)]
		[Required]
		public String Language { get; set; }
	}
}
