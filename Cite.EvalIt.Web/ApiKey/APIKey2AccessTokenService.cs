﻿using Cite.Tools.Auth;
using Cite.Tools.Cipher;
using Cite.Tools.Json;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace Cite.EvalIt.Web.APIKey
{
	//GOTCHA: The IdentityModel.Client TokenClient is not used becasue it does not give a hook to define custom header.
	//We need them to be able to send the tenant header. That is why we use HttpClient directly
	public class APIKey2AccessTokenService : IAPIKey2AccessTokenService
	{
		private readonly APIKey2AccessTokenCache _cacheHandler;
		private readonly ILogger<APIKey2AccessTokenService> _logger;
		private readonly APIKey2AccessTokenConfig _config;
		private readonly JsonHandlingService _jsonService;
		private readonly ICipherService _cipherService;
		private readonly HttpClient _httpClient;

		public APIKey2AccessTokenService(
			APIKey2AccessTokenCache cacheHandler,
			ILogger<APIKey2AccessTokenService> logger,
			APIKey2AccessTokenConfig config,
			ICipherService cipherService,
			JsonHandlingService jsonService)
		{
			this._cacheHandler = cacheHandler;
			this._logger = logger;
			this._config = config;
			this._jsonService = jsonService;
			this._cipherService = cipherService;
			this._httpClient = new HttpClient();
		}

		public async Task<String> AccessTokenFor(string apiKey)
		{
			String apiKeyHash = this._cipherService.ToSha256(apiKey);

			APIKey2AccessTokenCache.AccessKey accessKey = await this._cacheHandler.LookupAccessKey(apiKeyHash);

			if (accessKey != null) return accessKey.AccessToken;

			HttpRequestMessage message = new HttpRequestMessage(HttpMethod.Post, $"{this._config.IdpUrl}/connect/token");
			message.Content = new StringContent($"grant_type={this._config.GrantType}&client_id={this._config.ClientId}&scope={this._config.Scope}&client_secret={this._config.ClientSecret}&api_key={apiKey}", Encoding.UTF8, "application/x-www-form-urlencoded");

			HttpResponseMessage response = await this._httpClient.SendAsync(message);
			if (!response.IsSuccessStatusCode)
			{
				this._logger.LogError("Could not retrieve accesstoken. Status Code: {0}, Reason: {1}", response.StatusCode, response.ReasonPhrase);
				throw new ApplicationException("Could not retrieve access token");
			}
			String payload = await response.Content.ReadAsStringAsync();

			Dictionary<String, Object> tokenResponse = this._jsonService.FromJsonSafe<Dictionary<String, Object>>(payload);
			String accessToken = this.ExtractAccessToken(tokenResponse);
			long expiresIn = this.ExtractExpiresIn(tokenResponse);

			await this._cacheHandler.CacheAccessKey(apiKeyHash, new APIKey2AccessTokenCache.AccessKey { AccessToken = accessToken, Expiration = DateTime.UtcNow.AddSeconds(expiresIn) });

			return accessToken;
		}

		public async Task FlushCache(String apiKey)
		{
			String apiKeyHash = this._cipherService.ToSha256(apiKey);
			await this._cacheHandler.ClearAccessKey(apiKeyHash);
		}

		private String ExtractAccessToken(Dictionary<String,Object> data)
		{
			if (!data.ContainsKey("access_token") || data["access_token"] == null || !(data["access_token"] is String) || String.IsNullOrEmpty((String)data["access_token"])) return null;
			return (String)data["access_token"];
		}

		private long ExtractExpiresIn(Dictionary<String, Object> data)
		{
			if (!data.ContainsKey("expires_in") || data["expires_in"] == null || !(data["expires_in"] is long)) return 0;
			return (long)data["expires_in"];
		}
	}
}
