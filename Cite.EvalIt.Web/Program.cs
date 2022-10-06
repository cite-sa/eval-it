using Cite.Tools.Configuration.Extensions;
using Cite.Tools.Configuration.Substitution;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Serilog;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Cite.EvalIt.Web
{
	public class Program
	{
		public static void Main(string[] args)
		{
			CreateWebHostBuilder(args).Build().Run();
		}

		public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
			WebHost.CreateDefaultBuilder(args)
				.ConfigureAppConfiguration((hostingContext, config) =>
				{
					IWebHostEnvironment env = hostingContext.HostingEnvironment;
					String sharedConfigPath = Path.Combine(env.ContentRootPath, "..", "Configuration");
					config
						//api key
						.AddJsonFileInPaths("apikey.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths("apikey.override.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths($"apikey.{env.EnvironmentName}.json", sharedConfigPath, "Configuration")
						//auditing
						.AddJsonFileInPaths("audit.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths("audit.override.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths($"audit.{env.EnvironmentName}.json", sharedConfigPath, "Configuration")
						//cache invalidation
						.AddJsonFileInPaths("cache.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths("cache.override.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths($"cache.{env.EnvironmentName}.json", sharedConfigPath, "Configuration")
						//cipher
						.AddJsonFileInPaths("cipher.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths("cipher.override.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths($"cipher.{env.EnvironmentName}.json", sharedConfigPath, "Configuration")
						//consent
						.AddJsonFileInPaths("consent.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths("consent.override.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths($"consent.{env.EnvironmentName}.json", sharedConfigPath, "Configuration")
						//cors
						.AddJsonFileInPaths("cors.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths("cors.override.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths($"cors.{env.EnvironmentName}.json", sharedConfigPath, "Configuration")
						//db
						.AddJsonFileInPaths("db.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths("db.override.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths($"db.{env.EnvironmentName}.json", sharedConfigPath, "Configuration")
						//errors
						.AddJsonFileInPaths("errors.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths("errors.override.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths($"errors.{env.EnvironmentName}.json", sharedConfigPath, "Configuration")
						//formatting
						.AddJsonFileInPaths("formatting.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths("formatting.override.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths($"formatting.{env.EnvironmentName}.json", sharedConfigPath, "Configuration")
						//forwarded headers
						.AddJsonFileInPaths("forwarded-headers.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths($"forwarded-headers.override.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths($"forwarded-headers.{env.EnvironmentName}.json", sharedConfigPath, "Configuration")
						//idp claims
						.AddJsonFileInPaths("idp.claims.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths("idp.claims.override.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths($"idp.claims.{env.EnvironmentName}.json", sharedConfigPath, "Configuration")
						//idp client
						.AddJsonFileInPaths("idp.client.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths("idp.client.override.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths($"idp.client.{env.EnvironmentName}.json", sharedConfigPath, "Configuration")
						//locale
						.AddJsonFileInPaths("locale.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths("locale.override.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths($"locale.{env.EnvironmentName}.json", sharedConfigPath, "Configuration")
						//localization
						.AddJsonFileInPaths("localization.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths("localization.override.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths($"localization.{env.EnvironmentName}.json", sharedConfigPath, "Configuration")
						//logging
						.AddJsonFileInPaths("logging.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths("logging.override.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths($"logging.{env.EnvironmentName}.json", sharedConfigPath, "Configuration")
						//log tracking
						.AddJsonFileInPaths("log-tracking.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths("log-tracking.override.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths($"log-tracking.{env.EnvironmentName}.json", sharedConfigPath, "Configuration")
						//permissions
						.AddJsonFileInPaths("permissions.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths("permissions.override.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths($"permissions.{env.EnvironmentName}.json", sharedConfigPath, "Configuration")
						//env
						.AddJsonFileInPaths("env.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths("env.override.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths($"env.{env.EnvironmentName}.json", sharedConfigPath, "Configuration")
						//queue
						.AddJsonFileInPaths("queue.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths("queue.override.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths($"queue.{env.EnvironmentName}.json", sharedConfigPath, "Configuration")
						//notifications
						.AddJsonFileInPaths("notifications.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths("notifications.override.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths($"notifications.{env.EnvironmentName}.json", sharedConfigPath, "Configuration")
						//rank recalculation
						.AddJsonFileInPaths("rank-recalculation.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths("rank-recalculation.override.json", sharedConfigPath, "Configuration")
						.AddJsonFileInPaths($"rank-recalculation.{env.EnvironmentName}.json", sharedConfigPath, "Configuration");
					config.AddEnvironmentVariables("evalit_");
					config.EnableSubstitutions("%{", "}%");
				})
				//Configure Serilog Logging from the configuration settings section
				.UseSerilog((hostingContext, loggerConfiguration) => loggerConfiguration.ReadFrom.Configuration(hostingContext.Configuration))
				.UseStartup<Startup>();
	}
}
