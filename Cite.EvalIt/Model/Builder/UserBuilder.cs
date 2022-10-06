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
    public class UserBuilder : Builder<User, Data.User>
    {
        private readonly QueryFactory _queryFactory;
        private readonly BuilderFactory _builderFactory;
        private readonly TagQuery _tagQuery;
        private readonly UserQuery _userQuery;

        public UserBuilder(
            TagQuery tagQuery,
            UserQuery userQuery,
            QueryFactory queryFactory,
            IConventionService conventionService,
            BuilderFactory builderFactory,
            ILogger<UserBuilder> logger) : base(conventionService, logger)
        {
            this._queryFactory = queryFactory;
            this._builderFactory = builderFactory;
            this._tagQuery = tagQuery;
            this._userQuery = userQuery;
        }

        public async override Task<List<User>> Build(IFieldSet fields, IEnumerable<Data.User> datas)
        {
            this._logger.Debug("building for {count} items requesting {fields} fields", datas?.Count(), fields?.Fields?.Count);
            this._logger.Trace(new DataLogEntry("requested fields", fields));
            if (fields == null || fields.IsEmpty()) return Enumerable.Empty<User>().ToList();

            IFieldSet userProfileFields = fields.ExtractPrefixed(this.AsPrefix(nameof(User.Profile)));
            IFieldSet tagFields = fields.ExtractPrefixed(this.AsPrefix(nameof(Tag)));
            IFieldSet userNetworkFields = fields.ExtractPrefixed(this.AsPrefix(nameof(User)));

            Dictionary<Guid, Tag> tagMap = null;
            Dictionary<Guid, User> userNetworkMap = null;

            if (!tagFields.IsEmpty())
            {
                if (!tagFields.HasField(nameof(Tag.Id))) tagFields.Fields.Add(nameof(Tag.Id).ToLower());
                
                IEnumerable<Data.Tag> tagData = await _tagQuery.IsActive(Common.IsActive.Active).Ids(datas.SelectMany(d => d.AssignedTagIds)).Collect();

                List<Tag> tagModels = await this._builderFactory.Builder<TagBuilder>().Build(tagFields, tagData);

                tagMap = tagModels.ToDictionary(t => t.Id, t => t);
            }

            if (userNetworkFields.HasOtherField(nameof(User.Id)))
            {
                if (!userNetworkFields.HasField(nameof(User.Id))) userNetworkFields.Fields.Add(nameof(User.Id).ToLower());

                IEnumerable<Data.User> userNetworkData = await _userQuery.IsActive(Common.IsActive.Active).Ids(datas.SelectMany(d => d.UserNetworkIds.Select(t => t.Id))).Collect();

                List<User> userNetworkModels = await this._builderFactory.Builder<UserBuilder>().Build(userNetworkFields, userNetworkData);

                userNetworkMap = userNetworkModels.ToDictionary(u => u.Id.Value, u => u);
            }

            List<User> models = new List<User>();
            foreach (Data.User d in datas)
            {
                User m = new User();
                if (fields.HasField(this.AsIndexer(nameof(User.Hash)))) m.Hash = this.HashValue(d.UpdatedAt);
                if (fields.HasField(this.AsIndexer(nameof(User.Id)))) m.Id = d.Id;
                if (fields.HasField(this.AsIndexer(nameof(User.Name)))) m.Name = d.Name;
                if (fields.HasField(this.AsIndexer(nameof(User.IsActive)))) m.IsActive = d.IsActive;
                if (fields.HasField(this.AsIndexer(nameof(User.IsNetworkCandidate)))) m.IsNetworkCandidate = d.IsNetworkCandidate;
                if (fields.HasField(this.AsIndexer(nameof(User.CreatedAt)))) m.CreatedAt = d.CreatedAt;
                if (fields.HasField(this.AsIndexer(nameof(User.UpdatedAt)))) m.UpdatedAt = d.UpdatedAt;
                if (!userProfileFields.IsEmpty()) m.Profile = await this._builderFactory.Builder<UserProfileBuilder>().Build(userProfileFields, d.Profile);

                if (!tagFields.IsEmpty()) m.AssignedTagIds = d.AssignedTagIds.Select(p => tagMap[p]);

                if (userNetworkFields.HasOtherField(nameof(User.Id))) m.UserNetworkIds = d.UserNetworkIds.Where(x => userNetworkMap.ContainsKey(x.Id)).Select(p => new Common.UserWithRelationshipModel { Id = p.Id, Relationship = p.Relationship, User = userNetworkMap[p.Id] });
                else if (userNetworkFields.HasField(nameof(User.Id))) m.UserNetworkIds = d.UserNetworkIds.Select(p => new Common.UserWithRelationshipModel { Id = p.Id, Relationship = p.Relationship, User = null });

                models.Add(m);
            }
            this._logger.Debug("build {count} items", models?.Count);
            return models;
        }
    }
}
