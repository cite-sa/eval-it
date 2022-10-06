using Cite.EvalIt.Common;
using Cite.EvalIt.Model;
using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.IntegrationEvent.Inbox
{
	public class UserTouchedIntegrationEvent : TrackedEvent
	{
		public Guid? Id { get; set; }
		public UserProfile Profile { get; set; }
		public String Name { get; set; }
	}
}
