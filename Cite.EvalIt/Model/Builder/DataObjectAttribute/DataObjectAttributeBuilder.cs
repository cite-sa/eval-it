using Cite.EvalIt.Common;
using Cite.EvalIt.Convention;
using Cite.EvalIt.Query;
using Cite.EvalIt.Service.DataObjectType.DataObjectAttributeHelper;
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
    public class DataObjectAttributeBuilder : Builder<DataObjectAttribute, Data.DataObjectAttribute>
    {
        private readonly DataObjectAttributeHelperFactory<DataObjectAttributeType, IDataObjectAttributeHelper> _dataObjectAttributeHelperFactory;

        public DataObjectAttributeBuilder(
            IConventionService conventionService,
            DataObjectAttributeHelperFactory<DataObjectAttributeType, IDataObjectAttributeHelper> dataObjectAttributeHelperFactory,
            ILogger<DataObjectBuilder> logger) : base(conventionService, logger)
        {
            this._dataObjectAttributeHelperFactory = dataObjectAttributeHelperFactory;
        }

        public async override Task<List<DataObjectAttribute>> Build(IFieldSet fields, IEnumerable<Data.DataObjectAttribute> datas)
        {
            this._logger.Debug("building for {count} items requesting {fields} fields", datas?.Count(), fields?.Fields?.Count);
            this._logger.Trace(new DataLogEntry("requested fields", fields));
            if (fields == null || fields.IsEmpty()) return Enumerable.Empty<DataObjectAttribute>().ToList();

            List<DataObjectAttribute> models = new List<DataObjectAttribute>();
            foreach (Data.DataObjectAttribute d in datas)
            {
                DataObjectAttribute m = await this._dataObjectAttributeHelperFactory.ChildClass(d.AttributeType).Build(fields, d);

                if (fields.HasField(this.AsIndexer(nameof(DataObjectAttribute.OptionId)))) m.OptionId = d.OptionId;
                if (fields.HasField(this.AsIndexer(nameof(DataObjectAttribute.AttributeType)))) m.AttributeType = d.AttributeType;

                models.Add(m);
            }
            this._logger.Debug("build {count} items", models?.Count);
            return models;
        }
    }
}
