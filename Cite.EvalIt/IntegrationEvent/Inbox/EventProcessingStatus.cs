using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.IntegrationEvent.Inbox
{
	public enum EventProcessingStatus
	{
		Error = 0,
		Success = 1,
		Postponed = 2,
		Discard = 3
	}
}
