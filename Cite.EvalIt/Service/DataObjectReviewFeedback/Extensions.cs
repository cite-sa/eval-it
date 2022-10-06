using Microsoft.Extensions.DependencyInjection;

namespace Cite.EvalIt.Service.DataObjectReviewFeedback
{
    public static class Extensions
    {
        public static IServiceCollection AddDataObjectReviewFeedbackServices(this IServiceCollection services)
        {
            services.AddScoped<IDataObjectReviewFeedbackService, DataObjectReviewFeedbackService>();

            return services;
        }
    }
}
