using Cite.EvalIt.Authorization;
using Cite.EvalIt.Common;
using Cite.EvalIt.Convention;
using Cite.EvalIt.ErrorCode;
using Cite.EvalIt.Model;
using Cite.EvalIt.Query;
using Cite.EvalIt.Service.DataObjectType.DataObjectAttributeHelper;
using Cite.EvalIt.Service.DataObjectType.RegistrationInformationInputOptionHelper;
using Cite.Tools.Common.Extensions;
using Cite.Tools.Data.Builder;
using Cite.Tools.Data.Deleter;
using Cite.Tools.Exception;
using Cite.Tools.FieldSet;
using Cite.Tools.Logging;
using Cite.Tools.Logging.Extensions;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Cite.EvalIt.Data.Context;
using Cite.EvalIt.Service.DataObjectType.BaseObjectRankRecalculationStrategyHelper;

namespace Cite.EvalIt.Service.DataObject
{
	public class DataObjectService : IDataObjectService
	{
		private readonly DataObjectAttributeHelperFactory<DataObjectAttributeType, IDataObjectAttributeHelper> _dataObjectAttributeHelperFactory;
		private readonly RegistrationInformationInputOptionHelperFactory<RegistrationInformationType, IRegistrationInformationInputOptionHelper> _registrationInformationInputOptionHelperFactory;
		private readonly BaseObjectRankRecalculationStrategyHelperFactory<ObjectRankRecalculationStrategyType, IBaseObjectRankRecalculationStrategyHelper> _baseObjectRankRecalculationStrategyHelperFactory;
		private readonly DataObjectTypeQuery _dataObjectTypeQuery;
		private readonly DataObjectQuery _dataObjectQuery;
		private readonly TagQuery _tagQuery;
		private readonly ILogger<DataObjectService> _logger;
		private readonly AppMongoDbContext _mongoDatabase;
		private readonly BuilderFactory _builderFactory;
		private readonly DeleterFactory _deleterFactory;
		private readonly IConventionService _conventionService;
		private readonly IStringLocalizer<Resources.MySharedResources> _localizer;
		private readonly IAuthorizationService _authorizationService;
		private readonly ErrorThesaurus _errors;

		public DataObjectService(
			DataObjectAttributeHelperFactory<DataObjectAttributeType, IDataObjectAttributeHelper> dataObjectAttributeHelperFactory,
			RegistrationInformationInputOptionHelperFactory<RegistrationInformationType, IRegistrationInformationInputOptionHelper> registrationInformationInputOptionHelperFactory,
			BaseObjectRankRecalculationStrategyHelperFactory<ObjectRankRecalculationStrategyType, IBaseObjectRankRecalculationStrategyHelper> baseObjectRankRecalculationStrategyHelperFactory,
			DataObjectTypeQuery dataObjectTypeQuery,
			DataObjectQuery dataObjectQuery,
			TagQuery tagQuery,
			ILogger<DataObjectService> logger,
			AppMongoDbContext mongoDatabase,
			BuilderFactory builderFactory,
			DeleterFactory deleterFactory,
			IConventionService conventionService,
			IStringLocalizer<Resources.MySharedResources> localizer,
			IAuthorizationService authorizationService,
			ErrorThesaurus errors
			)
		{
			this._dataObjectAttributeHelperFactory = dataObjectAttributeHelperFactory;
			this._registrationInformationInputOptionHelperFactory = registrationInformationInputOptionHelperFactory;
			this._baseObjectRankRecalculationStrategyHelperFactory = baseObjectRankRecalculationStrategyHelperFactory;
			this._dataObjectTypeQuery = dataObjectTypeQuery;
			this._dataObjectQuery = dataObjectQuery;
			this._tagQuery = tagQuery;
			this._logger = logger;
			this._mongoDatabase = mongoDatabase;
			this._builderFactory = builderFactory;
			this._deleterFactory = deleterFactory;
			this._conventionService = conventionService;
			this._localizer = localizer;
			this._authorizationService = authorizationService;
			this._errors = errors;
		}

