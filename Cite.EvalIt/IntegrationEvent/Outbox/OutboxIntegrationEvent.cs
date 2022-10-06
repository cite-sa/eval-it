using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.IntegrationEvent.Outbox
{
	public class OutboxIntegrationEvent
	{
		public enum EventType
		{
			ForgetMeCompleted,
			Notify,
			TenantReactivate,
			TenantRemove,
			TenantTouch,
			TenantUserInvite,
			WhatYouKnowAboutMeCompleted,
			GenerateFile
		}

		public EventType Type { get; set; }
		public String Id { get; set; }
		[JsonIgnore]
		public TrackedEvent Event { get; set; }
		public String Message { get; set; }
	}
}
