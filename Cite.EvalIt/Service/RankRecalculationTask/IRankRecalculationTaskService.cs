using Cite.EvalIt.Common;
using Cite.Tools.FieldSet;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.RankRecalculationTask
{
	public interface IRankRecalculationTaskService
	{
		Task<Model.RankRecalculationTask> AddReviewRankRecalculationTask(Guid userId, IFieldSet fields = null);
		Task<Model.RankRecalculationTask> CancelReviewRankRecalculationTask(Guid taskId, Guid userId, IFieldSet fields = null);
	}
}
