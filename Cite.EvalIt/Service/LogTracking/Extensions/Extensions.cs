using Cite.Tools.Configuration.Extensions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.Service.LogTracking.Extensions
{
	public static class Extensions
	{
		public static IServiceCollection AddLogTrackingServices(
			this IServiceCollection services,
			IConfigurationSection logTrackingConfigurationSection)
		{
			services.ConfigurePOCO<LogTrackingConfig>(logTrackingConfigurationSection);
			services.AddSingleton<ILogTrackingService, LogTrackingService>();

			return services;
		}
	}
}
