using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.Common
{
	public enum ReviewEvaluationType : short
	{
		AbsoluteIntegerEvaluation = 0,
		AbsoluteDecimalEvaluation = 1,
		PercentageEvaluation = 2,
		TextEvaluation = 3,
		ScaleEvaluation = 4,
		SelectionEvaluation = 5,
	}
}
