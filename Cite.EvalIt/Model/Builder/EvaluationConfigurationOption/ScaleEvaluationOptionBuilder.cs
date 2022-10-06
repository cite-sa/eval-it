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
    public class ScaleEvaluationOptionBuilder : Builder<BaseEvaluationOption, Data.BaseEvaluationOption>
    {
        public ScaleEvaluationOptionBuilder(
            IConventionService conventionService,
            ILogger<DataObjectBuilder> logger) : base(conventionService, logger)
        { }

        public override Task<List<BaseEvaluationOption>> Build(IFieldSet fields, IEnumerable<Data.BaseEvaluationOption> datas)
        {
            this._logger.Debug("building for {count} items requesting {fields} fields", datas?.Count(), fields?.Fields?.Count);
            this._logger.Trace(new DataLogEntry("requested fields", fields));
            if (fields == null || fields.IsEmpty()) return Task.FromResult(Enumerable.Empty<BaseEvaluationOption>().ToList());

            if (fields.HasField("AllEvaluation")) fields = fields.Merge(this.GetAllEvaluation());

            List<BaseEvaluationOption> models = new List<BaseEvaluationOption>();
            foreach (Data.ScaleEvaluationOption d in datas)
            {
                ScaleEvaluationOption m = new ScaleEvaluationOption();
                if (fields.HasField(this.AsIndexer(nameof(ScaleEvaluationOption.EvaluationScale)))) m.EvaluationScale = d.EvaluationScale;
                if (fields.HasField(this.AsIndexer(nameof(ScaleEvaluationOption.ScaleDisplayOption)))) m.ScaleDisplayOption = d.ScaleDisplayOption;

                models.Add(m);
            }
            this._logger.Debug("build {count} items", models?.Count);
            return Task.FromResult(models);
        }

        protected IFieldSet GetAllEvaluation()
        {
            IEnumerable<string> fieldStrings = new List<string>();

            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(ScaleEvaluationOption.EvaluationScale)));
            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(ScaleEvaluationOption.ScaleDisplayOption)));

            return new FieldSet(fieldStrings);
        }
    }
}
