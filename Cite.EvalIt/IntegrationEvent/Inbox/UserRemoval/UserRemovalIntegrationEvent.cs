using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.IntegrationEvent.Inbox
{
	public class UserRemovalIntegrationEvent : TrackedEvent
	{
		public Guid? UserId { get; set; }
	}
}
