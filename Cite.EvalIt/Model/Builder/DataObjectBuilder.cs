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
    public class DataObjectBuilder : Builder<DataObject, Data.DataObject>
    {
        private readonly QueryFactory _queryFactory;
        private readonly BuilderFactory _builderFactory;
        private readonly TagQuery _tagQuery;
        private readonly IAuthorizationService _authService;
        private readonly DataObjectTypeQuery _typeQuery;
        private readonly UserQuery _userQuery;

        public DataObjectBuilder(
            TagQuery tagQuery,
            DataObjectTypeQuery typeQuery,
            UserQuery userQuery,
            QueryFactory queryFactory,
            IConventionService conventionService,
            BuilderFactory builderFactory,
            IAuthorizationService authService,
            ILogger<DataObjectBuilder> logger) : base(conventionService, logger)
        {
            this._queryFactory = queryFactory;
            this._builderFactory = builderFactory;
            this._tagQuery = tagQuery;
            this._authService = authService;
            this._typeQuery = typeQuery;
            this._userQuery = userQuery;
        }

        public async override Task<List<DataObject>> Build(IFieldSet fields, IEnumerable<Data.DataObject> datas)
        {
            this._logger.Debug("building for {count} items requesting {fields} fields", datas?.Count(), fields?.Fields?.Count);
            this._logger.Trace(new DataLogEntry("requested fields", fields));
            if (fields == null || fields.IsEmpty()) return Enumerable.Empty<DataObject>().ToList();

            IFieldSet tagFields = fields.ExtractPrefixed(this.AsPrefix(nameof(Tag)));
            IFieldSet userFields = fields.ExtractPrefixed(this.AsPrefix(nameof(User)));

            Dictionary<Guid, Tag> tagMap = null;
            Dictionary<Guid, Data.User> userMap = null;
            Dictionary<Guid, Data.DataObjectType> typeMap = null;

            if (!tagFields.IsEmpty())
            {
                if (!tagFields.HasField(nameof(Tag.Id))) tagFields.Fields.Add(nameof(Tag.Id).ToLower());
                
                IEnumerable<Data.Tag> tagData = await _tagQuery.IsActive(Common.IsActive.Active).Ids(datas.SelectMany(d => d.AssignedTagIds).Distinct()).Collect();

                List<Tag> tagModels = await this._builderFactory.Builder<TagBuilder>().Build(tagFields, tagData);

                tagMap = tagModels.ToDictionary(t => t.Id, t => t);
            }

            if (!userFields.IsEmpty())
            {
                IEnumerable<Data.User> userData = await _userQuery.IsActive(Common.IsActive.Active).Ids(datas.Select(d => d.UserId).Distinct()).Collect();

                userMap = userData.ToDictionary(t => t.Id, t => t);
            }

            if (fields.HasField(this.AsIndexer(nameof(DataObject.CanWriteReview))))
            {
                IEnumerable<Data.DataObjectType> typeData = await _typeQuery.IsActive(Common.IsActive.Active).Ids(datas.Select(d => d.DataObjectTypeId).Distinct()).Collect();

                typeMap = typeData.ToDictionary(t => t.Id, t => t);
            }

            IFieldSet typeFields = fields.ExtractPrefixed(this.AsPrefix(nameof(DataObjectType)));
            IFieldSet attributeFields = fields.ExtractPrefixed(this.AsPrefix(nameof(DataObjectAttributeData)));
            IFieldSet reviewFields = fields.ExtractPrefixed(this.AsPrefix(nameof(DataObjectReview)));

            List<DataObject> models = new List<DataObject>();
            foreach (Data.DataObject d in datas)
            {
                DataObject m = new DataObject();
                if (fields.HasField(this.AsIndexer(nameof(DataObject.Id)))) m.Id = d.Id;
                if (fields.HasField(this.AsIndexer(nameof(DataObject.Title)))) m.Title = d.Title;
                if (fields.HasField(this.AsIndexer(nameof(DataObject.Description)))) m.Description = d.Description;
                if (fields.HasField(this.AsIndexer(nameof(DataObject.UserDefinedIds)))) m.UserDefinedIds = d.UserDefinedIds;
                if (fields.HasField(this.AsIndexer(nameof(DataObject.UserId)))) m.UserId = d.UserId;
                if (fields.HasField(this.AsIndexer(nameof(DataObject.DataObjectTypeId)))) m.DataObjectTypeId = d.DataObjectTypeId;
                if (fields.HasField(this.AsIndexer(nameof(DataObject.RankScore)))) m.RankScore = d.RankScore;
                if (fields.HasField(this.AsIndexer(nameof(DataObject.IsActive)))) m.IsActive = d.IsActive;
                if (fields.HasField(this.AsIndexer(nameof(DataObject.CreatedAt)))) m.CreatedAt = d.CreatedAt;
                if (fields.HasField(this.AsIndexer(nameof(DataObject.UpdatedAt)))) m.UpdatedAt = d.UpdatedAt;
                if (fields.HasField(this.AsIndexer(nameof(DataObject.Hash)))) m.Hash = this.HashValue(d.UpdatedAt);
                if (fields.HasField(this.AsIndexer(nameof(DataObject.CanEdit)))) m.CanEdit = await this._authService.CanEditOrOwner(d.UserId, "", new List<string>() { Permission.EditDataObject }, new List<string>() { "admin" });
                if (fields.HasField(this.AsIndexer(nameof(DataObject.CanWriteReview))))
                {

                    if (typeMap[d.DataObjectTypeId].MultipleReviewOption) m.CanWriteReview = await this._authService.HasPermissionAndNotRestricted(new List<Guid>().ToArray(), new List<string>().ToArray(), new List<string>() { Permission.EditDataObjectReview });
                    else
                    {
                        var restrictedIds = d.Reviews.Where(r => r.UserId != null && r.IsActive == Common.IsActive.Active).Select(r => r.UserId.Value).ToArray();
                        var restrictedHashes = d.Reviews.Where(r => r.UserIdHash != null ).Select(r => r.UserIdHash).ToArray();

                        m.CanWriteReview = await this._authService.HasPermissionAndNotRestricted(restrictedIds, restrictedHashes, new List<string>() { Permission.EditDataObjectReview });
                    }
                }

                if (!typeFields.IsEmpty()) m.DataObjectType = await this._builderFactory.Builder<DataObjectTypeBuilder>().Build(typeFields, d.DataObjectType);

                if (!userFields.IsEmpty()) m.User = await this._builderFactory.Builder<UserBuilder>().Build(userFields, userMap[d.UserId]);

                if (!tagFields.IsEmpty()) m.AssignedTagIds = d.AssignedTagIds.Select(p => tagMap[p]);

                if (!attributeFields.IsEmpty())
                {
                    m.AttributeData = new DataObjectAttributeData()
                    {
                        Attributes = new List<DataObjectAttribute>()
                    };

                    foreach (var x in d.AttributeData.Attributes)
                    {
                        m.AttributeData.Attributes.Add(await this._builderFactory.Builder<DataObjectAttributeBuilder>().Build(attributeFields, x));
                    }

                };

                if (!reviewFields.IsEmpty()) m.Reviews = d.Reviews != null ? await this._builderFactory.Builder<DataObjectReviewBuilder>().Build(reviewFields, d.Reviews) : new List<DataObjectReview>();

                models.Add(m);
            }
            this._logger.Debug("build {count} items", models?.Count);
            return models;
        }
    }
}
