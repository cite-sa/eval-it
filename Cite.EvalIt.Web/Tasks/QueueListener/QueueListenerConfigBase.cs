using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Cite.EvalIt.Web.Tasks.QueueListener
{
	public class QueueListenerConfigBase
	{
		public class MessageOptions
		{
			public int? RetryThreashold { get; set; }
			public int MaxRetryDelaySeconds { get; set; }
			public int RetryDelayStepSeconds { get; set; }
			public int? TooOldToSendSeconds { get; set; }
		}

		public MessageOptions Options { get; set; }

		public List<String> ForgetMeRequestTopic { get; set; }
		public List<String> ForgetMeRevokeTopic { get; set; }
		public List<String> UserRemovalTopic { get; set; }
		public List<String> UserTouchedTopic { get; set; }
		public List<String> WhatYouKnowAboutMeRequestTopic { get; set; }
		public List<String> WhatYouKnowAboutMeRevokeTopic { get; set; }
		public List<String> APIKeyStaleTopic { get; set; }
		public List<String> GenerateFileCompletedTopic { get; set; }
	}
}
