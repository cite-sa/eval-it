using Cite.EvalIt.Common;
using Cite.Tools.Configuration.Extensions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using RabbitMQ.Client.Events;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Cite.EvalIt.Web.Tasks.QueueListener.RabbitMQ.Extensions
{
	public static class Extensions
	{
		public static IServiceCollection AddRabbitMQQueueListenerTask(this IServiceCollection services, IConfigurationSection configurationSection)
		{
			services.ConfigurePOCO<QueueListenerConfig>(configurationSection);
			services.AddSingleton<Microsoft.Extensions.Hosting.IHostedService, QueueListenerTask>();

			return services;
		}
	}
}
