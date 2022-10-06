using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Cite.EvalIt.Audit.Extensions;
using Cite.EvalIt.Convention.Extensions;
using Cite.EvalIt.Data.Context;
using Cite.EvalIt.ErrorCode.Extensions;
using Cite.EvalIt.Event.Extensions;
using Cite.EvalIt.Formatting.Extensions;
using Cite.EvalIt.Locale.Extensions;
using Cite.EvalIt.Query;
using Cite.EvalIt.Service.User;
using Cite.EvalIt.Web.APIKey;
using Cite.EvalIt.Web.APIKey.Extensions;
using Cite.EvalIt.Web.Authorization.Extensions;
using Cite.EvalIt.Web.Cache.Extensions;
using Cite.EvalIt.Web.Consent;
using Cite.EvalIt.Web.Consent.Extensions;
using Cite.EvalIt.Web.Error;
using Cite.EvalIt.Web.IdentityServer.Extensions;
using Cite.Tools.Configuration.Extensions;
using Cite.Tools.Data.Builder.Extensions;
using Cite.Tools.Data.Censor.Extensions;
using Cite.Tools.Data.Deleter.Extensions;
using Cite.Tools.Data.Query.Extensions;
using Cite.Tools.Json;
using Cite.Tools.Logging.Extensions;
using Cite.Tools.Validation.Extensions;
using Cite.WebTools.Cors.Extensions;
using Cite.WebTools.CurrentPrincipal.Extensions;
using Cite.WebTools.FieldSet;
using Cite.WebTools.HostingEnvironment.Extensions;
using Cite.WebTools.InvokerContext.Extensions;
using Cite.WebTools.Localization.Extensions;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Cite.Tools.CodeGenerator;
using Cite.Tools.Cipher.Extensions;
using Cite.EvalIt.Common;
using Cite.EvalIt.Web.ForwardedHeaders;
using Cite.EvalIt.Web.LogTracking;
using Cite.EvalIt.Service.LogTracking.Extensions;
using Cite.EvalIt.Web.DI;
using Cite.EvalIt.Web.Tasks.QueueListener.RabbitMQ.Extensions;
using Cite.EvalIt.Web.Tasks.QueuePublisher.RabbitMQ.Extensions;
using Cite.EvalIt.IntegrationEvent.Outbox;
using Cite.EvalIt.IntegrationEvent.Inbox.Extensions;
using MongoDB.Driver;
using Cite.EvalIt.Service.Tag;
using Cite.EvalIt.Service.DataObject;
using Cite.EvalIt.Service.DataObjectType;
using Cite.EvalIt.Service.DataObjectType.EvaluationOptionHelper;
using Cite.EvalIt.Service.DataObjectType.RegistrationInformationInputOptionHelper;
using Cite.EvalIt.Service.Version;
using Cite.EvalIt.Web.Transaction;
using Cite.EvalIt.Web.Tasks.RankRecalculator.Extensions;
using Cite.EvalIt.Service.RankRecalculationTask;
using MongoDB.Bson.Serialization.Conventions;
using Cite.EvalIt.Service.DataObjectReview;
using Cite.EvalIt.Service.DataObjectReviewFeedback;

namespace Cite.EvalIt.Web
{
	public class Startup
	{
		public Startup(IConfiguration configuration, IWebHostEnvironment env)
		{
			this._config = configuration;
			this._env = env;
		}

		private IConfiguration _config { get; }
		private IWebHostEnvironment _env { get; }

