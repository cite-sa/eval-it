using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.Common
{
	public enum EvaluationConfigurationType : short
	{
		AbsoluteIntegerEvaluationOption = 0,
		AbsoluteDecimalEvaluationOption = 1,
		PercentageEvaluationOption = 2,
		TextEvaluationOption = 3,
		ScaleEvaluationOption = 4,
		SelectionEvaluationOption = 5,
	}

	public enum RegistrationInformationType : short
    {
		AbsoluteIntegerInputOption = 0,
		AbsoluteDecimalInputOption = 1,
		PercentageInputOption = 2,
		TextInputOption = 3,
		ScaleInputOption = 4,
		SelectionInputOption = 5,
	}

	public enum RankingProfileType : short
	{
		AbsoluteIntegerRankingProfile = 0,
		AbsoluteDecimalRankingProfile = 1,
		PercentageRankingProfile = 2,
		//TextRankingProfile = 3,
		ScaleRankingProfile = 4,
		SelectionRankingProfile = 5,
	}
}
