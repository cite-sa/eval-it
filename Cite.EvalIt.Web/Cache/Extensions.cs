using Cite.Tools.Cache;
using Cite.Tools.Exception;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.Web.Cache.Extensions
{
	public static class Extensions
	{
		public static IServiceCollection AddCacheServices(this IServiceCollection services,
			IConfigurationSection cacheConfigurationSection)
		{
			ProviderType type = cacheConfigurationSection.GetValue<ProviderType>("Type", ProviderType.None);

			switch (type)
			{
				case ProviderType.None:
					{
						services.AddDistributedNullCache();
						break;
					}
				case ProviderType.InProc:
					{
						services.AddDistributedMemoryCache();
						break;
					}
				case ProviderType.Redis:
					{
						services.AddDistributedRedisCache(options =>
						{
							options.Configuration = cacheConfigurationSection.GetValue<String>("Redis:Options:Configuration");
							options.InstanceName = cacheConfigurationSection.GetValue<String>("Redis:Options:InstanceName");
						});
						break;
					}
				default: throw new MyApplicationException($"unrecognized cache provider type {type}");
			}

			return services;
		}
	}
}
