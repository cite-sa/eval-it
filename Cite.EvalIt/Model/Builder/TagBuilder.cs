using Cite.EvalIt.Convention;
using Cite.EvalIt.Query;
using Cite.Tools.Data.Builder;
using Cite.Tools.Data.Query;
using Cite.Tools.FieldSet;
using Cite.Tools.Logging;
using Cite.Tools.Logging.Extensions;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Cite.EvalIt.Model
{
    public class TagBuilder : Builder<Tag, Data.Tag>
    {
        private readonly BuilderFactory _builderFactory;
        private readonly UserQuery _userQuery;
        private readonly DataObjectQuery _dataObjectQuery;

        public TagBuilder(
            UserQuery userQuery,
            DataObjectQuery dataObjectQuery,
            IConventionService conventionService,
            BuilderFactory builderFactory,
            ILogger<UserBuilder> logger) : base(conventionService, logger)
        {
            this._userQuery = userQuery;
            this._dataObjectQuery = dataObjectQuery;
            this._builderFactory = builderFactory;
        }

        public async override Task<List<Tag>> Build(IFieldSet fields, IEnumerable<Data.Tag> datas)
        {
            this._logger.Debug("building for {count} items requesting {fields} fields", datas?.Count(), fields?.Fields?.Count);
            this._logger.Trace(new DataLogEntry("requested fields", fields));
            if (fields == null || fields.IsEmpty()) return Enumerable.Empty<Tag>().ToList();

            IFieldSet userFields = fields.ExtractPrefixed(this.AsPrefix(nameof(User)));

            Dictionary<Guid, List<User>> UserMap = new Dictionary<Guid, List<User>>();

            if ( !userFields.IsEmpty() )
            {
                if (!userFields.HasField(nameof(User.Id))) userFields.Fields.Add(nameof(User.Id).ToLower());
                if (!userFields.HasField("Tag." + nameof(User.Id))) userFields.Fields.Add("tag." + nameof(User.Id).ToLower());

                IEnumerable<Guid> DistinctTagIds = datas.Select(a => a.Id).Distinct();

                UserMap = DistinctTagIds.ToDictionary(id => id, id => new List<User>());

                IEnumerable<Data.User> UserData = await _userQuery.IsActive(Common.IsActive.Active).TagIds(datas.Select(t => t.Id)).Collect();

                List<User> UserModels = await this._builderFactory.Builder<UserBuilder>().Build(userFields, UserData);

                foreach ( User user in UserModels)
                {
                    foreach( Guid id in user.AssignedTagIds.Select(t => t.Id))
                    {
                       if(UserMap.ContainsKey(id)) UserMap[id].Add(user);
                    }
                }
            }

            IFieldSet dataObjectFields = fields.ExtractPrefixed(this.AsPrefix(nameof(DataObject)));

            Dictionary<Guid, List<DataObject>> DataObjectMap = new Dictionary<Guid, List<DataObject>>();

            if (!dataObjectFields.IsEmpty())
            {
                if (!dataObjectFields.HasField(nameof(DataObject.Id))) dataObjectFields.Fields.Add(nameof(DataObject.Id).ToLower());
                if (!dataObjectFields.HasField("DataObject." + nameof(DataObject.Id))) dataObjectFields.Fields.Add("tag." + nameof(DataObject.Id).ToLower());

                IEnumerable<Guid> DistinctTagIds = datas.Select(a => a.Id).Distinct();

                DataObjectMap = DistinctTagIds.ToDictionary(id => id, id => new List<DataObject>());

                IEnumerable<Data.DataObject> DataObjectData = await _dataObjectQuery.IsActive(Common.IsActive.Active).TagIds(datas.Select(t => t.Id)).Collect();

                List<DataObject> DataObjectModels = await this._builderFactory.Builder<DataObjectBuilder>().Build(dataObjectFields, DataObjectData);

                foreach (DataObject dataObject in DataObjectModels)
                {
                    foreach (Guid id in dataObject.AssignedTagIds.Select(t => t.Id))
                    {
                        if (DataObjectMap.ContainsKey(id)) DataObjectMap[id].Add(dataObject);
                    }
                }
            }

            List<Tag> models = new List<Tag>();
            foreach (Data.Tag d in datas)
            {
                Tag m = new Tag();
                if (fields.HasField(this.AsIndexer(nameof(Tag.Hash)))) m.Hash = this.HashValue(d.UpdatedAt);
                if (fields.HasField(this.AsIndexer(nameof(Tag.Id)))) m.Id = d.Id;
                if (fields.HasField(this.AsIndexer(nameof(Tag.Label)))) m.Label = d.Label;
                if (fields.HasField(this.AsIndexer(nameof(Tag.Type)))) m.Type = d.Type;
                if (fields.HasField(this.AsIndexer(nameof(Tag.AppliesTo)))) m.AppliesTo = d.AppliesTo;
                if (fields.HasField(this.AsIndexer(nameof(Tag.IsActive)))) m.IsActive = d.IsActive;
                if (fields.HasField(this.AsIndexer(nameof(Tag.CreatedAt)))) m.CreatedAt = d.CreatedAt;
                if (fields.HasField(this.AsIndexer(nameof(Tag.UpdatedAt)))) m.UpdatedAt = d.UpdatedAt;
                if (!userFields.IsEmpty()) m.AssociatedUsers = UserMap[m.Id];
                if (!dataObjectFields.IsEmpty()) m.AssociatedDataObjects = DataObjectMap[m.Id];

                models.Add(m);
            }
            this._logger.Debug("build {count} items", models?.Count);
            return models;
        }
    }
}
