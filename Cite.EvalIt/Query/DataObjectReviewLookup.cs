using Cite.EvalIt.Common;
using Cite.Tools.Data.Query;
using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.Query
{
	public class DataObjectReviewLookup : Lookup
	{
		public List<Guid> Ids { get; set; }
		public List<Guid> ExcludedIds { get; set; }
		public List<Guid> ObjectIds { get; set; }
		public List<Guid> UserIds { get; set; }
		public List<IsActive> IsActive { get; set; }

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
