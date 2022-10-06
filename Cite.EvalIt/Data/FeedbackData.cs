using Cite.EvalIt.Common;
using Cite.EvalIt.Common.Validation;
using Cite.EvalIt.Convention;
using Cite.EvalIt.ErrorCode;
using Cite.Tools.Validation;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;

namespace Cite.EvalIt.Data
{
	public class FeedbackData
	{
        public bool Like { get; set; }
	}
}