		public void ConfigureServices(IServiceCollection services)
		{
			services
				//Localization
				.AddLocalization(options => options.ResourcesPath = this._config.GetSection("Localization:Path").Get<String>())
				//Locale
				.AddLocaleServices(this._config.GetSection("Locale"))
				//Json Handling
				.AddSingleton<JsonHandlingService>()
				//Conventions
				.AddConventionServices()
				//Current principal Resolver
				.AddCurrentPrincipalResolver()
				//Invoker Context Resolver
				.AddInvokerContextResolver()
				//Error Thesaurus
				.AddErrorThesaurus(this._config.GetSection("ErrorThesaurus"))
				//Event Broker
				.AddEventBroker()
				//Permissions
				.AddPermissionsAndPolicies(this._config.GetSection("Permissions"))
				//Consent Middleware
				.ConfigureConsentMiddleware(this._config.GetSection("Consent:Middleware"))
				//QueryingService
				.AddScoped<IQueryingService, QueryingService>()
				//Cipher Service
				.AddCipherServices(this._config.GetSection("Cipher"))
				//VersionInfo Service
				.AddScoped<IVersionInfoService, VersionInfoService>()
				//Hosting Environment
				.AddAspNetCoreHostingEnvironmentResolver()
				//Forwarded Headers
				.AddForwardedHeadersServices(this._config.GetSection("ForwardedHeaders"))
				//Formatting
				.AddFormattingServices(this._config.GetSection("Formatting:Options"), this._config.GetSection("Formatting:Cache"))
				//Api Key
				.AddAPIKeyMiddlewareServices(this._config.GetSection("ApiKey:Resolver:Middleware"), this._config.GetSection("ApiKey:Resolver:TokenService"), this._config.GetSection("ApiKey:Resolver:Cache"))
				//Model Validators
				.AddValidatorsAndFactory(typeof(Cite.Tools.Validation.IValidator), typeof(Cite.EvalIt.AssemblyHandle))
				//Model Builders
				.AddBuildersAndFactory(typeof(Cite.Tools.Data.Builder.IBuilder), typeof(Cite.EvalIt.AssemblyHandle))
				.AddTransient<EvalIt.Web.Model.AccountBuilder>()
				//Model Deleters
				.AddDeletersAndFactory(typeof(Cite.Tools.Data.Deleter.IDeleter), typeof(Cite.EvalIt.AssemblyHandle))
				//Model Censors
				.AddCensorsAndFactory(typeof(Cite.Tools.Data.Censor.ICensor), typeof(Cite.EvalIt.AssemblyHandle))
				//Querying
				.AddQueriesAndFactory(typeof(Cite.Tools.Data.Query.IQuery), typeof(Cite.EvalIt.AssemblyHandle))
				//Queue Inbox Integration Event handlers
				.AddInboxIntegrationEventHandlers()
				//Queue Outbox Integration Event handlers
				.AddOutboxIntegrationEventHandlers(this._config.GetSection("Queue:Task:Publisher:Options"), this._config.GetSection("Notifications"));

				// TODO: Temporary
				// Transient until queryFactory is implemented
				services.AddTransient<UserQuery>();
				services.AddTransient<TagQuery>();
				services.AddTransient<DataObjectQuery>();
				services.AddTransient<DataObjectTypeQuery>();
				services.AddTransient<DataObjectReviewQuery>();
				services.AddTransient<DataObjectReviewFeedbackQuery>();
				services.AddScoped<ITagService, TagService>();
				services.AddScoped<IUserService, UserService>();
				services.AddScoped<IRankRecalculationTaskService, RankRecalculationTaskService>();
				services.AddDataObjectTypeServices();
				services.AddDataObjectServices();
				services.AddDataObjectReviewServices();
				services.AddDataObjectReviewFeedbackServices();

				services.AddRankRecalculatorTask(this._config.GetSection("RankRecalculator"));

			string queueProvider = this._config.GetSection("Queue:Task:Provider").Get<String>();
				switch (queueProvider)
				{
					case "RabbitMQ":
						{
							services
								//Queue Listener Task
								.AddRabbitMQQueueListenerTask(this._config.GetSection("Queue:Task:Listener:RabbitMQ"))
								//Queue Publisher Task
								.AddRabbitMQQueuePublisherTask(this._config.GetSection("Queue:Task:Publisher:RabbitMQ"));
							break;
						}
					case "DB":
						{
							break;
						}
					//no Queue configured
					default: { break; }
				}
			services
				//distributed cache
				.AddCacheServices(this._config.GetSection("Cache:Provider"))
				//CORS
				.AddCorsPolicy(this._config.GetSection("CorsPolicy"))
				//Transactions
				.AddScoped<QueueTransactionFilter>()
				.AddScoped<AppMongoTransactionFilter>()
				//Code Generator
				.AddScoped<ICodeGeneratorService, GuidCodeGeneratorService>()
				//Log tracking services
				.AddLogTrackingServices(this._config.GetSection("Tracking:Correlation"))
				//Identity Server
				.AddClaimExtractorServices(this._config.GetSection("IdpClient:Claims"))
				.AddIdentityServerAndConfigureAsClient(this._config.GetSection("IdpClient:ProtectMe"));

			services.ConfigurePOCO<CipherProfiles>(this._config.GetSection("CipherProfiles"));

			//Logging
			Cite.Tools.Logging.LoggingSerializerContractResolver.Instance.Configure((builder) =>
			{
				builder
					.RuntimeScannng(true)
					.Sensitive(typeof(Cite.Tools.Http.HeaderHints), nameof(Cite.Tools.Http.HeaderHints.BearerAccessToken))
					.Sensitive(typeof(Cite.Tools.Http.HeaderHints), nameof(Cite.Tools.Http.HeaderHints.BasicAuthenticationToken));
			}, (settings) =>
			{
				settings.Converters.Add(new Tools.Logging.StringValueEnumConverter());
			});
			services
				//Auditing
				.AddAuditingServices(this._config.GetSection("Auditing"));

			//Database
			Boolean enableEFParameterLogging = this._config.GetSection("Logging:EFParameterLogging").Get<Boolean>();

			services.ConfigurePOCO<Data.Context.DbProviderConfig>(this._config.GetSection("Db:Provider"));
			Data.Context.DbProviderConfig dbProviderConfig = new Data.Context.DbProviderConfig();
			this._config.GetSection("Db:Provider").Bind(dbProviderConfig);

			switch (dbProviderConfig.Provider)
			{
				case Data.Context.DbProviderConfig.DbProvider.SQLServer:
					{
						services.AddDbContext<AppDbContext>(options => options.UseSqlServer(this._config.GetConnectionString("NotificationDbContext")).EnableSensitiveDataLogging(enableEFParameterLogging));
						break;
					}
				case Data.Context.DbProviderConfig.DbProvider.PostgreSQL:
					{
						services.AddDbContext<AppDbContext>(options => options.UseNpgsql(this._config.GetConnectionString("NotificationDbContext")).EnableSensitiveDataLogging(enableEFParameterLogging));
						break;
					}
				default: throw new Tools.Exception.MyApplicationException("db provider misconfiguration");
			}

			//MongoDB

			// Don't throw an exception when documents have elements not in entity model
			//var conventionPack = new ConventionPack {  new IgnoreExtraElementsConvention(true) };
			//ConventionRegistry.Register("IgnoreExtraElements", conventionPack, type => true);

            services.AddSingleton<IMongoClient>(c => new MongoClient(this._config.GetConnectionString("MongoDbClient")));
			services.AddSingleton<IMongoDatabase>(c => new MongoClient(this._config.GetConnectionString("MongoDbClient")).GetDatabase(new MongoUrl(this._config.GetConnectionString("MongoDbClient")).DatabaseName));
			services.AddScoped<AppMongoDbContext>();

            //MVC
            services.AddMvcCore(options =>
			{
				options.ModelBinderProviders.Insert(0, new FieldSetModelBinderProvider());
			})
			.AddAuthorization()
			.AddNewtonsoftJson(options =>
			{
				options.SerializerSettings.Culture = System.Globalization.CultureInfo.InvariantCulture;
				options.SerializerSettings.DateTimeZoneHandling = Newtonsoft.Json.DateTimeZoneHandling.Utc;
				options.SerializerSettings.DateFormatHandling = Newtonsoft.Json.DateFormatHandling.IsoDateFormat;
				options.SerializerSettings.NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore;
			});
		}

