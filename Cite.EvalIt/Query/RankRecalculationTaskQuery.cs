using Cite.EvalIt.Common;
using Cite.EvalIt.Data;
using Cite.EvalIt.Data.Context;
using Cite.Tools.Common.Extensions;
using Cite.Tools.Data.Query;
using Cite.Tools.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Cite.EvalIt.Query
{
	[JsonObject(MemberSerialization = MemberSerialization.OptIn)]
	public class RankRecalculationTaskQuery : Query<RankRecalculationTask>
	{
		[JsonProperty, LogRename("ids")]
		private List<Guid> _ids { get; set; }
		[JsonProperty, LogRename("excludedIds")]
		private List<Guid> _excludedIds { get; set; }
		[JsonProperty, LogRename("isActive")]
		private List<IsActive> _isActive { get; set; }
		[JsonProperty, LogRename("requestingUserIds")]
		private List<Guid> _requestingUserIds { get; set; }
		[JsonProperty, LogRename("taskStatuses")]
		private List<RankRecalculationTaskStatus> _taskStatuses { get; set; }
		[JsonProperty, LogRename("createdAfter")]
		private DateTime? _createdAfter { get; set; }

		public RankRecalculationTaskQuery(AppDbContext dbContext)
		{
			this._dbContext = dbContext;
		}

		private readonly AppDbContext _dbContext;

		public RankRecalculationTaskQuery Ids(IEnumerable<Guid> ids) { this._ids = this.ToList(ids); return this; }
		public RankRecalculationTaskQuery Ids(Guid id) { this._ids = this.ToList(id.AsArray()); return this; }
		public RankRecalculationTaskQuery ExcludedIds(IEnumerable<Guid> excludedIds) { this._excludedIds = this.ToList(excludedIds); return this; }
		public RankRecalculationTaskQuery ExcludedIds(Guid excludedId) { this._excludedIds = this.ToList(excludedId.AsArray()); return this; }
		public RankRecalculationTaskQuery IsActive(IEnumerable<IsActive> isActive) { this._isActive = this.ToList(isActive); return this; }
		public RankRecalculationTaskQuery IsActive(IsActive isActive) { this._isActive = this.ToList(isActive.AsArray()); return this; }
		public RankRecalculationTaskQuery RequestingUserIds(IEnumerable<Guid> userIds) { this._requestingUserIds = this.ToList(userIds); return this; }
		public RankRecalculationTaskQuery RequestingUserIds(Guid userId) { this._requestingUserIds = this.ToList(userId.AsArray()); return this; }
		public RankRecalculationTaskQuery Status(IEnumerable<RankRecalculationTaskStatus> taskStatus) { this._taskStatuses = this.ToList(taskStatus); return this; }
		public RankRecalculationTaskQuery Status(RankRecalculationTaskStatus taskStatus) { this._taskStatuses = this.ToList(taskStatus.AsArray()); return this; }
		public RankRecalculationTaskQuery CreatedAfter(DateTime? createdAfter) { this._createdAfter = createdAfter; return this; }
		public RankRecalculationTaskQuery EnableTracking() { base.NoTracking = false; return this; }
		public RankRecalculationTaskQuery DisableTracking() { base.NoTracking = true; return this; }
		public RankRecalculationTaskQuery Ordering(Ordering ordering) { this.Order = ordering; return this; }
		public RankRecalculationTaskQuery Paging(Paging paging) { this.Page = paging; return this; }
		public RankRecalculationTaskQuery AsDistinct() { base.Distinct = true; return this; }
		public RankRecalculationTaskQuery AsNotDistinct() { base.Distinct = false; return this; }

		protected override IQueryable<RankRecalculationTask> ApplyFilters(IQueryable<RankRecalculationTask> query)
		{
			if (this._ids != null) query = query.Where(x => this._ids.Contains(x.Id));
			if (this._excludedIds != null) query = query.Where(x => !this._excludedIds.Contains(x.Id));
			if (this._isActive != null) query = query.Where(x => this._isActive.Contains(x.IsActive));
			if (this._requestingUserIds != null) query = query.Where(x => this._requestingUserIds.Contains(x.RequestingUserId));
			if (this._taskStatuses != null) query = query.Where(x => this._taskStatuses.Contains(x.TaskStatus));
			if (this._createdAfter.HasValue) query = query.Where(x => x.CreatedAt > this._createdAfter.Value);
			return query;
		}

		protected override List<string> FieldNamesOf(IEnumerable<FieldResolver> items)
		{
			HashSet<String> projectionFields = new HashSet<String>();
			foreach (FieldResolver item in items)
			{
				if (item.Match(nameof(Data.RankRecalculationTask.Id))) projectionFields.Add(nameof(Data.RankRecalculationTask.Id));
				else if (item.Match(nameof(Data.RankRecalculationTask.ReviewRankingsToCalculate))) projectionFields.Add(nameof(Data.RankRecalculationTask.ReviewRankingsToCalculate));
				else if (item.Match(nameof(Data.RankRecalculationTask.SuccessfulReviewRankings))) projectionFields.Add(nameof(Data.RankRecalculationTask.SuccessfulReviewRankings));
				else if (item.Match(nameof(Data.RankRecalculationTask.FailedReviewRankings))) projectionFields.Add(nameof(Data.RankRecalculationTask.FailedReviewRankings));
				else if (item.Match(nameof(Data.RankRecalculationTask.ObjectRankingsToCalculate))) projectionFields.Add(nameof(Data.RankRecalculationTask.ObjectRankingsToCalculate));
				else if (item.Match(nameof(Data.RankRecalculationTask.SuccessfulObjectRankings))) projectionFields.Add(nameof(Data.RankRecalculationTask.SuccessfulObjectRankings));
				else if (item.Match(nameof(Data.RankRecalculationTask.FailedObjectRankings))) projectionFields.Add(nameof(Data.RankRecalculationTask.FailedObjectRankings));
				else if (item.Match(nameof(Data.RankRecalculationTask.TaskStatus))) projectionFields.Add(nameof(Data.RankRecalculationTask.TaskStatus));
				else if (item.Match(nameof(Data.RankRecalculationTask.IsActive))) projectionFields.Add(nameof(Data.RankRecalculationTask.IsActive));
				else if (item.Match(nameof(Data.RankRecalculationTask.RequestingUserId))) projectionFields.Add(nameof(Data.RankRecalculationTask.RequestingUserId));
				else if (item.Match(nameof(Data.RankRecalculationTask.CreatedAt))) projectionFields.Add(nameof(Data.RankRecalculationTask.CreatedAt));
				else if (item.Match(nameof(Data.RankRecalculationTask.UpdatedAt))) projectionFields.Add(nameof(Data.RankRecalculationTask.UpdatedAt));
				else if (item.Match(nameof(Data.RankRecalculationTask.FinishedAt))) projectionFields.Add(nameof(Data.RankRecalculationTask.FinishedAt));
			}
			//GOTCHA: there is a name class with an obsolete ToList method in Cite.Tools.Common.Extensions. Once that is removed, this can be rewriten as projectionFields.ToList();
			return System.Linq.Enumerable.ToList(projectionFields);
		}

		protected override bool IsFalseQuery()
		{
			return this.IsEmpty(this._isActive) || this.IsEmpty(this._taskStatuses);
			//return this.IsEmpty(this._isActive) || this.IsEmpty(this._notifyStatus) || this.IsEmpty(this._queues)
			//	|| this.IsEmpty(this._exchanges) || this.IsEmpty(this._routes);
		}

		protected override IOrderedQueryable<RankRecalculationTask> OrderClause(IQueryable<RankRecalculationTask> query, OrderingFieldResolver item)
		{
			IOrderedQueryable<Data.RankRecalculationTask> orderedQuery = null;
			if (this.IsOrdered(query)) orderedQuery = query as IOrderedQueryable<Data.RankRecalculationTask>;

			if (item.Match(nameof(Data.RankRecalculationTask.Id))) orderedQuery = this.OrderOn(query, orderedQuery, item, x => x.Id);
			else if (item.Match(nameof(Data.RankRecalculationTask.ReviewRankingsToCalculate))) orderedQuery = this.OrderOn(query, orderedQuery, item, x => x.ReviewRankingsToCalculate);
			else if (item.Match(nameof(Data.RankRecalculationTask.SuccessfulReviewRankings))) orderedQuery = this.OrderOn(query, orderedQuery, item, x => x.SuccessfulReviewRankings);
			else if (item.Match(nameof(Data.RankRecalculationTask.FailedReviewRankings))) orderedQuery = this.OrderOn(query, orderedQuery, item, x => x.FailedReviewRankings);
			else if (item.Match(nameof(Data.RankRecalculationTask.ObjectRankingsToCalculate))) orderedQuery = this.OrderOn(query, orderedQuery, item, x => x.ObjectRankingsToCalculate);
			else if (item.Match(nameof(Data.RankRecalculationTask.SuccessfulObjectRankings))) orderedQuery = this.OrderOn(query, orderedQuery, item, x => x.SuccessfulObjectRankings);
			else if (item.Match(nameof(Data.RankRecalculationTask.FailedObjectRankings))) orderedQuery = this.OrderOn(query, orderedQuery, item, x => x.FailedObjectRankings);
			else if (item.Match(nameof(Data.RankRecalculationTask.TaskStatus))) orderedQuery = this.OrderOn(query, orderedQuery, item, x => x.TaskStatus);
			else if (item.Match(nameof(Data.RankRecalculationTask.IsActive))) orderedQuery = this.OrderOn(query, orderedQuery, item, x => x.IsActive);
			else if (item.Match(nameof(Data.RankRecalculationTask.RequestingUserId))) orderedQuery = this.OrderOn(query, orderedQuery, item, x => x.RequestingUserId);
			else if (item.Match(nameof(Data.RankRecalculationTask.CreatedAt))) orderedQuery = this.OrderOn(query, orderedQuery, item, x => x.CreatedAt);
			else if (item.Match(nameof(Data.RankRecalculationTask.UpdatedAt))) orderedQuery = this.OrderOn(query, orderedQuery, item, x => x.UpdatedAt);
			else if (item.Match(nameof(Data.RankRecalculationTask.FinishedAt))) orderedQuery = this.OrderOn(query, orderedQuery, item, x => x.FinishedAt);
			else return null;

			return orderedQuery;
		}

		protected override IQueryable<RankRecalculationTask> Queryable()
		{
			IQueryable<Data.RankRecalculationTask> query = this._dbContext.RankRecalculationTasks.AsQueryable();
			return query;
		}
	}
}
