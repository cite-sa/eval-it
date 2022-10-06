using Cite.EvalIt.Common;
using System;
using System.ComponentModel.DataAnnotations;

namespace Cite.EvalIt.Data
{
	public class RankRecalculationTask
	{
		[Key]
		[Required]
		public Guid Id { get; set; }
		
		public int ReviewRankingsToCalculate { get; set; }

		public int SuccessfulReviewRankings { get; set; }

		public int FailedReviewRankings { get; set; }

		public int ObjectRankingsToCalculate { get; set; }

		public int SuccessfulObjectRankings { get; set; }

		public int FailedObjectRankings { get; set; }

		[Required]
		public Guid RequestingUserId { get; set;
		}
		[Required]
		public IsActive IsActive { get; set; }

		[Required]
		public RankRecalculationTaskStatus TaskStatus { get; set; }

		[Required]
		public DateTime CreatedAt { get; set; }

		[Required]
		public DateTime UpdatedAt { get; set; }

		public DateTime? FinishedAt { get; set; }
	}
}
