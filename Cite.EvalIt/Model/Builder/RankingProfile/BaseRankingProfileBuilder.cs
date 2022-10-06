using Cite.EvalIt.Common;
using Cite.EvalIt.Convention;
using Cite.EvalIt.Service.DataObjectType.RankingProfileHelper;
using Cite.Tools.FieldSet;
using Cite.Tools.Logging;
using Cite.Tools.Logging.Extensions;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Cite.EvalIt.Model
{
    public class BaseRankingProfileBuilder : Builder<BaseRankingProfile, Data.BaseRankingProfile>
    {
        private readonly RankingProfileHelperFactory<RankingProfileType, IBaseRankingProfileHelper> _rankingProfileHelperFactory;

        public BaseRankingProfileBuilder(
            IConventionService conventionService,
            RankingProfileHelperFactory<RankingProfileType, IBaseRankingProfileHelper> rankingProfileHelperFactory,
            ILogger<DataObjectBuilder> logger) : base(conventionService, logger)
        {
            this._rankingProfileHelperFactory = rankingProfileHelperFactory;
        }

        public async override Task<List<BaseRankingProfile>> Build(IFieldSet fields, IEnumerable<Data.BaseRankingProfile> datas)
        {
            this._logger.Debug("building for {count} items requesting {fields} fields", datas?.Count(), fields?.Fields?.Count);
            this._logger.Trace(new DataLogEntry("requested fields", fields));
            if (fields == null || fields.IsEmpty()) return Enumerable.Empty<BaseRankingProfile>().ToList();

            if (fields.HasField("AllProfile")) fields = fields.Merge(this.GetAllProfile());

            List<BaseRankingProfile> models = new List<BaseRankingProfile>();
            foreach (Data.BaseRankingProfile d in datas)
            {
                BaseRankingProfile m = await this._rankingProfileHelperFactory.ChildClass(d.ProfileType).Build(fields, d);

                if (fields.HasField(this.AsIndexer(nameof(BaseRankingProfile.OptionId)))) m.OptionId = d.OptionId;
                if (fields.HasField(this.AsIndexer(nameof(BaseRankingProfile.ProfileType)))) m.ProfileType = d.ProfileType;
                if (fields.HasField(this.AsIndexer(nameof(BaseRankingProfile.OptionWeight)))) m.OptionWeight = d.OptionWeight;
                if (fields.HasField(this.AsIndexer(nameof(BaseRankingProfile.MappedUserValues)))) m.MappedUserValues = d.MappedUserValues;
                if (fields.HasField(this.AsIndexer(nameof(BaseRankingProfile.IsActive)))) m.IsActive = d.IsActive;
                if (fields.HasField(this.AsIndexer(nameof(BaseRankingProfile.MappedNormalizedValues)))) m.MappedNormalizedValues = this._rankingProfileHelperFactory.ChildClass(d.ProfileType).NormalizeMappedValues(d);

                models.Add(m);
            }
            this._logger.Debug("build {count} items", models?.Count);
            return models;
        }

        protected IFieldSet GetAllProfile()
        {
            IEnumerable<string> fieldStrings = new List<string>();

            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(BaseRankingProfile.OptionId)));
            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(BaseRankingProfile.ProfileType)));
            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(BaseRankingProfile.OptionWeight)));
            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(BaseRankingProfile.MappedUserValues)));
            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(BaseRankingProfile.IsActive)));
            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(BaseRankingProfile.MappedNormalizedValues)));

            return new FieldSet(fieldStrings);
        }
    }
}
