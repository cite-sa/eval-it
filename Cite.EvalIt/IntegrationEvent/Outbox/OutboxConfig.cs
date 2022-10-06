using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.IntegrationEvent.Outbox
{
    public class OutboxConfig
    {
        public String Exchange { get; set; }
		public String NotifyTopic { get; set; }
		public String ForgetMeCompletedTopic { get; set; }
		public String WhatYouKnowAboutMeCompletedTopic { get; set; }
		public String GenerateFileTopic { get; set; }
	}
}
