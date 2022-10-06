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
    public class AbsoluteDecimalRankingProfileBuilder : Builder<BaseRankingProfile, Data.BaseRankingProfile>
    {
        public AbsoluteDecimalRankingProfileBuilder(
            IConventionService conventionService,
            ILogger<AbsoluteDecimalRankingProfileBuilder> logger) : base(conventionService, logger)
        { }

        public override Task<List<BaseRankingProfile>> Build(IFieldSet fields, IEnumerable<Data.BaseRankingProfile> datas)
        {
            this._logger.Debug("building for {count} items requesting {fields} fields", datas?.Count(), fields?.Fields?.Count);
            this._logger.Trace(new DataLogEntry("requested fields", fields));
            if (fields == null || fields.IsEmpty()) return Task.FromResult(Enumerable.Empty<BaseRankingProfile>().ToList());

            if (fields.HasField("AllProfile")) fields = fields.Merge(this.GetAllProfile());

            List<BaseRankingProfile> models = new List<BaseRankingProfile>();
            foreach (Data.AbsoluteDecimalRankingProfile d in datas)
            {
                AbsoluteDecimalRankingProfile m = new AbsoluteDecimalRankingProfile();
                if (fields.HasField(this.AsIndexer(nameof(AbsoluteDecimalRankingProfile.MappedRangeBounds)))) m.MappedRangeBounds = d.MappedRangeBounds;

                models.Add(m);
            }
            this._logger.Debug("build {count} items", models?.Count);
            return Task.FromResult(models);
        }

        protected IFieldSet GetAllProfile()
        {
            IEnumerable<string> fieldStrings = new List<string>();

            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(AbsoluteDecimalRankingProfile.MappedRangeBounds)));

            return new FieldSet(fieldStrings);
        }
    }
}
