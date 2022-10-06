using Cite.EvalIt.Convention;
using Cite.Tools.Common.Extensions;
using Cite.Tools.Data.Builder;
using Cite.Tools.Data.Query;
using Cite.Tools.FieldSet;
using Cite.Tools.Logging;
using Cite.Tools.Logging.Extensions;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Cite.EvalIt.Model
{
	public abstract class Builder<M, D> : IBuilder where D : class
	{
		public Builder(
			IConventionService conventionService,
			ILogger logger)
		{
			this._conventionService = conventionService;
			this._logger = logger;
		}

		protected readonly IConventionService _conventionService;
		protected readonly ILogger _logger;

		public async Task<M> Build(IFieldSet directives, D data)
		{
			if (data == null)
			{
				this._logger.Debug(new MapLogEntry("requested build for null item requesting fields").And("fields", directives));
				return default(M);
			}
			List<M> models = await this.Build(directives, new D[] { data });
			return models.FirstOrDefault();
		}

		public abstract Task<List<M>> Build(IFieldSet directives, IEnumerable<D> datas);

		public async Task<Dictionary<K, M>> AsForeignKey<K>(Query<D> query, IFieldSet directives, Func<M, K> keySelector)
		{
			this._logger.Trace("Building references from query");
			List<D> datas = await query.CollectAsAsync(directives);
			this._logger.Debug("collected {count} items to build", datas?.Count);
			return await this.AsForeignKey(datas, directives, keySelector);
		}

		public async Task<Dictionary<K, M>> AsForeignKey<K>(IEnumerable<D> datas, IFieldSet directives, Func<M, K> keySelector)
		{
			this._logger.Trace("building references");
			List<M> models = await this.Build(directives, datas);
			this._logger.Debug("mapping {count} build items from {countdata} requested", models?.Count, datas?.Count());
			Dictionary<K, M> map = models.ToDictionary(keySelector);
			return map;
		}

		public async Task<Dictionary<K, List<M>>> AsMasterKey<K>(Query<D> query, IFieldSet directives, Func<M, K> keySelector)
		{
			this._logger.Trace("Building details from query");
			List<D> datas = await query.CollectAsAsync(directives);
			this._logger.Debug("collected {count} items to build", datas?.Count);
			return await this.AsMasterKey(datas, directives, keySelector);
		}

		public async Task<Dictionary<K, List<M>>> AsMasterKey<K>(IEnumerable<D> datas, IFieldSet directives, Func<M, K> keySelector)
		{
			this._logger.Trace("building details");
			List<M> models = await this.Build(directives, datas);
			this._logger.Debug("mapping {count} build items from {countdata} requested", models?.Count, datas?.Count());
			Dictionary<K, List<M>> map = new Dictionary<K, List<M>>();
			foreach (M model in models)
			{
				K key = keySelector.Invoke(model);
				if (!map.ContainsKey(key)) map.Add(key, new List<M>());
				map[key].Add(model);
			}
			return map;
		}

		public Dictionary<FK, FM> AsEmpty<FK, FM>(IEnumerable<FK> keys, Func<FK, FM> mapper, Func<FM, FK> keySelector)
		{
			this._logger.Trace("building static references");
			IEnumerable<FM> models = keys.Select(mapper);
			this._logger.Debug("mapping {count} build items from {countdata} requested", models?.Count(), keys?.Count());
			Dictionary<FK, FM> map = models.ToDictionary(keySelector);
			return map;
		}

		protected String HashValue(DateTime value)
		{
			return this._conventionService.HashValue(value);
		}

		protected String AsPrefix(String name)
		{
			return name.AsIndexerPrefix();
		}

		protected String AsIndexer(params String[] names)
		{
			return names.AsIndexer();
		}
	}
}
