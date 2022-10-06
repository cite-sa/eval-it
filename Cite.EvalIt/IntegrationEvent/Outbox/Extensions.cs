using Cite.Tools.Configuration.Extensions;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.IntegrationEvent.Outbox
{
	public static class Extensions
	{
		public static IServiceCollection AddOutboxIntegrationEventHandlers(this IServiceCollection services, IConfigurationSection outboxConfigurationSection, IConfigurationSection notificationsConfigurationSection)
		{
			services.ConfigurePOCO<OutboxConfig>(outboxConfigurationSection);
			services.ConfigurePOCO<NotificationsConfig>(notificationsConfigurationSection);
			services.AddScoped<IOutboxService, OutboxService>();
            services.AddScoped<INotificationIntegrationEventHandler, NotificationIntegrationEventHandler>();
            services.AddScoped<IForgetMeCompletedIntegrationEventHandler, ForgetMeCompletedIntegrationEventHandler>();
            services.AddScoped<IWhatYouKnowAboutMeCompletedIntegrationEventHandler, WhatYouKnowAboutMeCompletedIntegrationEventHandler>();
            services.AddScoped<IGenerateFileIntegrationEventHandler, GenerateFileIntegrationEventHandler>();
			return services;
		}
	}
}
