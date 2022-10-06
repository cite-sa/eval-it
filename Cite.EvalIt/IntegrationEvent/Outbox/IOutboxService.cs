using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Cite.EvalIt.IntegrationEvent.Outbox
{
	public interface IOutboxService
	{
		Task PublishAsync(OutboxIntegrationEvent item);
	}
}
