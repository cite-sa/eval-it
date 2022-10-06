using Cite.EvalIt.Common;
using Cite.EvalIt.Convention;
using Cite.EvalIt.Query;
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
    public class ReviewEvaluationBuilder : Builder<ReviewEvaluation, Data.ReviewEvaluation>
    {
        private readonly ReviewEvaluationHelperFactory<ReviewEvaluationType, IReviewEvaluationHelper> _reviewEvaluationHelperFactory;

        public ReviewEvaluationBuilder(
            IConventionService conventionService,
            ReviewEvaluationHelperFactory<ReviewEvaluationType, IReviewEvaluationHelper> reviewEvaluationHelperFactory,
            ILogger<DataObjectBuilder> logger) : base(conventionService, logger)
        {
            this._reviewEvaluationHelperFactory = reviewEvaluationHelperFactory;
        }

        public async override Task<List<ReviewEvaluation>> Build(IFieldSet fields, IEnumerable<Data.ReviewEvaluation> datas)
        {
            this._logger.Debug("building for {count} items requesting {fields} fields", datas?.Count(), fields?.Fields?.Count);
            this._logger.Trace(new DataLogEntry("requested fields", fields));
            if (fields == null || fields.IsEmpty()) return Enumerable.Empty<ReviewEvaluation>().ToList();

            List<ReviewEvaluation> models = new List<ReviewEvaluation>();
            foreach (Data.ReviewEvaluation d in datas)
            {
                ReviewEvaluation m = await this._reviewEvaluationHelperFactory.ChildClass(d.EvaluationType).Build(fields, d);

                if (fields.HasField(this.AsIndexer(nameof(ReviewEvaluation.OptionId)))) m.OptionId = d.OptionId;
                if (fields.HasField(this.AsIndexer(nameof(ReviewEvaluation.EvaluationType)))) m.EvaluationType = d.EvaluationType;

                models.Add(m);
            }
            this._logger.Debug("build {count} items", models?.Count);
            return models;
        }
    }
}
