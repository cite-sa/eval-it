using Cite.EvalIt.Convention;
using Cite.Tools.Data.Builder;
using Cite.Tools.FieldSet;
using Cite.Tools.Logging;
using Cite.Tools.Logging.Extensions;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Cite.EvalIt.Model
{
    public class DataObjectTypeRankingMethodologyBuilder : Builder<DataObjectTypeRankingMethodology, Data.DataObjectTypeRankingMethodology>
    {
        public DataObjectTypeRankingMethodologyBuilder(
            BuilderFactory builderFactory,
            IConventionService conventionService,
            ILogger<DataObjectTypeRankingMethodologyBuilder> logger) : base(conventionService, logger)
        {
            _builderFactory = builderFactory;
        }

        private readonly BuilderFactory _builderFactory;

        public async override Task<List<DataObjectTypeRankingMethodology>> Build(IFieldSet fields, IEnumerable<Data.DataObjectTypeRankingMethodology> datas)
        {
            this._logger.Debug("building for {count} items requesting {fields} fields", datas?.Count(), fields?.Fields?.Count);
            this._logger.Trace(new DataLogEntry("requested fields", fields));
            if (fields == null || fields.IsEmpty()) return Enumerable.Empty<DataObjectTypeRankingMethodology>().ToList();

            if (fields.HasField("AllMethodology")) fields = fields.Merge(this.GetAllMethodology());

            IFieldSet methodologyFields = fields.ExtractPrefixed(this.AsPrefix(nameof(BaseRankingProfile)));

            List<DataObjectTypeRankingMethodology> models = new List<DataObjectTypeRankingMethodology>();
            foreach (Data.DataObjectTypeRankingMethodology d in datas)
            {
                DataObjectTypeRankingMethodology m = new DataObjectTypeRankingMethodology();
                if (fields.HasField(this.AsIndexer(nameof(DataObjectTypeRankingMethodology.Hash)))) m.Hash = this.HashValue(d.UpdatedAt);
                if (fields.HasField(this.AsIndexer(nameof(DataObjectTypeRankingMethodology.Id)))) m.Id = d.Id;
                if (fields.HasField(this.AsIndexer(nameof(DataObjectTypeRankingMethodology.Name)))) m.Name = d.Name;
                if (fields.HasField(this.AsIndexer(nameof(DataObjectTypeRankingMethodology.IsActive)))) m.IsActive = d.IsActive;
                if (fields.HasField(this.AsIndexer(nameof(DataObjectTypeRankingMethodology.CreatedAt)))) m.CreatedAt = d.CreatedAt;
                if (fields.HasField(this.AsIndexer(nameof(DataObjectTypeRankingMethodology.UpdatedAt)))) m.UpdatedAt = d.UpdatedAt;

                if (!methodologyFields.IsEmpty() && d.Config?.RankingProfiles != null)
                {
                    m.Config = new RankingConfiguration()
                    {
                        RankingProfiles = new List<BaseRankingProfile>()
                    };

                    foreach (var x in d.Config.RankingProfiles)
                    {
                        m.Config.RankingProfiles.Add(await this._builderFactory.Builder<BaseRankingProfileBuilder>().Build(methodologyFields, x));
                    }
                }

                models.Add(m);
            }
            this._logger.Debug("build {count} items", models?.Count);
            return models;
        }

        protected IFieldSet GetAllMethodology()
        {
            IEnumerable<string> fieldStrings = new List<string>();

            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(DataObjectTypeRankingMethodology.Hash)));
            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(DataObjectTypeRankingMethodology.Id)));
            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(DataObjectTypeRankingMethodology.Name)));
            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(DataObjectTypeRankingMethodology.IsActive)));
            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(DataObjectTypeRankingMethodology.CreatedAt)));
            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(DataObjectTypeRankingMethodology.UpdatedAt)));

            return new FieldSet(fieldStrings);
        }
    }
}
