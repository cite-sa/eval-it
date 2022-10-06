using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.IntegrationEvent.Outbox
{
	public class WhatYouKnowAboutMeCompletedIntegrationEvent : TrackedEvent
	{
		public class InlinePayload
		{
			public String Name { get; set; }
			public String Extension { get; set; }
			public String MimeType { get; set; }
			public String Payload { get; set; }
		}

		public Guid Id { get; set; }
		public Guid UserId { get; set; }
		public Boolean Success { get; set; }
		public InlinePayload Inline { get; set; }
	}
}
