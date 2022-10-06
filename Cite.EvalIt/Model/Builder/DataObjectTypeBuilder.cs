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
    public class DataObjectTypeBuilder : Builder<DataObjectType, Data.DataObjectType>
    {
        public DataObjectTypeBuilder(
            BuilderFactory builderFactory,
            IConventionService conventionService,
            ILogger<DataObjectBuilder> logger) : base(conventionService, logger)
        {
            _builderFactory = builderFactory;
        }

        private readonly BuilderFactory _builderFactory;

        public async override Task<List<DataObjectType>> Build(IFieldSet fields, IEnumerable<Data.DataObjectType> datas)
        {
            this._logger.Debug("building for {count} items requesting {fields} fields", datas?.Count(), fields?.Fields?.Count);
            this._logger.Trace(new DataLogEntry("requested fields", fields));
            if (fields == null || fields.IsEmpty()) return Enumerable.Empty<DataObjectType>().ToList();

            IFieldSet infoFields = fields.ExtractPrefixed(this.AsPrefix(nameof(RegistrationInformation)));
            IFieldSet configFields = fields.ExtractPrefixed(this.AsPrefix(nameof(EvaluationConfiguration)));
            IFieldSet rankingFields = fields.ExtractPrefixed(this.AsPrefix(nameof(DataObjectTypeRankingMethodology)));
            IFieldSet strategyFields = fields.ExtractPrefixed(this.AsPrefix(nameof(ObjectRankRecalculationStrategyConfiguration)));

            List<DataObjectType> models = new List<DataObjectType>();
            foreach (Data.DataObjectType d in datas)
            {
                DataObjectType m = new DataObjectType();
                if (fields.HasField(this.AsIndexer(nameof(DataObjectType.Hash)))) m.Hash = this.HashValue(d.UpdatedAt);
                if (fields.HasField(this.AsIndexer(nameof(DataObjectType.Id)))) m.Id = d.Id;
                if (fields.HasField(this.AsIndexer(nameof(DataObjectType.Name)))) m.Name = d.Name;
                if (fields.HasField(this.AsIndexer(nameof(DataObjectType.SelectedRankingMethodologyId)))) m.SelectedRankingMethodologyId = d.SelectedRankingMethodologyId;
                if (fields.HasField(this.AsIndexer(nameof(DataObjectType.MultipleReviewOption)))) m.MultipleReviewOption = d.MultipleReviewOption;
                if (fields.HasField(this.AsIndexer(nameof(DataObjectType.IsActive)))) m.IsActive = d.IsActive;
                if (fields.HasField(this.AsIndexer(nameof(DataObjectType.CreatedAt)))) m.CreatedAt = d.CreatedAt;
                if (fields.HasField(this.AsIndexer(nameof(DataObjectType.UpdatedAt)))) m.UpdatedAt = d.UpdatedAt;

                if (!infoFields.IsEmpty() && d.Info?.InputOptions != null)
                {
                    m.Info = new RegistrationInformation()
                    {
                        InputOptions = new List<RegistrationInformationInputOption>()
                    };

                    foreach (var x in d.Info.InputOptions)
                    {
                        m.Info.InputOptions.Add(await this._builderFactory.Builder<RegistrationInformationInputOptionBuilder>().Build(infoFields, x));
                    }
                }

                if (!configFields.IsEmpty() && d.Config?.EvalOptions != null)
                {
                    m.Config = new EvaluationConfiguration()
                    {
                        EvalOptions = new List<BaseEvaluationOption>()
                    }; 

                    foreach (var x in d.Config.EvalOptions)
                    {
                        m.Config.EvalOptions.Add(await this._builderFactory.Builder<BaseEvaluationOptionBuilder>().Build(configFields, x));
                    }    
                }

                if (!rankingFields.IsEmpty() && d.RankingMethodologies != null)
                {
                    m.RankingMethodologies = await this._builderFactory.Builder<DataObjectTypeRankingMethodologyBuilder>().Build(rankingFields, d.RankingMethodologies);
                }

                if (!strategyFields.IsEmpty() && d.StrategyConfig?.Strategies != null)
                {
                    m.StrategyConfig = new ObjectRankRecalculationStrategyConfiguration()
                    {
                        Strategies = new List<BaseObjectRankRecalculationStrategy>()
                    };

                    foreach( var x in d.StrategyConfig.Strategies)
                    {
                        m.StrategyConfig.Strategies.Add(await this._builderFactory.Builder<BaseObjectRankRecalculationStrategyBuilder>().Build(strategyFields, x));
                    }
                }

                models.Add(m);
            }
            this._logger.Debug("build {count} items", models?.Count);
            return models;
        }
    }
}
