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
    public class AbsoluteDecimalAttributeBuilder : Builder<DataObjectAttribute, Data.DataObjectAttribute>
    {
        public AbsoluteDecimalAttributeBuilder(
            IConventionService conventionService,
            ILogger<DataObjectBuilder> logger) : base(conventionService, logger)
        { }

        public override Task<List<DataObjectAttribute>> Build(IFieldSet fields, IEnumerable<Data.DataObjectAttribute> datas)
        {
            this._logger.Debug("building for {count} items requesting {fields} fields", datas?.Count(), fields?.Fields?.Count);
            this._logger.Trace(new DataLogEntry("requested fields", fields));
            if (fields == null || fields.IsEmpty()) return Task.FromResult(Enumerable.Empty<DataObjectAttribute>().ToList());

            List<DataObjectAttribute> models = new List<DataObjectAttribute>();
            foreach (Data.AbsoluteDecimalAttribute d in datas)
            {
                AbsoluteDecimalAttribute m = new AbsoluteDecimalAttribute();
                if (fields.HasField(this.AsIndexer(nameof(AbsoluteDecimalAttribute.Values)))) m.Values = d.Values;

                models.Add(m);
            }
            this._logger.Debug("build {count} items", models?.Count);
            return Task.FromResult(models);
        }
    }
}
