using Cite.EvalIt.Common;
using Cite.EvalIt.Convention;
using Cite.EvalIt.Query;
using Cite.EvalIt.Service.DataObjectType.BaseObjectRankRecalculationStrategyHelper;
using Cite.EvalIt.Service.DataObjectType.DataObjectAttributeHelper;
using Cite.EvalIt.Service.DataObjectType.EvaluationOptionHelper;
using Cite.EvalIt.Service.DataObjectType.RegistrationInformationInputOptionHelper;
using Cite.EvalIt.Service.DataObjectType.ReviewEvaluationHelper;
using Cite.Tools.Data.Builder;
using Cite.Tools.Data.Query;
using Cite.Tools.FieldSet;
using Cite.Tools.Logging;
using Cite.Tools.Logging.Extensions;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Cite.EvalIt.Model
{
    public class BaseObjectRankRecalculationStrategyBuilder : Builder<BaseObjectRankRecalculationStrategy, Data.BaseObjectRankRecalculationStrategy>
    {
        private readonly BaseObjectRankRecalculationStrategyHelperFactory<ObjectRankRecalculationStrategyType, IBaseObjectRankRecalculationStrategyHelper> _baseObjectRankRecalculationStrategyHelperFactory;

        public BaseObjectRankRecalculationStrategyBuilder(
            IConventionService conventionService,
            BaseObjectRankRecalculationStrategyHelperFactory<ObjectRankRecalculationStrategyType, IBaseObjectRankRecalculationStrategyHelper> baseObjectRankRecalculationStrategyHelperFactory,
            ILogger<BaseObjectRankRecalculationStrategyBuilder> logger) : base(conventionService, logger)
        {
            this._baseObjectRankRecalculationStrategyHelperFactory = baseObjectRankRecalculationStrategyHelperFactory;
        }

        public async override Task<List<BaseObjectRankRecalculationStrategy>> Build(IFieldSet fields, IEnumerable<Data.BaseObjectRankRecalculationStrategy> datas)
        {
            this._logger.Debug("building for {count} items requesting {fields} fields", datas?.Count(), fields?.Fields?.Count);
            this._logger.Trace(new DataLogEntry("requested fields", fields));
            if (fields == null || fields.IsEmpty()) return Enumerable.Empty<BaseObjectRankRecalculationStrategy>().ToList();

            if (fields.HasField("AllStrategy")) fields = fields.Merge(this.GetAllStrategy());

            List<BaseObjectRankRecalculationStrategy> models = new List<BaseObjectRankRecalculationStrategy>();
            foreach (Data.BaseObjectRankRecalculationStrategy d in datas)
            {
                BaseObjectRankRecalculationStrategy m = await this._baseObjectRankRecalculationStrategyHelperFactory.ChildClass(d.StrategyType).Build(fields, d);

                if (fields.HasField(this.AsIndexer(nameof(BaseObjectRankRecalculationStrategy.Id)))) m.Id = d.Id;
                if (fields.HasField(this.AsIndexer(nameof(BaseObjectRankRecalculationStrategy.StrategyType)))) m.StrategyType = d.StrategyType;
                if (fields.HasField(this.AsIndexer(nameof(BaseObjectRankRecalculationStrategy.StrategyWeight)))) m.StrategyWeight = d.StrategyWeight;
                if (fields.HasField(this.AsIndexer(nameof(BaseObjectRankRecalculationStrategy.IsActive)))) m.IsActive = d.IsActive;

                models.Add(m);
            }
            this._logger.Debug("build {count} items", models?.Count);
            return models;
        }

        protected IFieldSet GetAllStrategy()
        {
            IEnumerable<string> fieldStrings = new List<string>();

            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(BaseObjectRankRecalculationStrategy.Id)));
            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(BaseObjectRankRecalculationStrategy.StrategyType)));
            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(BaseObjectRankRecalculationStrategy.StrategyWeight)));
            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(BaseObjectRankRecalculationStrategy.IsActive)));

            return new FieldSet(fieldStrings);
        }
    }
}
