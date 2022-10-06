using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.Common
{
	public enum ObjectRankRecalculationStrategyType
	{
		AllEqual = 0,
		Liked = 1,
		NetworkPopularity = 2,
		NetworkTrust = 3,
		ReviewDisciplineVisibility = 4,
		AuthorDisciplineVisibility = 5,
		AuthorActivity = 6
	}
}
