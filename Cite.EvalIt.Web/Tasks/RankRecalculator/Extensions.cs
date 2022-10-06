using Cite.Tools.Configuration.Extensions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Cite.EvalIt.Web.Tasks.RankRecalculator.Extensions
{
	public static class Extensions
	{
		public static IServiceCollection AddRankRecalculatorTask(this IServiceCollection services, IConfigurationSection configurationSection)
		{
			services.ConfigurePOCO<RankRecalculatorConfig>(configurationSection);
			services.AddSingleton<Microsoft.Extensions.Hosting.IHostedService, RankRecalculatorTask>();

			return services;
		}
	}
}
