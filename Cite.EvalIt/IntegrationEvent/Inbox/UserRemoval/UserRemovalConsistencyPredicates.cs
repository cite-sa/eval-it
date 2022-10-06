using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.IntegrationEvent.Inbox
{
	public class UserRemovalConsistencyPredicates : IConsistencyPredicates
	{
		public Guid UserId { get; set; }
	}
}
