using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.Event
{
	public struct OnApiKeyRemovedArgs
	{
		public OnApiKeyRemovedArgs(Guid userId, String apiKeyHash)
		{
			this.ApiKeyHash = apiKeyHash;
			this.UserId = userId;
		}

		public String ApiKeyHash { get; private set; }
		public Guid UserId { get; private set; }
	}
}
