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
    public class AbsoluteIntegerInputOptionBuilder : Builder<RegistrationInformationInputOption, Data.RegistrationInformationInputOption>
    {
        public AbsoluteIntegerInputOptionBuilder(
            IConventionService conventionService,
            ILogger<DataObjectBuilder> logger) : base(conventionService, logger)
        { }

        public override Task<List<RegistrationInformationInputOption>> Build(IFieldSet fields, IEnumerable<Data.RegistrationInformationInputOption> datas)
        {
            this._logger.Debug("building for {count} items requesting {fields} fields", datas?.Count(), fields?.Fields?.Count);
            this._logger.Trace(new DataLogEntry("requested fields", fields));
            if (fields == null || fields.IsEmpty()) return Task.FromResult(Enumerable.Empty<RegistrationInformationInputOption>().ToList());

            if (fields.HasField("AllInformation")) fields = fields.Merge(this.GetAllInformation());

            List<RegistrationInformationInputOption> models = new List<RegistrationInformationInputOption>();
            foreach (Data.AbsoluteIntegerInputOption d in datas)
            {
                AbsoluteIntegerInputOption m = new AbsoluteIntegerInputOption();
                if (fields.HasField(this.AsIndexer(nameof(AbsoluteIntegerInputOption.MeasurementUnit)))) m.MeasurementUnit = d.MeasurementUnit;
                if (fields.HasField(this.AsIndexer(nameof(AbsoluteIntegerInputOption.ValidationRegexp)))) m.ValidationRegexp = d.ValidationRegexp;
                if (fields.HasField(this.AsIndexer(nameof(AbsoluteIntegerInputOption.UpperBound)))) m.UpperBound = d.UpperBound;
                if (fields.HasField(this.AsIndexer(nameof(AbsoluteIntegerInputOption.LowerBound)))) m.LowerBound = d.LowerBound;

                models.Add(m);
            }
            this._logger.Debug("build {count} items", models?.Count);
            return Task.FromResult(models);
        }

        protected IFieldSet GetAllInformation()
        {
            IEnumerable<string> fieldStrings = new List<string>();

            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(AbsoluteIntegerInputOption.MeasurementUnit)));
            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(AbsoluteIntegerInputOption.ValidationRegexp)));
            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(AbsoluteIntegerInputOption.UpperBound)));
            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(AbsoluteIntegerInputOption.LowerBound)));

            return new FieldSet(fieldStrings);
        }
    }
}
