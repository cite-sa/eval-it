using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.ErrorCode
{
	//TODO: Update with the appropriate error codes
	public class ErrorThesaurus
	{
		public struct ErrorDescription
		{
			public int Code { get; set; }
			public String Message { get; set; }
		}

		public ErrorDescription HashConflict { get; set; }
		public ErrorDescription Forbidden { get; set; }
		public ErrorDescription SystemError { get; set; }
		public ErrorDescription InvalidAPIKey { get; set; }
		public ErrorDescription StaleAPIKey { get; set; }
		public ErrorDescription ModelValidation { get; set; }
		public ErrorDescription SensitiveInfo { get; set; }
		public ErrorDescription BlockingConsent { get; set; }
	}
}
