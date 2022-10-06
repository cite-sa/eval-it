using Cite.EvalIt.Common;
using Cite.EvalIt.Convention;
using Cite.EvalIt.Query;
using Cite.EvalIt.Service.DataObjectType.RegistrationInformationInputOptionHelper;
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
    public class NetworkTrustObjectRankRecalculationStrategyBuilder : Builder<BaseObjectRankRecalculationStrategy, Data.BaseObjectRankRecalculationStrategy>
    {
        public NetworkTrustObjectRankRecalculationStrategyBuilder(
            IConventionService conventionService,
            ILogger<NetworkTrustObjectRankRecalculationStrategyBuilder> logger) : base(conventionService, logger)
        { }

        public override Task<List<BaseObjectRankRecalculationStrategy>> Build(IFieldSet fields, IEnumerable<Data.BaseObjectRankRecalculationStrategy> datas)
        {
            this._logger.Debug("building for {count} items requesting {fields} fields", datas?.Count(), fields?.Fields?.Count);
            this._logger.Trace(new DataLogEntry("requested fields", fields));
            if (fields == null || fields.IsEmpty()) return Task.FromResult(Enumerable.Empty<BaseObjectRankRecalculationStrategy>().ToList());

            if (fields.HasField("AllStrategy")) fields = fields.Merge(this.GetAllStrategy());

            List<BaseObjectRankRecalculationStrategy> models = new List<BaseObjectRankRecalculationStrategy>();
            foreach (Data.NetworkTrustObjectRankRecalculationStrategy d in datas)
            {
                NetworkTrustObjectRankRecalculationStrategy m = new NetworkTrustObjectRankRecalculationStrategy();
                if (fields.HasField(this.AsIndexer(nameof(NetworkTrustObjectRankRecalculationStrategy.NetworkTrustPartition)))) m.NetworkTrustPartition = d.NetworkTrustPartition;

                models.Add(m);
            }
            this._logger.Debug("build {count} items", models?.Count);
            return Task.FromResult(models);
        }

        protected IFieldSet GetAllStrategy()
        {
            IEnumerable<string> fieldStrings = new List<string>();

            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(NetworkTrustObjectRankRecalculationStrategy.NetworkTrustPartition)));

            return new FieldSet(fieldStrings);
        }
    }
}
