using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.IntegrationEvent.Outbox
{
	public class ForgetMeCompletedIntegrationEvent : TrackedEvent
	{
		public Guid Id { get; set; }
		public Guid UserId { get; set; }
		public Boolean Success { get; set; }
	}
}
