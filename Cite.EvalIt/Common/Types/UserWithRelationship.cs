using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.Common
{
	public class UserWithRelationship
	{
		public Guid Id { get; set; }
		public UserNetworkRelationship Relationship { get; set; }
	}

	public class UserWithRelationshipModel
	{
		public Guid Id { get; set; }
		public Model.User User { get; set; }
		public UserNetworkRelationship Relationship { get; set; }
	}
}
