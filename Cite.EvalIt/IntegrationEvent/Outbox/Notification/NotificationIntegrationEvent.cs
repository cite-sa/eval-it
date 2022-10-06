using Cite.EvalIt.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.IntegrationEvent.Outbox
{
	public class NotificationIntegrationEvent : TrackedEvent
	{
		public Guid? UserId { get; set; }
		public Guid? NotificationType { get; set; }
		public NotificationContactType? ContactTypeHint { get; set; }
		public String ContactHint { get; set; }
		public String Data { get; set; }
		public String ProvenanceRef { get; set; }
	}
}