		public async Task<Model.DataObject> PersistAsync(Model.DataObjectPersist model, IFieldSet fields = null)
		{
			this._logger.Debug(new MapLogEntry("persisting").And("model", model).And("fields", fields));

			if (!(await this._authorizationService.CanEditOrOwner(model.UserId, string.Empty, new string[] { Permission.EditDataObject }, new string[] { "admin" }))) throw new MyValidationException(this._errors.Forbidden.Code, this._errors.Forbidden.Message);

			Data.DataObject document = null;
			Data.DataObjectType dataObjectType = (await this._dataObjectTypeQuery.Ids(model.DataObjectTypeId).IsActive(IsActive.Active).Collect()).FirstOrDefault();
			Data.DataObjectType selfContainedType = null;
			var assignedTags = new List<Guid>();

			DateTime CreatedDate = DateTime.UtcNow;
			DateTime UpdatedDate = CreatedDate;

			if (model.Id != null)
			{
				document = (await this._dataObjectQuery.Ids(model.Id.Value).IsActive(IsActive.Active).Collect()).FirstOrDefault();
				if (document == null) throw new MyNotFoundException(this._localizer["General_ItemNotFound", model.Id, nameof(Model.DataObject)]);
				if (document.UserId != model.UserId && !(await this._authorizationService.CanEditOrOwner(document.UserId, string.Empty, new string[] { Permission.EditDataObject }, new string[] { "admin" }))) throw new MyValidationException(this._errors.Forbidden.Code, this._errors.Forbidden.Message);
				if (model.Hash != this._conventionService.HashValue(document.UpdatedAt)) throw new MyValidationException(this._errors.HashConflict.Code, this._errors.HashConflict.Message);

				assignedTags = document.AssignedTagIds.ToList();
				CreatedDate = document.CreatedAt;

				if (model.DataObjectType != null)
				{
					var info = new Data.RegistrationInformation()
					{
						InputOptions = new List<Data.RegistrationInformationInputOption> { }
					};

					foreach (var x in model.DataObjectType.Info.InputOptions)
					{
						var temp = this._registrationInformationInputOptionHelperFactory.ChildClass(x.OptionType).NewData();
						temp.Label = x.Label;
						temp.IsMandatory = x.IsMandatory;
						temp.MultiValue = x.MultiValue;
						temp.OptionId = x.OptionId ?? Guid.NewGuid();
						temp.OptionType = x.OptionType;
						temp.IsActive = x.IsActive;
						this._registrationInformationInputOptionHelperFactory.ChildClass(x.OptionType).PersistChildClassFields(temp, (RegistrationInformationInputOptionPersist)x);

						info.InputOptions.Add(temp);
					}

					selfContainedType = new Data.DataObjectType
					{
						Id = dataObjectType.Id,
						Name = dataObjectType.Name,
						Info = info,
						IsActive = dataObjectType.IsActive,
						CreatedAt = dataObjectType.CreatedAt,
						UpdatedAt = dataObjectType.UpdatedAt
					};
				}
				else selfContainedType = document.DataObjectType;
			}
			else
			{
				selfContainedType = new Data.DataObjectType
				{
					Id = dataObjectType.Id,
					Name = dataObjectType.Name,
					Info = new Data.RegistrationInformation
					{
						InputOptions = dataObjectType.Info.InputOptions,
					},
					IsActive = dataObjectType.IsActive,
					CreatedAt = dataObjectType.CreatedAt,
					UpdatedAt = dataObjectType.UpdatedAt
				};
			}

			Data.DataObjectAttributeData attributeData = new Data.DataObjectAttributeData()
			{
				Attributes = new List<Data.DataObjectAttribute> { }
			};

			foreach (var x in model.AttributeData.Attributes)
			{
				var temp = this._dataObjectAttributeHelperFactory.ChildClass(x.AttributeType).NewData();
				temp.OptionId = x.OptionId;
				temp.AttributeType = x.AttributeType;
				this._dataObjectAttributeHelperFactory.ChildClass(x.AttributeType).PersistChildClassFields(temp, (DataObjectAttributePersist)x);

				attributeData.Attributes.Add(temp);
			}

			Data.DataObject data = new Data.DataObject
			{
				Id = document == null ? Guid.NewGuid() : model.Id.Value,
				Title = model.Title,
				Description = model.Description,
				UserDefinedIds = model.UserDefinedIds,
				UserId = model.UserId,
				DataObjectType = selfContainedType,
				DataObjectTypeId = model.DataObjectTypeId,
				AttributeData = attributeData,
				Reviews = document != null ? document.Reviews : new List<Data.DataObjectReview>(),
				IsActive = IsActive.Active,
				RankScore = null,
				CreatedAt = CreatedDate,
				UpdatedAt = UpdatedDate,
				AssignedTagIds = assignedTags
			};

			// Persist Item
			FilterDefinition<Data.DataObject> filter = Builders<Data.DataObject>.Filter.Eq(u => u.Id, model.Id);

			if (document != null) await this._mongoDatabase.ReplaceOneAsync(filter, data);
			else await this._mongoDatabase.InsertOneAsync(data);

			Model.DataObject persisted = await this._builderFactory.Builder<Model.DataObjectBuilder>().Build(FieldSet.Build(fields, nameof(Model.DataObject.Id), nameof(Model.DataObject.Hash)), data);

			return persisted;
		}

