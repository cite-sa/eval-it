using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.Event
{
	public struct OnUserTouchedArgs
	{
		public OnUserTouchedArgs(Guid userId)
		{
			this.UserId = userId;
		}
		public Guid UserId { get; private set; }
	}
}
