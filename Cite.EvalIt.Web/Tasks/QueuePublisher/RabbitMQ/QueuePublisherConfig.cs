using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Cite.EvalIt.Web.Tasks.QueuePublisher.RabbitMQ
{
	public class QueuePublisherConfig : QueuePublisherConfigBase
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
		public Boolean Durable { get; set; }
		public String AppId { get; set; }
		public int IntervalSeconds { get; set; }
		public ConnectionRecoveryOptions ConnectionRecovery { get; set; }
	}
}
