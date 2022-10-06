﻿using Cite.EvalIt.Common;
using Cite.EvalIt.Data.Context;
using Cite.EvalIt.Event;
using Cite.Tools.Cache;
using Cite.Tools.Json;
using Cite.Tools.Logging;
using Cite.Tools.Logging.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Cite.EvalIt.Formatting
{
	public class FormattingCache
	{
		private readonly ILogger<FormattingCache> _logger;
		private readonly IDistributedCache _cache;
		private readonly JsonHandlingService _jsonHandlingService;
		private readonly FormattingCacheConfig _config;
		private readonly EventBroker _eventBroker;
		private readonly IServiceProvider _serviceProvider;

		public FormattingCache(
			ILogger<FormattingCache> logger,
			IDistributedCache cache,
			JsonHandlingService jsonHandlingService,
			FormattingCacheConfig config,
			EventBroker eventBroker,
			IServiceProvider serviceProvider)
		{
			this._logger = logger;
			this._config = config;
			this._cache = cache;
			this._jsonHandlingService = jsonHandlingService;
			this._eventBroker = eventBroker;
			this._serviceProvider = serviceProvider;
		}

		public void RegisterListener()
		{
			this._eventBroker.UserTouched += OnUserTouched;
		}

		private async void OnUserTouched(object sender, OnUserTouchedArgs e)
		{
			this._logger.Debug(new MapLogEntry("recieved event")
				.And("event", nameof(OnUserTouched))
				.And("prefix", this._config.UserProfileCache?.Prefix)
				.And("pattern", this._config.UserProfileCache?.KeyPattern)
				.And("userId", e.UserId));
			try
			{
				String cacheKey = this._config.UserProfileCache.ToKey(new KeyValuePair<String, String>[] {
									new KeyValuePair<string, string>("{prefix}", this._config.UserProfileCache.Prefix),
									new KeyValuePair<string, string>("{key}", e.UserId.ToString())
								});

				await this._cache.RemoveAsync(cacheKey);
			}
			catch (System.Exception ex)
			{
				this._logger.Error(ex, new MapLogEntry("problem invalidating cache entry. skipping")
					.And("prefix", this._config.UserProfileCache?.Prefix)
					.And("pattern", this._config.UserProfileCache?.KeyPattern)
					.And("userId", e.UserId));
			}
		}

		public class UserFormattingProfile
		{
			public String Zone { get; set; }
			public String Culture { get; set; }
			public String Language { get; set; }
		}

		public async Task<UserFormattingProfile> LookupOrCollectUserFormattingProfileAsync(Guid userId)
		{
			String cacheKey = this._config.UserProfileCache.ToKey(new KeyValuePair<String, String>[] {
				new KeyValuePair<string, string>("{prefix}", this._config.UserProfileCache.Prefix),
				new KeyValuePair<string, string>("{key}", userId.ToString())
			});
			String content = await this._cache.GetStringAsync(cacheKey);

			UserFormattingProfile info = this._jsonHandlingService.FromJsonSafe<UserFormattingProfile>(content);
			if (info != null) return info;

			using (var serviceScope = this._serviceProvider.CreateScope())
			{
				AppMongoDbContext mongoDatabase = serviceScope.ServiceProvider.GetService<AppMongoDbContext>();
				FilterDefinition<Data.User> filter = Builders<Data.User>.Filter.Eq(u => u.Id, userId);

				info = mongoDatabase.Find(filter).ToEnumerable().Select(x => new UserFormattingProfile
									{
										Zone = x.Profile.Timezone,
										Culture = x.Profile.Culture,
										Language = x.Profile.Language
									}).FirstOrDefault();
			}

			if (info == null) return null;

			await this._cache.SetStringAsync(cacheKey, this._jsonHandlingService.ToJsonSafe(info), this._config.UserProfileCache.ToOptions());

			return info;
		}
	}
}
