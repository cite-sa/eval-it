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
    public class AbsoluteDecimalEvaluationOptionBuilder : Builder<BaseEvaluationOption, Data.BaseEvaluationOption>
    {
        public AbsoluteDecimalEvaluationOptionBuilder(
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
            foreach (Data.AbsoluteDecimalEvaluationOption d in datas)
            {
                AbsoluteDecimalEvaluationOption m = new AbsoluteDecimalEvaluationOption();
                if (fields.HasField(this.AsIndexer(nameof(AbsoluteDecimalEvaluationOption.MeasurementUnit)))) m.MeasurementUnit = d.MeasurementUnit;
                if (fields.HasField(this.AsIndexer(nameof(AbsoluteDecimalEvaluationOption.UpperBound)))) m.UpperBound = d.UpperBound;
                if (fields.HasField(this.AsIndexer(nameof(AbsoluteDecimalEvaluationOption.LowerBound)))) m.LowerBound = d.LowerBound;

                models.Add(m);
            }
            this._logger.Debug("build {count} items", models?.Count);
            return Task.FromResult(models);
        }

        protected IFieldSet GetAllEvaluation()
        {
            IEnumerable<string> fieldStrings = new List<string>();

            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(AbsoluteDecimalEvaluationOption.MeasurementUnit)));
            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(AbsoluteDecimalEvaluationOption.UpperBound)));
            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(AbsoluteDecimalEvaluationOption.LowerBound)));

            return new FieldSet(fieldStrings);
        }
    }
}
