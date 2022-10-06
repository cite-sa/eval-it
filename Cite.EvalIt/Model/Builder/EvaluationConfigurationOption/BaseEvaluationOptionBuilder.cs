using Cite.EvalIt.Common;
using Cite.EvalIt.Convention;
using Cite.EvalIt.Query;
using Cite.EvalIt.Service.DataObjectType.EvaluationOptionHelper;
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
    public class BaseEvaluationOptionBuilder : Builder<BaseEvaluationOption, Data.BaseEvaluationOption>
    {
        private readonly EvaluationOptionHelperFactory<EvaluationConfigurationType, IBaseEvaluationOptionHelper> _evaluationOptionHelperFactory;

        public BaseEvaluationOptionBuilder(
            IConventionService conventionService,
            EvaluationOptionHelperFactory<EvaluationConfigurationType, IBaseEvaluationOptionHelper> evaluationOptionHelperFactory,
            ILogger<DataObjectBuilder> logger) : base(conventionService, logger)
        {
            this._evaluationOptionHelperFactory = evaluationOptionHelperFactory;
        }

        public async override Task<List<BaseEvaluationOption>> Build(IFieldSet fields, IEnumerable<Data.BaseEvaluationOption> datas)
        {
            this._logger.Debug("building for {count} items requesting {fields} fields", datas?.Count(), fields?.Fields?.Count);
            this._logger.Trace(new DataLogEntry("requested fields", fields));
            if (fields == null || fields.IsEmpty()) return Enumerable.Empty<BaseEvaluationOption>().ToList();

            if (fields.HasField("AllEvaluation")) fields = fields.Merge(this.GetAllEvaluation());

            List<BaseEvaluationOption> models = new List<BaseEvaluationOption>();
            foreach (Data.BaseEvaluationOption d in datas)
            {
                BaseEvaluationOption m = await this._evaluationOptionHelperFactory.ChildClass(d.OptionType).Build(fields, d);

                if (fields.HasField(this.AsIndexer(nameof(BaseEvaluationOption.Label)))) m.Label = d.Label;
                if (fields.HasField(this.AsIndexer(nameof(BaseEvaluationOption.IsMandatory)))) m.IsMandatory = d.IsMandatory;
                if (fields.HasField(this.AsIndexer(nameof(BaseEvaluationOption.OptionType)))) m.OptionType = d.OptionType;
                if (fields.HasField(this.AsIndexer(nameof(BaseEvaluationOption.OptionId)))) m.OptionId = d.OptionId;
                if (fields.HasField(this.AsIndexer(nameof(BaseEvaluationOption.IsActive)))) m.IsActive = d.IsActive;

                models.Add(m);
            }
            this._logger.Debug("build {count} items", models?.Count);
            return models;
        }

        protected IFieldSet GetAllEvaluation()
        {
            IEnumerable<string> fieldStrings = new List<string>();

            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(BaseEvaluationOption.Label)));
            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(BaseEvaluationOption.IsMandatory)));
            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(BaseEvaluationOption.OptionType)));
            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(BaseEvaluationOption.OptionId)));
            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(BaseEvaluationOption.IsActive)));

            return new FieldSet(fieldStrings);
        }
    }
}