		public async Task DeleteAndSaveAsync(Guid id)
		{
			this._logger.Debug("deleting data object {id}", id);

			Data.DataObject dataObjectDocument = (await this._dataObjectQuery.Ids(id).IsActive(IsActive.Active).Collect()).FirstOrDefault();
			if (!(await this._authorizationService.CanEditOrOwner(dataObjectDocument.UserId, string.Empty, new string[] { Permission.DeleteDataObject }, new string[] { "admin" }))) throw new MyValidationException(this._errors.Forbidden.Code, this._errors.Forbidden.Message);

			await this._deleterFactory.Deleter<Model.DataObjectDeleter>().DeleteAndSave(id.AsArray());
		}

		public async Task<float?> ObjectRankCalculate(Data.DataObject dataObject)
		{
			this._logger.Debug(new MapLogEntry("calculating rank for").And("object", dataObject.Id));

			Data.DataObjectType dataObjectTypeDocument = (await this._dataObjectTypeQuery.Ids(dataObject.DataObjectType.Id).IsActive(IsActive.Active).Collect()).FirstOrDefault();
			if (dataObjectTypeDocument == null) throw new MyNotFoundException(this._localizer["General_ItemNotFound", dataObject.DataObjectType.Id, nameof(Model.DataObjectType)]);

			if (!(dataObjectTypeDocument.StrategyConfig?.Strategies.Where(s => s.IsActive == IsActive.Active).Count() > 0)) return null;

			float rankScore = 0;
			float totalWeight = 0;
			foreach (var strategy in dataObjectTypeDocument.StrategyConfig?.Strategies.Where(s => s.IsActive == IsActive.Active))
			{
				float? iterScore = await this._baseObjectRankRecalculationStrategyHelperFactory.ChildClass(strategy.StrategyType).AggregateReviewRanks(strategy, dataObject);
				if (iterScore == null) continue;

				rankScore += iterScore.Value * strategy.StrategyWeight;
				totalWeight += strategy.StrategyWeight;
			}

			if (totalWeight == 0) return null;
			return rankScore / totalWeight;
		}

		public async Task<Model.DataObject> SetTags(Guid dataObjectId, IEnumerable<Guid> tagIds, IFieldSet fields = null)
		{
			this._logger.Debug(new MapLogEntry("setting").And("tags", tagIds).And("dataObject", dataObjectId));

			Data.DataObject dataObjectDocument = (await this._dataObjectQuery.Ids(dataObjectId).IsActive(IsActive.Active).Collect()).FirstOrDefault();
			if (dataObjectDocument == null) throw new MyNotFoundException(this._localizer["General_ItemNotFound", dataObjectId, nameof(Model.DataObject)]);
			if (!(await this._authorizationService.CanEditOrOwner(dataObjectDocument.UserId, string.Empty, new string[] { Permission.EditDataObject }, new string[] { "admin" }))) throw new MyValidationException(this._errors.Forbidden.Code, this._errors.Forbidden.Message);

			IEnumerable<Data.Tag> tagDocuments = await this._tagQuery.Ids(tagIds.Distinct()).IsActive(IsActive.Active).Collect();

			if (tagDocuments == null) throw new MyNotFoundException(this._localizer["General_ItemNotFound", tagIds, nameof(Model.Tag)]);
			if (tagDocuments.Select(x => x.Id).Distinct().Intersect(tagIds.Distinct()).Count() < tagIds.Distinct().Count()) throw new MyNotFoundException(this._localizer["General_ItemNotFound", tagIds, nameof(Model.Tag)]);
			if (tagDocuments.Where(x => x.AppliesTo == TagAppliesTo.User).Any()) throw new MyValidationException("Tag can only be applied to Objects");

			dataObjectDocument.AssignedTagIds = tagDocuments.Select(x => x.Id).Distinct();

			FilterDefinition<Data.DataObject> dataObjectFilter = Builders<Data.DataObject>.Filter.Eq(u => u.Id, dataObjectId);

			await this._mongoDatabase.ReplaceOneAsync(dataObjectFilter, dataObjectDocument);

			return await this._builderFactory.Builder<Model.DataObjectBuilder>().Build(fields, dataObjectDocument);
		}
	}
}
