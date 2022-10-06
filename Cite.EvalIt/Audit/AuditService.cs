using Cite.Tools.Auth.Claims;
using Cite.WebTools.CurrentPrincipal;
using Cite.WebTools.InvokerContext;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.Audit
{
	public class AuditService : LoggingAuditService
	{
		public AuditService(
			ICurrentPrincipalResolverService currentPrincipalResolverService,
			IInvokerContextResolverService invokerContextResolverService,
			ILoggerFactory logger,
			LoggingAuditConfig config,
			ClaimExtractor extractor) : base(currentPrincipalResolverService, invokerContextResolverService, logger.CreateLogger("audit"), config, extractor)
		{}

	}
}
