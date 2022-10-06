﻿using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.Audit
{
	public class LoggingAuditConfig
	{
		public Boolean Enable { get; set; }
		public LogLevel Level { get; set; }
		public Boolean InvokerContextEnricher { get; set; }
		public Boolean PrincipalEnricher { get; set; }
		public Boolean TimestampEnricher { get; set; }
		public Boolean EnableIdentityTracking { get; set; }
		public String AuditPropertyName { get; set; }
		public String AuditPropertyValue { get; set; }
		public String IdentityTrackingPropertyName { get; set; }
		public String IdentityTrackingPropertyValue { get; set; }
		public Boolean ClaimContextEnricher { get; set; }
		public List<String> ClaimContextEnricherKeys { get; set; }
	}
}
