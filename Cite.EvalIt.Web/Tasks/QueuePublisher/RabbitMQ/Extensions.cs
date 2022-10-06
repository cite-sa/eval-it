using Cite.Tools.Configuration.Extensions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Cite.EvalIt.Web.Tasks.QueuePublisher.RabbitMQ.Extensions
{
	public static class Extensions
	{
		public static IServiceCollection AddRabbitMQQueuePublisherTask(this IServiceCollection services, IConfigurationSection configurationSection)
		{
			services.ConfigurePOCO<QueuePublisherConfig>(configurationSection);
			services.AddSingleton<Microsoft.Extensions.Hosting.IHostedService, QueuePublisherTask>();

			return services;
		}
	}
}
