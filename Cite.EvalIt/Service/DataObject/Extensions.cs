using Cite.EvalIt.Common;
using Cite.EvalIt.Service.DataObjectType.DataObjectAttributeHelper;
using Cite.Tools.DI.Extensions;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;

namespace Cite.EvalIt.Service.DataObject
{
    public static class Extensions
    {
        public static IServiceCollection AddDataObjectServices(this IServiceCollection services)
        {
            services.AddScoped<DataObjectAttributeHelperFactory<DataObjectAttributeType, IDataObjectAttributeHelper>>()
                    .AddScoped<IDataObjectService, DataObjectService>();

            HashSet<Type> registeredDataObjectAttributeHelpers = new HashSet<Type>();
            services.AddMyTransientTypes(config => config.RegisterFromAssemblyContaining(typeof(Cite.EvalIt.AssemblyHandle)).RegisterTarget(typeof(IDataObjectAttributeHelper)), pair => { registeredDataObjectAttributeHelpers.Add(pair.ImplementationType); });

            services.Configure<DataObjectAttributeHelperFactory<DataObjectAttributeType, IDataObjectAttributeHelper>.DataObjectAttributeHelperFactoryConfig> (x =>
            {
                x.Add(DataObjectAttributeType.AbsoluteDecimalAttribute, typeof(AbsoluteDecimalAttributeHelper));
                x.Add(DataObjectAttributeType.AbsoluteIntegerAttribute, typeof(AbsoluteIntegerAttributeHelper));
                x.Add(DataObjectAttributeType.PercentageAttribute, typeof(PercentageAttributeHelper));
                x.Add(DataObjectAttributeType.ScaleAttribute, typeof(ScaleAttributeHelper));
                x.Add(DataObjectAttributeType.SelectionAttribute, typeof(SelectionAttributeHelper));
                x.Add(DataObjectAttributeType.TextAttribute, typeof(TextAttributeHelper));
            });

            return services;
        }
    }
}
