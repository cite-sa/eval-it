using Cite.EvalIt.Common;
using Cite.Tools.Common.Extensions;
using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.Event
{
	public class EventBroker
	{
		#region User Touched

		private EventHandler<OnUserTouchedArgs> _userTouched;
		public event EventHandler<OnUserTouchedArgs> UserTouched
		{
			add { this._userTouched += value; }
			remove { this._userTouched -= value; }
		}

		public void EmitUserTouched(Guid userId)
		{
			this.EmitUserTouched(this, userId);
		}

		public void EmitUserTouched(Object sender, Guid userId)
		{
			this._userTouched?.Invoke(sender, new OnUserTouchedArgs(userId));
		}

		#endregion

		#region Api Key Removed

		private EventHandler<OnApiKeyRemovedArgs> _apiKeyRemoved;
		public event EventHandler<OnApiKeyRemovedArgs> ApiKeyRemoved
		{
			add { this._apiKeyRemoved += value; }
			remove { this._apiKeyRemoved -= value; }
		}

		public void EmitApiKeyRemoved(Guid userId, String apiKeyHash)
		{
			this.EmitApiKeyRemoved(this, userId, apiKeyHash);
		}

		public void EmitApiKeyRemoved(IEnumerable<OnApiKeyRemovedArgs> events)
		{
			this.EmitApiKeyRemoved(this, events);
		}

		public void EmitApiKeyRemoved(Object sender, Guid userId, String apiKeyHash)
		{
			this._apiKeyRemoved?.Invoke(sender, new OnApiKeyRemovedArgs(userId, apiKeyHash));
		}

		public void EmitApiKeyRemoved(Object sender, IEnumerable<OnApiKeyRemovedArgs> events)
		{
			if (events == null) return;
			foreach (OnApiKeyRemovedArgs ev in events) this._apiKeyRemoved?.Invoke(sender, ev);
		}

		#endregion
	}
}
