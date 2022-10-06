using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Cite.EvalIt.Web.Consent
{
	public class ConsentMiddlewareConfig
	{
		public List<String> WhiteListedRequestPath { get; set; }
		public String BlockingConsentName { get; set; }
	}
}
