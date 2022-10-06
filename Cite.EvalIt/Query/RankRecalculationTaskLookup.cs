using Cite.EvalIt.Common;
using Cite.Tools.Data.Query;
using System;
using System.Collections.Generic;

namespace Cite.EvalIt.Query
{
	public class RankRecalculationTaskLookup : Lookup
	{
		public List<Guid> Ids { get; set; }
		public List<Guid> ExcludedIds { get; set; }
		public List<Guid> RequestingUserIds { get; set; }
		public List<RankRecalculationTaskStatus> TaskStatuses { get; set; }
		public List<IsActive> IsActive { get; set; }
		public DateTime? CreatedAfter { get; set; }

		public RankRecalculationTaskQuery Enrich(QueryFactory factory)
        {
			RankRecalculationTaskQuery query = factory.Query<RankRecalculationTaskQuery>();

			if (this.Ids != null) query.Ids(this.Ids);
			if (this.ExcludedIds != null) query.ExcludedIds(this.ExcludedIds);
			if (this.RequestingUserIds != null) query.RequestingUserIds(this.RequestingUserIds);
			if (this.TaskStatuses != null) query.Status(this.TaskStatuses);
			if (this.IsActive != null) query.IsActive(this.IsActive);
			if (this.CreatedAfter != null) query.CreatedAfter(this.CreatedAfter);

			this.EnrichCommon(query);

			return query;
		}
	}
}
