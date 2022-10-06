using Cite.EvalIt.Authorization;
using Cite.EvalIt.Common;
using Cite.EvalIt.Convention;
using Cite.EvalIt.Data.Context;
using Cite.EvalIt.ErrorCode;
using Cite.EvalIt.Model;
using Cite.EvalIt.Query;
using Cite.Tools.Common.Extensions;
using Cite.Tools.Data.Builder;
using Cite.Tools.Data.Deleter;
using Cite.Tools.Exception;
using Cite.Tools.FieldSet;
using Cite.Tools.Logging;
using Cite.Tools.Logging.Extensions;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.Tag
{
    public class TagService : ITagService
    {
        private readonly AppMongoDbContext _mongoDatabase;
        private readonly UserQuery _userQuery;
        private readonly DataObjectQuery _dataObjectQuery;
        private readonly TagQuery _tagQuery;
        private readonly BuilderFactory _builderFactory;
        private readonly DeleterFactory _deleterFactory;
        private readonly IConventionService _conventionService;
        private readonly IAuthorizationService _authorizationService;
        private readonly ILogger<TagService> _logger;
        private readonly ErrorThesaurus _errors;

        public TagService(
            ILogger<TagService> logger,
            AppMongoDbContext mongoDatabase,
            UserQuery userQuery,
            DataObjectQuery dataObjectQuery,
            TagQuery tagQuery,
            BuilderFactory builderFactory,
            DeleterFactory deleterFactory,
            IConventionService conventionService,
            IAuthorizationService authorizationService,
            ErrorThesaurus errors
            )
        {
            this._logger = logger;
            this._mongoDatabase = mongoDatabase;
            this._userQuery = userQuery;
            this._dataObjectQuery = dataObjectQuery;
            this._tagQuery = tagQuery;
            this._builderFactory = builderFactory;
            this._deleterFactory = deleterFactory;
            this._conventionService = conventionService;
            this._authorizationService = authorizationService;
            this._errors = errors;
        }

        public async Task<Model.Tag> PersistAsync(TagPersist model, IFieldSet fields = null)
        {
            this._logger.Debug(new MapLogEntry("persisting").And("model", model).And("fields", fields));

            await this._authorizationService.AuthorizeForce(Permission.EditTag);

            Data.Tag document = null;

            DateTime CreatedDate = DateTime.UtcNow;
            DateTime UpdatedDate = CreatedDate;

            if (model.Id != null)
            {
                document = (await this._tagQuery.Ids(model.Id.Value).IsActive(IsActive.Active).Collect()).FirstOrDefault();
                if (model.Hash != this._conventionService.HashValue(document.UpdatedAt)) throw new MyValidationException(this._errors.HashConflict.Code, this._errors.HashConflict.Message);

                CreatedDate = document.CreatedAt;
                
                if ( (document.AppliesTo != model.AppliesTo) && (model.AppliesTo == TagAppliesTo.Object) )
                {
                    if ((await _userQuery.IsActive(IsActive.Active).TagIds(model.Id.Value).Collect()).Any()) throw new MyValidationException("Cannot change tag's AppliesTo field, tag is already assigned to a User");
                }

                if ((document.AppliesTo != model.AppliesTo) && (model.AppliesTo == TagAppliesTo.User))
                {
                    if ((await _dataObjectQuery.IsActive(IsActive.Active).TagIds(model.Id.Value).Collect()).Any()) throw new MyValidationException("Cannot change tag's AppliesTo field, tag is already assigned to an Object");
                }
            }

            Data.Tag data = new Data.Tag
            {
                Id = document == null ? Guid.NewGuid() : document.Id,
                Type = model.Type,
                AppliesTo = model.AppliesTo,
                Label = model.Label,
                IsActive = IsActive.Active,
                CreatedAt = CreatedDate,
                UpdatedAt = UpdatedDate,
            };

            // Persist Item
            FilterDefinition<Data.Tag> filter = Builders<Data.Tag>.Filter.Eq(t => t.Id, model.Id);
            
            if (document != null) await this._mongoDatabase.ReplaceOneAsync(filter, data);
            else await this._mongoDatabase.InsertOneAsync(data);

            Model.Tag persisted = await this._builderFactory.Builder<Model.TagBuilder>().Build(FieldSet.Build(fields, nameof(Model.Tag.Id), nameof(Model.Tag.Hash)), data);

            return persisted;
        }

        public async Task DeleteAndSaveAsync(Guid id)
        {
            this._logger.Debug("deleting tag {id}", id);

            await this._authorizationService.AuthorizeForce(Permission.DeleteTag);

            await this._deleterFactory.Deleter<Model.TagDeleter>().DeleteAndSave(id.AsArray());
        }
    }
}
