using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Cite.EvalIt.Web.Tasks.QueueListener.RabbitMQ
{
	public class QueueListenerConfig : QueueListenerConfigBase
	{
		public class ConnectionRecoveryOptions
		{
			public Boolean Enabled { get; set; }
			public int NetworkRecoveryInterval { get; set; }
			public int UnreachableRecoveryInterval { get; set; }
		}

		public Boolean Enable { get; set; }
		public String HostName { get; set; }
		public int Port { get; set; }
		public String Username { get; set; }
		public String Password { get; set; }
		public String Exchange { get; set; }
		public Boolean Durable { get; set; }
		public int QosPrefetchSize { get; set; }
		public int QosPrefetchCount { get; set; }
		public Boolean QosGlobal { get; set; }
		public String QueueName { get; set; }
		public int IntervalSeconds { get; set; }
		public ConnectionRecoveryOptions ConnectionRecovery { get; set; }
	}
}
