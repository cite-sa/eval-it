using Cite.EvalIt.Convention;
using Cite.EvalIt.Query;
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
	public class UserProfileBuilder : Builder<UserProfile, Data.UserProfile>
	{
		private readonly QueryFactory _queryFactory;
		private readonly BuilderFactory _builderFactory;

		public UserProfileBuilder(
			QueryFactory queryFactory,
			IConventionService conventionService,
			BuilderFactory builderFactory,
			ILogger<UserProfileBuilder> logger) : base(conventionService, logger)
		{
			this._queryFactory = queryFactory;
			this._builderFactory = builderFactory;
		}

		public override Task<List<UserProfile>> Build(IFieldSet fields, IEnumerable<Data.UserProfile> datas)
		{
			this._logger.Debug("building for {count} items requesting {fields} fields", datas?.Count(), fields?.Fields?.Count);
			this._logger.Trace(new DataLogEntry("requested fields", fields));
			if (fields == null || fields.IsEmpty()) return Task.FromResult(Enumerable.Empty<UserProfile>().ToList());

			List<UserProfile> models = new List<UserProfile>();
			foreach (Data.UserProfile d in datas)
			{
				UserProfile m = new UserProfile();
				if (fields.HasField(this.AsIndexer(nameof(UserProfile.Timezone)))) m.Timezone = d.Timezone;
				if (fields.HasField(this.AsIndexer(nameof(UserProfile.Culture)))) m.Culture = d.Culture;
				if (fields.HasField(this.AsIndexer(nameof(UserProfile.Language)))) m.Language = d.Language;
				models.Add(m);
			}
			this._logger.Debug("build {count} items", models?.Count);
			return Task.FromResult(models);
		}
	}
}
