using Cite.EvalIt.ErrorCode;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
 
namespace Cite.EvalIt.Service.DataObjectType.RegistrationInformationInputOptionHelper
{
    public class RegistrationInformationInputOptionHelperFactory<T, IT> where T : struct, IConvertible /*enum constraint*/
                                                                        where IT : class
    {
        public class RegistrationInformationInputOptionHelperFactoryConfig
        {
            public Dictionary<T, Type> Accessors { get; } = new Dictionary<T, Type>();

            public RegistrationInformationInputOptionHelperFactoryConfig Add(T key, Type type)
            {
                this.Accessors[key] = type;
                return this;
            }
        }

        private IServiceProvider _serviceProvider;
        private Dictionary<T, Func<IT>> _accessorsMap = null;
        private readonly ErrorThesaurus _errors;

        public RegistrationInformationInputOptionHelperFactory(IServiceProvider serviceProvider, Microsoft.Extensions.Options.IOptions<RegistrationInformationInputOptionHelperFactoryConfig> config, ErrorThesaurus errors)
        {
            this._serviceProvider = serviceProvider;
            this._errors = errors;

            this._accessorsMap = new Dictionary<T, Func<IT>>();
            foreach (KeyValuePair<T, Type> pair in config?.Value?.Accessors)
            {
                this._accessorsMap.Add(pair.Key, () =>
                {
                    IT obj = this._serviceProvider.GetRequiredService(pair.Value) as IT;
                    return obj;
                });
            }
        }

        public IT ChildClass(T type)
        {
            if (this._accessorsMap.TryGetValue(type, out Func<IT> obj)) return obj();
            throw new ApplicationException("unrecognized type " + type.ToString());
        }

        public IEnumerable<T> RegisteredTypes()
        {
            return this._accessorsMap.Keys;
        }

        public IT this[T key]
        {
            get
            {
                Func<IT> obj = null;
                if (this._accessorsMap.TryGetValue(key, out obj)) return obj();
                throw new ApplicationException("unrecognized type " + key.ToString());
            }
        }
    }
}