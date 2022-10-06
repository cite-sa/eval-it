using Cite.EvalIt.Common;
using Cite.Tools.Data.Query;
using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.Query
{
	public class UserLookup : Lookup
	{
		public string Like { get; set; }
		public List<Guid> Ids { get; set; }
		public List<Guid> ExcludedIds { get; set; }
		public List<Guid> TagIds { get; set; }
		public List<IsActive> IsActive { get; set; }
		public Guid? ReferenceUserId { get; set; }
		public List<bool> IsNetworkCandidate { get; set; }

		//public UserQuery Enrich(QueryFactory factory)
		//{
		//	UserQuery query = factory.Query<UserQuery>();

		//	if (this.Ids != null) query.Ids(this.Ids);
		//	if (this.ExcludedIds != null) query.ExcludedIds(this.ExcludedIds);
		//	if (this.IsActive != null) query.IsActive(this.IsActive);

		//	this.EnrichCommon(query);

		//	return query;
		//}
	}
}
