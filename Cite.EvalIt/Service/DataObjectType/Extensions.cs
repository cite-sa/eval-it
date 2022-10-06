using Cite.EvalIt.Common;
using Cite.EvalIt.Service.DataObjectType.BaseObjectRankRecalculationStrategyHelper;
using Cite.EvalIt.Service.DataObjectType.EvaluationOptionHelper;
using Cite.EvalIt.Service.DataObjectType.RankingProfileHelper;
using Cite.EvalIt.Service.DataObjectType.RegistrationInformationInputOptionHelper;
using Cite.Tools.DI.Extensions;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.Service.DataObjectType
{
    public static class Extensions
    {
        public static IServiceCollection AddDataObjectTypeServices(this IServiceCollection services)
        {
            services.AddScoped<RegistrationInformationInputOptionHelperFactory<RegistrationInformationType, IRegistrationInformationInputOptionHelper>>()
                    .AddScoped<EvaluationOptionHelperFactory<EvaluationConfigurationType, IBaseEvaluationOptionHelper>>()
                    .AddScoped<RankingProfileHelperFactory<RankingProfileType, IBaseRankingProfileHelper>>()
                    .AddScoped<BaseObjectRankRecalculationStrategyHelperFactory<ObjectRankRecalculationStrategyType, IBaseObjectRankRecalculationStrategyHelper>>()
                    .AddScoped<IDataObjectTypeService, DataObjectTypeService>();

            HashSet<Type> registeredRegistrationInformationInputOptionHelpers = new HashSet<Type>();
            services.AddMyTransientTypes(config => config.RegisterFromAssemblyContaining(typeof(Cite.EvalIt.AssemblyHandle)).RegisterTarget(typeof(IRegistrationInformationInputOptionHelper)), pair => { registeredRegistrationInformationInputOptionHelpers.Add(pair.ImplementationType); });

            HashSet<Type> registeredEvaluationOptionHelpers = new HashSet<Type>();
            services.AddMyTransientTypes(config => config.RegisterFromAssemblyContaining(typeof(Cite.EvalIt.AssemblyHandle)).RegisterTarget(typeof(IBaseEvaluationOptionHelper)), pair => { registeredEvaluationOptionHelpers.Add(pair.ImplementationType); });

            HashSet<Type> registeredRankingProfileHelpers = new HashSet<Type>();
            services.AddMyTransientTypes(config => config.RegisterFromAssemblyContaining(typeof(Cite.EvalIt.AssemblyHandle)).RegisterTarget(typeof(IBaseRankingProfileHelper)), pair => { registeredRankingProfileHelpers.Add(pair.ImplementationType); });

            HashSet<Type> registeredObjectRankRecalculationStrategyHelpers = new HashSet<Type>();
            services.AddMyTransientTypes(config => config.RegisterFromAssemblyContaining(typeof(Cite.EvalIt.AssemblyHandle)).RegisterTarget(typeof(IBaseObjectRankRecalculationStrategyHelper)), pair => { registeredObjectRankRecalculationStrategyHelpers.Add(pair.ImplementationType); });


            services.Configure<RegistrationInformationInputOptionHelperFactory<RegistrationInformationType, IRegistrationInformationInputOptionHelper>.RegistrationInformationInputOptionHelperFactoryConfig > (x =>
            {
                x.Add(RegistrationInformationType.AbsoluteDecimalInputOption, typeof(AbsoluteDecimalInputOptionHelper));
                x.Add(RegistrationInformationType.AbsoluteIntegerInputOption, typeof(AbsoluteIntegerInputOptionHelper));
                x.Add(RegistrationInformationType.PercentageInputOption, typeof(PercentageInputOptionHelper));
                x.Add(RegistrationInformationType.ScaleInputOption, typeof(ScaleInputOptionHelper));
                x.Add(RegistrationInformationType.SelectionInputOption, typeof(SelectionInputOptionHelper));
                x.Add(RegistrationInformationType.TextInputOption, typeof(TextInputOptionHelper));
            });

            services.Configure<EvaluationOptionHelperFactory<EvaluationConfigurationType, IBaseEvaluationOptionHelper>.EvaluationOptionHelperFactoryConfig>(x =>
            {
                x.Add(EvaluationConfigurationType.AbsoluteDecimalEvaluationOption, typeof(AbsoluteDecimalEvaluationOptionHelper));
                x.Add(EvaluationConfigurationType.AbsoluteIntegerEvaluationOption, typeof(AbsoluteIntegerEvaluationOptionHelper));
                x.Add(EvaluationConfigurationType.PercentageEvaluationOption, typeof(PercentageEvaluationOptionHelper));
                x.Add(EvaluationConfigurationType.ScaleEvaluationOption, typeof(ScaleEvaluationOptionHelper));
                x.Add(EvaluationConfigurationType.SelectionEvaluationOption, typeof(SelectionEvaluationOptionHelper));
                x.Add(EvaluationConfigurationType.TextEvaluationOption, typeof(TextEvaluationOptionHelper));
            });

            services.Configure<RankingProfileHelperFactory<RankingProfileType, IBaseRankingProfileHelper>.RankingProfileHelperFactoryConfig>(x =>
            {
                x.Add(RankingProfileType.AbsoluteDecimalRankingProfile, typeof(AbsoluteDecimalRankingProfileHelper));
                x.Add(RankingProfileType.AbsoluteIntegerRankingProfile, typeof(AbsoluteIntegerRankingProfileHelper));
                x.Add(RankingProfileType.PercentageRankingProfile, typeof(PercentageRankingProfileHelper));
                x.Add(RankingProfileType.ScaleRankingProfile, typeof(ScaleRankingProfileHelper));
                x.Add(RankingProfileType.SelectionRankingProfile, typeof(SelectionRankingProfileHelper));
            });

            services.Configure<BaseObjectRankRecalculationStrategyHelperFactory<ObjectRankRecalculationStrategyType, IBaseObjectRankRecalculationStrategyHelper>.BaseObjectRankRecalculationStrategyHelperFactoryConfig>(x =>
            {
                x.Add(ObjectRankRecalculationStrategyType.AllEqual, typeof(AllEqualObjectRankRecalculationStrategyHelper));
                x.Add(ObjectRankRecalculationStrategyType.Liked, typeof(LikedObjectRankRecalculationStrategyHelper));
                x.Add(ObjectRankRecalculationStrategyType.NetworkPopularity, typeof(NetworkPopularityObjectRankRecalculationStrategyHelper));
                x.Add(ObjectRankRecalculationStrategyType.NetworkTrust, typeof(NetworkTrustObjectRankRecalculationStrategyHelper));
                x.Add(ObjectRankRecalculationStrategyType.ReviewDisciplineVisibility, typeof(ReviewDisciplineVisibilityObjectRankRecalculationStrategyHelper));
                x.Add(ObjectRankRecalculationStrategyType.AuthorDisciplineVisibility, typeof(AuthorDisciplineVisibilityObjectRankRecalculationStrategyHelper));
                x.Add(ObjectRankRecalculationStrategyType.AuthorActivity, typeof(AuthorActivityObjectRankRecalculationStrategyHelper));
            });

            return services;
        }
    }
}
