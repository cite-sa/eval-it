using Cite.EvalIt.Authorization;
using Cite.EvalIt.Convention;
using Cite.EvalIt.Query;
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
    public class FeedbackDataBuilder : Builder<FeedbackData, Data.FeedbackData>
    {
        public FeedbackDataBuilder(
            BuilderFactory builderFactory,
            IConventionService conventionService,
            IAuthorizationService authService,
            ILogger<FeedbackDataBuilder> logger) : base(conventionService, logger)
        {
            _builderFactory = builderFactory;
            _authService = authService;
        }

        private readonly BuilderFactory _builderFactory;
        private readonly IAuthorizationService _authService;

        public override Task<List<FeedbackData>> Build(IFieldSet fields, IEnumerable<Data.FeedbackData> datas)
        {
            this._logger.Debug("building for {count} items requesting {fields} fields", datas?.Count(), fields?.Fields?.Count);
            this._logger.Trace(new DataLogEntry("requested fields", fields));
            if (fields == null || fields.IsEmpty()) return Task.FromResult(Enumerable.Empty<FeedbackData>().ToList());

            List<FeedbackData> models = new List<FeedbackData>();
            foreach (Data.FeedbackData d in datas)
            {
                FeedbackData m = new FeedbackData();
                if (fields.HasField(this.AsIndexer(nameof(FeedbackData.Like)))) m.Like = d.Like;

                models.Add(m);
            }
            this._logger.Debug("build {count} items", models?.Count);
            return Task.FromResult(models);
        }
    }
}
