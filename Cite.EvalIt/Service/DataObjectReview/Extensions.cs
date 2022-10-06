using Cite.EvalIt.Common;
using Cite.EvalIt.Service.DataObjectType.ReviewEvaluationHelper;
using Cite.Tools.DI.Extensions;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;

namespace Cite.EvalIt.Service.DataObjectReview
{
    public static class Extensions
    {
        public static IServiceCollection AddDataObjectReviewServices(this IServiceCollection services)
        {
            services.AddScoped<ReviewEvaluationHelperFactory<ReviewEvaluationType, IReviewEvaluationHelper>>()
                    .AddScoped<IDataObjectReviewService, DataObjectReviewService>();

            HashSet<Type> registeredReviewEvaluationHelpers = new HashSet<Type>();
            services.AddMyTransientTypes(config => config.RegisterFromAssemblyContaining(typeof(Cite.EvalIt.AssemblyHandle)).RegisterTarget(typeof(IReviewEvaluationHelper)), pair => { registeredReviewEvaluationHelpers.Add(pair.ImplementationType); });

            services.Configure<ReviewEvaluationHelperFactory<ReviewEvaluationType, IReviewEvaluationHelper>.ReviewEvaluationHelperFactoryConfig>(x =>
            {
                x.Add(ReviewEvaluationType.AbsoluteDecimalEvaluation, typeof(AbsoluteDecimalEvaluationHelper));
                x.Add(ReviewEvaluationType.AbsoluteIntegerEvaluation, typeof(AbsoluteIntegerEvaluationHelper));
                x.Add(ReviewEvaluationType.PercentageEvaluation, typeof(PercentageEvaluationHelper));
                x.Add(ReviewEvaluationType.ScaleEvaluation, typeof(ScaleEvaluationHelper));
                x.Add(ReviewEvaluationType.SelectionEvaluation, typeof(SelectionEvaluationHelper));
                x.Add(ReviewEvaluationType.TextEvaluation, typeof(TextEvaluationHelper));
            });

            return services;
        }
    }
}
