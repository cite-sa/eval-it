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
    public class AuthorActivityObjectRankRecalculationStrategyBuilder : Builder<BaseObjectRankRecalculationStrategy, Data.BaseObjectRankRecalculationStrategy>
    {
        public AuthorActivityObjectRankRecalculationStrategyBuilder(
            IConventionService conventionService,
            ILogger<AuthorActivityObjectRankRecalculationStrategyBuilder> logger) : base(conventionService, logger)
        { }

        public override Task<List<BaseObjectRankRecalculationStrategy>> Build(IFieldSet fields, IEnumerable<Data.BaseObjectRankRecalculationStrategy> datas)
        {
            this._logger.Debug("building for {count} items requesting {fields} fields", datas?.Count(), fields?.Fields?.Count);
            this._logger.Trace(new DataLogEntry("requested fields", fields));
            if (fields == null || fields.IsEmpty()) return Task.FromResult(Enumerable.Empty<BaseObjectRankRecalculationStrategy>().ToList());

            if (fields.HasField("AllStrategy")) fields = fields.Merge(this.GetAllStrategy());

            List<BaseObjectRankRecalculationStrategy> models = new List<BaseObjectRankRecalculationStrategy>();
            foreach (Data.AuthorActivityObjectRankRecalculationStrategy d in datas)
            {
                AuthorActivityObjectRankRecalculationStrategy m = new AuthorActivityObjectRankRecalculationStrategy();
                if (fields.HasField(this.AsIndexer(nameof(AuthorActivityObjectRankRecalculationStrategy.TimeUnitCount)))) m.TimeUnitCount = d.TimeUnitCount;
                if (fields.HasField(this.AsIndexer(nameof(AuthorActivityObjectRankRecalculationStrategy.TimeUnit)))) m.TimeUnit = d.TimeUnit;

                if (fields.HasField(this.AsIndexer(nameof(AuthorActivityObjectRankRecalculationStrategy.AuthorObjectActivityPartition)))) m.AuthorObjectActivityPartition = d.AuthorObjectActivityPartition;
                if (fields.HasField(this.AsIndexer(nameof(AuthorActivityObjectRankRecalculationStrategy.AuthorReviewActivityPartition)))) m.AuthorReviewActivityPartition = d.AuthorReviewActivityPartition;

                models.Add(m);
            }
            this._logger.Debug("build {count} items", models?.Count);
            return Task.FromResult(models);
        }

        protected IFieldSet GetAllStrategy()
        {
            IEnumerable<string> fieldStrings = new List<string>();

            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(AuthorActivityObjectRankRecalculationStrategy.TimeUnitCount)));
            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(AuthorActivityObjectRankRecalculationStrategy.TimeUnit)));

            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(AuthorActivityObjectRankRecalculationStrategy.AuthorObjectActivityPartition)));
            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(AuthorActivityObjectRankRecalculationStrategy.AuthorReviewActivityPartition)));

            return new FieldSet(fieldStrings);
        }
    }
}
