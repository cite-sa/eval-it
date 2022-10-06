using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Cite.EvalIt.Web.Tasks.QueuePublisher
{
	public class QueuePublisherConfigBase
	{
		public class MessageOptions
		{
			public int? RetryThreashold { get; set; }
			public int MaxRetryDelaySeconds { get; set; }
			public int RetryDelayStepSeconds { get; set; }
			public int? TooOldToSendSeconds { get; set; }
			public int ConfirmTimeoutSeconds { get; set; }
		}

		public MessageOptions Options { get; set; }
	}
}
