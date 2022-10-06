using Cite.EvalIt.Common;
using System;

namespace Cite.EvalIt.Model
{
	public class RankRecalculationTask
	{
		public Guid Id { get; set; }
		public int ReviewRankingsToCalculate { get; set; }
		public int SuccessfulReviewRankings { get; set; }
		public int FailedReviewRankings { get; set; }
		public int ObjectRankingsToCalculate { get; set; }
		public int SuccessfulObjectRankings { get; set; }
		public int FailedObjectRankings { get; set; }
		public Guid RequestingUserId { get; set; }
		public User User { get; set; }
		public IsActive IsActive { get; set; }
		public RankRecalculationTaskStatus TaskStatus { get; set; }
		public DateTime CreatedAt { get; set; }
		public DateTime UpdatedAt { get; set; }
		public DateTime? FinishedAt { get; set; }
		public String Hash { get; set; }
	}
}
