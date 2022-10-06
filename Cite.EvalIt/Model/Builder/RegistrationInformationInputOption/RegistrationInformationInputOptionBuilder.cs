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
    public class RegistrationInformationInputOptionBuilder : Builder<RegistrationInformationInputOption, Data.RegistrationInformationInputOption>
    {
        private readonly RegistrationInformationInputOptionHelperFactory<RegistrationInformationType, IRegistrationInformationInputOptionHelper> _registrationInformationInputOptionHelperFactory;

        public RegistrationInformationInputOptionBuilder(
            IConventionService conventionService,
            RegistrationInformationInputOptionHelperFactory< RegistrationInformationType, IRegistrationInformationInputOptionHelper> registrationInformationInputOptionHelperFactory,
            ILogger<DataObjectBuilder> logger) : base(conventionService, logger)
        {
            this._registrationInformationInputOptionHelperFactory = registrationInformationInputOptionHelperFactory;
        }

        public async override Task<List<RegistrationInformationInputOption>> Build(IFieldSet fields, IEnumerable<Data.RegistrationInformationInputOption> datas)
        {
            this._logger.Debug("building for {count} items requesting {fields} fields", datas?.Count(), fields?.Fields?.Count);
            this._logger.Trace(new DataLogEntry("requested fields", fields));
            if (fields == null || fields.IsEmpty()) return Enumerable.Empty<RegistrationInformationInputOption>().ToList();

            if (fields.HasField("AllInformation")) fields = fields.Merge(this.GetAllInformation());

            List<RegistrationInformationInputOption> models = new List<RegistrationInformationInputOption>();
            foreach (Data.RegistrationInformationInputOption d in datas)
            {
                RegistrationInformationInputOption m = await this._registrationInformationInputOptionHelperFactory.ChildClass(d.OptionType).Build(fields, d);

                if (fields.HasField(this.AsIndexer(nameof(RegistrationInformationInputOption.Label)))) m.Label = d.Label;
                if (fields.HasField(this.AsIndexer(nameof(RegistrationInformationInputOption.IsMandatory)))) m.IsMandatory = d.IsMandatory;
                if (fields.HasField(this.AsIndexer(nameof(RegistrationInformationInputOption.MultiValue)))) m.MultiValue = d.MultiValue;
                if (fields.HasField(this.AsIndexer(nameof(RegistrationInformationInputOption.OptionType)))) m.OptionType = d.OptionType;
                if (fields.HasField(this.AsIndexer(nameof(RegistrationInformationInputOption.OptionId)))) m.OptionId = d.OptionId;
                if (fields.HasField(this.AsIndexer(nameof(RegistrationInformationInputOption.IsActive)))) m.IsActive = d.IsActive;

                models.Add(m);
            }
            this._logger.Debug("build {count} items", models?.Count);
            return models;
        }

        protected IFieldSet GetAllInformation()
        {
            IEnumerable<string> fieldStrings = new List<string>();

            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(RegistrationInformationInputOption.Label)));
            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(RegistrationInformationInputOption.IsMandatory)));
            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(RegistrationInformationInputOption.MultiValue)));
            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(RegistrationInformationInputOption.OptionType)));
            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(RegistrationInformationInputOption.OptionId)));
            fieldStrings = fieldStrings.Append(this.AsIndexer(nameof(RegistrationInformationInputOption.IsActive)));

            return new FieldSet(fieldStrings);
        }
    }
}