		public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
		{
			app
				//Log Tracking Middleware
				.UseMiddleware(typeof(LogTrackingMiddleware))
				//Handle Forwarded Requests and preserve caller context
				.UseForwardedHeaders(this._config.GetSection("ForwardedHeaders"))
				//Request Localization
				.UseRequestLocalizationAndConfigure(this._config.GetSection("Localization:SupportedCultures"), this._config.GetSection("Localization:DefaultCulture"))
				//CORS
				.UseCorsPolicy(this._config.GetSection("CorsPolicy"))
				//Error Handling
				.UseMiddleware(typeof(ErrorHandlingMiddleware))
				//Routing
				.UseRouting()
				//Api Key
				.UseMiddleware(typeof(APIKeyMiddleware))
				//Authentication
				.UseAuthentication()
				//Consent
				.UseMiddleware(typeof(ConsentMiddleware))
				//Authorization
				.UseAuthorization()
				//Endpoints
				.UseEndpoints(endpoints => endpoints.MapControllers())
				//Bootstrap Api Key Middleware Cache Invalidation to register for events
				.BootstrapAPIKeyMiddlewareCacheInvalidationServices()
				//Bootstrap Formatting Cache invalidation to register for events
				.BootstrapFormattingCacheInvalidationServices();
		}
	}
}
