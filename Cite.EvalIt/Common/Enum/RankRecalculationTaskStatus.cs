using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.Common
{
	public enum RankRecalculationTaskStatus
	{
		Pending = 0,
		Processing = 1,
		Successful = 2,
		Error = 3,
		Cancelled = 4,
		Aborted = 5
	}
}
