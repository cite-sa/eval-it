﻿using Cite.EvalIt.Event;
using Cite.Tools.Cache;
using Cite.Tools.Json;
using Cite.Tools.Logging;
using Cite.Tools.Logging.Extensions;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Cite.EvalIt.Web.APIKey
{
	public class APIKey2AccessTokenCache
	{
		private readonly IDistributedCache _cache;
		private readonly JsonHandlingService _jsonService;
		private readonly ILogger<APIKey2AccessTokenCache> _logger;
		private readonly APIKey2AccessTokenCacheConfig _config;
		private readonly EventBroker _eventBroker;

		public APIKey2AccessTokenCache(
			IDistributedCache cache,
			EventBroker eventBroker,
			ILogger<APIKey2AccessTokenCache> logger,
			APIKey2AccessTokenCacheConfig config,
			JsonHandlingService jsonService)
		{
			this._cache = cache;
			this._eventBroker = eventBroker;
			this._logger = logger;
			this._config = config;
			this._jsonService = jsonService;
		}

		public void RegisterListener()
		{
			this._eventBroker.ApiKeyRemoved += OnApiKeyRemoved;
		}

		private async void OnApiKeyRemoved(object sender, OnApiKeyRemovedArgs e)
		{
			this._logger.Debug(new MapLogEntry("recieved event")
				.And("event", nameof(OnApiKeyRemoved))
				.And("prefix", this._config.AccessTokenCache?.Prefix)
				.And("pattern", this._config.AccessTokenCache?.KeyPattern)
				.And("userId", e.UserId)
				.And("apiKey", e.ApiKeyHash.LogAsSensitive()));
			try
			{
				String cacheKey = this._config.AccessTokenCache.ToKey(new KeyValuePair<String, String>[] {
									new KeyValuePair<string, string>("{prefix}", this._config.AccessTokenCache.Prefix),
									new KeyValuePair<string, string>("{key}", e.ApiKeyHash.LogAsSensitive())
								});

				await this._cache.RemoveAsync(cacheKey);
			}
			catch (System.Exception ex)
			{
				this._logger.Error(ex, new MapLogEntry("problem invalidating cache entry. skipping")
					.And("prefix", this._config.AccessTokenCache?.Prefix)
					.And("pattern", this._config.AccessTokenCache?.KeyPattern)
					.And("userId", e.ApiKeyHash.LogAsSensitive()));
			}
		}

		public class AccessKey
		{
			public String AccessToken { get; set; }
			public DateTime Expiration { get; set; }
		}

		public async Task ClearAccessKey(String apiKeyHash)
		{
			String cacheKey = this._config.AccessTokenCache.ToKey(new KeyValuePair<String, String>[] {
					new KeyValuePair<string, string>("{prefix}", this._config.AccessTokenCache.Prefix),
					new KeyValuePair<string, string>("{key}", apiKeyHash)
				});

			await this._cache.RemoveAsync(cacheKey);
		}

		public async Task CacheAccessKey(String apiKeyHash, AccessKey accessKey)
		{
			String cacheKey = this._config.AccessTokenCache.ToKey(new KeyValuePair<String, String>[] {
					new KeyValuePair<string, string>("{prefix}", this._config.AccessTokenCache.Prefix),
					new KeyValuePair<string, string>("{key}", apiKeyHash)
				});
			await this._cache.SetStringAsync(cacheKey, this._jsonService.ToJsonSafe(accessKey), this._config.AccessTokenCache.ToOptions());
		}

		public async Task<AccessKey> LookupAccessKey(String apiKeyHash)
		{
			String cacheKey = this._config.AccessTokenCache.ToKey(new KeyValuePair<String, String>[] {
					new KeyValuePair<string, string>("{prefix}", this._config.AccessTokenCache.Prefix),
					new KeyValuePair<string, string>("{key}", apiKeyHash)
				});
			String content = await this._cache.GetStringAsync(cacheKey);

			AccessKey info = this._jsonService.FromJsonSafe<AccessKey>(content);

			if (info == null) return null;

			if (info.Expiration <= DateTime.UtcNow || String.IsNullOrEmpty(info.AccessToken))
			{
				await this._cache.RemoveAsync(cacheKey);
				info = null;
			}

			return info;
		}
	}
}
