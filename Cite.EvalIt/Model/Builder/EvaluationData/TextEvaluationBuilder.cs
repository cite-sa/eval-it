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
    public class TextEvaluationBuilder : Builder<ReviewEvaluation, Data.ReviewEvaluation>
    {
        public TextEvaluationBuilder(
            IConventionService conventionService,
            ILogger<DataObjectBuilder> logger) : base(conventionService, logger)
        { }

        public override Task<List<ReviewEvaluation>> Build(IFieldSet fields, IEnumerable<Data.ReviewEvaluation> datas)
        {
            this._logger.Debug("building for {count} items requesting {fields} fields", datas?.Count(), fields?.Fields?.Count);
            this._logger.Trace(new DataLogEntry("requested fields", fields));
            if (fields == null || fields.IsEmpty()) return Task.FromResult(Enumerable.Empty<ReviewEvaluation>().ToList());

            List<ReviewEvaluation> models = new List<ReviewEvaluation>();
            foreach (Data.TextEvaluation d in datas)
            {
                TextEvaluation m = new TextEvaluation();
                if (fields.HasField(this.AsIndexer(nameof(TextEvaluation.Values)))) m.Values = d.Values;

                models.Add(m);
            }
            this._logger.Debug("build {count} items", models?.Count);
            return Task.FromResult(models);
        }
    }
}
