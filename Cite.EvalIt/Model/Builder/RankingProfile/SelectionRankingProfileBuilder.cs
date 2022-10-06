using Cite.EvalIt.Convention;
using Cite.Tools.FieldSet;
using Cite.Tools.Logging;
using Cite.Tools.Logging.Extensions;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Cite.EvalIt.Model
{
    public class SelectionRankingProfileBuilder : Builder<BaseRankingProfile, Data.BaseRankingProfile>
    {
        public SelectionRankingProfileBuilder(
            IConventionService conventionService,
            ILogger<SelectionRankingProfileBuilder> logger) : base(conventionService, logger)
        { }

        public override Task<List<BaseRankingProfile>> Build(IFieldSet fields, IEnumerable<Data.BaseRankingProfile> datas)
        {
            this._logger.Debug("building for {count} items requesting {fields} fields", datas?.Count(), fields?.Fields?.Count);
            this._logger.Trace(new DataLogEntry("requested fields", fields));
            if (fields == null || fields.IsEmpty()) return Task.FromResult(Enumerable.Empty<BaseRankingProfile>().ToList());

            List<BaseRankingProfile> models = new List<BaseRankingProfile>();
            foreach (Data.SelectionRankingProfile d in datas)
            {
                SelectionRankingProfile m = new SelectionRankingProfile();

                models.Add(m);
            }
            this._logger.Debug("build {count} items", models?.Count);
            return Task.FromResult(models);
        }
    }
}
