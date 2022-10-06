using Cite.EvalIt.Audit;
using Cite.EvalIt.Authorization;
using Cite.EvalIt.Common;
using Cite.EvalIt.Convention;
using Cite.EvalIt.Data.Context;
using Cite.EvalIt.ErrorCode;
using Cite.EvalIt.Model;
using Cite.EvalIt.Query;
using Cite.EvalIt.Service.DataObject;
using Cite.EvalIt.Service.DataObjectType.BaseObjectRankRecalculationStrategyHelper;
using Cite.EvalIt.Service.DataObjectType.EvaluationOptionHelper;
using Cite.EvalIt.Service.DataObjectType.RankingProfileHelper;
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

namespace Cite.EvalIt.Service.DataObjectType
{
	public class DataObjectTypeService : IDataObjectTypeService
	{
		private readonly EvaluationOptionHelperFactory<EvaluationConfigurationType, IBaseEvaluationOptionHelper> _evaluationOptionHelperFactory;
		private readonly RegistrationInformationInputOptionHelperFactory<RegistrationInformationType, IRegistrationInformationInputOptionHelper> _registrationInformationInputOptionHelperFactory;
		private readonly RankingProfileHelperFactory<RankingProfileType, IBaseRankingProfileHelper> _rankingProfileHelperFactory;
		private readonly BaseObjectRankRecalculationStrategyHelperFactory<ObjectRankRecalculationStrategyType, IBaseObjectRankRecalculationStrategyHelper> _baseObjectRankRecalculationStrategyHelperFactory;
		private readonly DataObjectTypeQuery _dataObjectTypeQuery;
		private readonly DataObjectQuery _dataObjectQuery;
		private readonly AppMongoDbContext _mongoDatabase;
		private readonly BuilderFactory _builderFactory;
		private readonly DeleterFactory _deleterFactory;
		private readonly IConventionService _conventionService;
		private readonly IStringLocalizer<Resources.MySharedResources> _localizer;
		private readonly IAuthorizationService _authorizationService;
		private readonly ILogger<DataObjectService> _logger;
		private readonly ErrorThesaurus _errors;

		public DataObjectTypeService(
            EvaluationOptionHelperFactory<EvaluationConfigurationType, IBaseEvaluationOptionHelper> evaluationOptionHelperFactory,
			RegistrationInformationInputOptionHelperFactory<RegistrationInformationType, IRegistrationInformationInputOptionHelper> registrationInformationInputOptionHelperFactory,
			RankingProfileHelperFactory<RankingProfileType, IBaseRankingProfileHelper> rankingProfileHelperFactory,
			BaseObjectRankRecalculationStrategyHelperFactory<ObjectRankRecalculationStrategyType, IBaseObjectRankRecalculationStrategyHelper> baseObjectRankRecalculationStrategyHelperFactory,
			ILogger<DataObjectService> logger,
			DataObjectTypeQuery dataObjectTypeQuery,
			DataObjectQuery dataObjectQuery,
			AppMongoDbContext mongoDatabase,
			BuilderFactory builderFactory,
			DeleterFactory deleterFactory,
			IConventionService conventionService,
			IStringLocalizer<Resources.MySharedResources> localizer,
			IAuthorizationService authorizationService,
			ErrorThesaurus errors
			)
		{
			this._evaluationOptionHelperFactory = evaluationOptionHelperFactory;
			this._registrationInformationInputOptionHelperFactory = registrationInformationInputOptionHelperFactory;
			this._rankingProfileHelperFactory = rankingProfileHelperFactory;
			this._baseObjectRankRecalculationStrategyHelperFactory = baseObjectRankRecalculationStrategyHelperFactory;
			this._logger = logger;
			this._dataObjectTypeQuery = dataObjectTypeQuery;
			this._dataObjectQuery = dataObjectQuery;
			this._mongoDatabase = mongoDatabase;
			this._builderFactory = builderFactory;
			this._deleterFactory = deleterFactory;
			this._conventionService = conventionService;
			this._localizer = localizer;
			this._authorizationService = authorizationService;
			this._errors = errors;
		}

		public async Task<Model.DataObjectType> PersistAsync(Model.DataObjectTypePersist model, IFieldSet fields = null)
		{
			this._logger.Debug(new MapLogEntry("persisting").And("model", model).And("fields", fields));

			await this._authorizationService.AuthorizeForce(Permission.EditDataObjectType);

			Data.DataObjectType document = null;
			bool objectsExist = false;

			DateTime CreatedDate = DateTime.UtcNow;
			DateTime UpdatedDate = CreatedDate;

			Data.RegistrationInformation info = null;
			Data.EvaluationConfiguration config = null;
			Data.ObjectRankRecalculationStrategyConfiguration strategyConfig = null;

			if (model.Id != null)
			{
				document = (await this._dataObjectTypeQuery.Ids(model.Id.Value).IsActive(IsActive.Active).Collect()).FirstOrDefault();
				if (document == null) throw new MyNotFoundException(this._localizer["General_ItemNotFound", model.Id.Value, nameof(Model.DataObjectType)]);
				if (model.Hash != this._conventionService.HashValue(document.UpdatedAt)) throw new MyValidationException(this._errors.HashConflict.Code, this._errors.HashConflict.Message);

				if (model.SelectedRankingMethodologyId != null)
				{
					var matchingMethodology = document.RankingMethodologies.Where(x => x.IsActive == IsActive.Active && x.Id == model.SelectedRankingMethodologyId.Value).FirstOrDefault();
					if (matchingMethodology == null) throw new MyValidationException("Selected Ranking Methodology does not exist in type");
				}

				// Check for data objects with current data type
				objectsExist = (await this._dataObjectQuery.TypeIds(model.Id.Value).IsActive(IsActive.Active).Collect()).Any();
				
				CreatedDate = document.CreatedAt;
			}

			info = new Data.RegistrationInformation()
			{
				InputOptions = new List<Data.RegistrationInformationInputOption> { }
			};

			config = new Data.EvaluationConfiguration()
			{
				EvalOptions = new List<Data.BaseEvaluationOption> { }
			};

			strategyConfig = new Data.ObjectRankRecalculationStrategyConfiguration()
			{
				Strategies = new List<Data.BaseObjectRankRecalculationStrategy> { }
			};

			if (document != null && objectsExist)
            {
				// DataObjectType exists and DataObjects of that type exist

				// Match document options with their respective model options
				var infoJoined = document.Info.InputOptions.Join(model.Info.InputOptions, d => d.OptionId, m => m.OptionId, (d, m) => new { documentOption = d, modelOption = m });
				if (infoJoined.Count() < document.Info.InputOptions.Count()) throw new MyValidationException("Model information options don't match previous document's options");

				foreach( var x in infoJoined) if (x.modelOption.IsActive == IsActive.Inactive) x.documentOption.IsActive = IsActive.Inactive;

				var previousInfoIds = infoJoined.Select(x => x.modelOption.OptionId);
				var newInfoOptions = model.Info.InputOptions.Where(x => !previousInfoIds.Contains(x.OptionId));

				info.InputOptions.AddRange(infoJoined.Select(j => j.documentOption));

				foreach (var x in newInfoOptions)
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

				var configJoined = document.Config.EvalOptions.Join(model.Config.EvalOptions, d => d.OptionId, m => m.OptionId, (d, m) => new { documentOption = d, modelOption = m });
				if (configJoined.Count() < document.Config.EvalOptions.Count()) throw new MyValidationException("Model evaluation options don't match previous document's options");

				foreach (var x in configJoined) if (x.modelOption.IsActive == IsActive.Inactive) x.documentOption.IsActive = IsActive.Inactive; 

				var previousConfigIds = configJoined.Select(x => x.modelOption.OptionId);
				var newConfigOptions = model.Config.EvalOptions.Where(x => !previousConfigIds.Contains(x.OptionId));

				config.EvalOptions.AddRange(configJoined.Select(j => j.documentOption));

				foreach (var x in newConfigOptions)
				{
					var temp = this._evaluationOptionHelperFactory.ChildClass(x.OptionType).NewData();
					temp.Label = x.Label;
					temp.IsMandatory = x.IsMandatory;
					temp.OptionId = x.OptionId ?? Guid.NewGuid();
					temp.OptionType = x.OptionType;
					temp.IsActive = x.IsActive;
					this._evaluationOptionHelperFactory.ChildClass(x.OptionType).PersistChildClassFields(temp, (BaseEvaluationOptionPersist)x);

					config.EvalOptions.Add(temp);
				}

			}
			else
            {
				// Either DataObjectType doesn't exist or no DataObjects of that type exist

				// Create Registration Information Object from active options of model
				foreach (var x in model.Info.InputOptions.Where(x => x.IsActive == IsActive.Active))
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

                // Creating Evaluation Configuration Object from model
                foreach (var x in model.Config.EvalOptions.Where(x => x.IsActive == IsActive.Active))
				{
                    var temp = this._evaluationOptionHelperFactory.ChildClass(x.OptionType).NewData();
                    temp.Label = x.Label;
                    temp.IsMandatory = x.IsMandatory;
                    temp.OptionId = x.OptionId ?? Guid.NewGuid();
                    temp.OptionType = x.OptionType;
					temp.IsActive = x.IsActive;
					this._evaluationOptionHelperFactory.ChildClass(x.OptionType).PersistChildClassFields(temp, (BaseEvaluationOptionPersist)x);

                    config.EvalOptions.Add(temp);
                }
			}

			foreach (var x in model.StrategyConfig.Strategies)
			{
				var temp = this._baseObjectRankRecalculationStrategyHelperFactory.ChildClass(x.StrategyType).NewData();
				temp.Id = x.Id ?? Guid.NewGuid();
				temp.StrategyType = x.StrategyType;
				temp.StrategyWeight = x.StrategyWeight;
				temp.IsActive = x.IsActive;
				this._baseObjectRankRecalculationStrategyHelperFactory.ChildClass(x.StrategyType).PersistChildClassFields(temp, (BaseObjectRankRecalculationStrategyPersist)x);

				strategyConfig.Strategies.Add(temp);
			}


			// Creating Base DataObjectType Object
			Data.DataObjectType data = new Data.DataObjectType
			{
				Id = document == null ? Guid.NewGuid() : model.Id.Value,
				Name = model.Name,
				Config = config,
				Info = info,
				StrategyConfig = strategyConfig,
				IsActive = IsActive.Active,
				CreatedAt = CreatedDate,
				UpdatedAt = UpdatedDate,
				MultipleReviewOption = model.MultipleReviewOption,
				RankingMethodologies = document == null ? new List<Data.DataObjectTypeRankingMethodology>() : document.RankingMethodologies,
				SelectedRankingMethodologyId = document == null ? null : model.SelectedRankingMethodologyId
			};

			// Persist Item
			FilterDefinition<Data.DataObjectType> filter = Builders<Data.DataObjectType>.Filter.Eq(u => u.Id, model.Id);

			if (document != null) await this._mongoDatabase.ReplaceOneAsync(filter, data);
			else await this._mongoDatabase.InsertOneAsync(data);

			Model.DataObjectType persisted = await this._builderFactory.Builder<Model.DataObjectTypeBuilder>().Build(FieldSet.Build(fields, nameof(Model.DataObjectType.Id), nameof(Model.DataObjectType.Hash)), data);

			return persisted;
        }
		
		public async Task DeleteAndSaveAsync(Guid id)
		{
			this._logger.Debug("deleting data object type {id}", id);

			await this._authorizationService.AuthorizeForce(Permission.DeleteDataObjectType);

			await this._deleterFactory.Deleter<Model.DataObjectTypeDeleter>().DeleteAndSave(id.AsArray());
		}

		public async Task<Model.DataObjectTypeRankingMethodology> PersistRankingMethodology(Guid dataObjectTypeId, DataObjectTypeRankingMethodologyPersist model, IFieldSet fields = null)
		{
			this._logger.Debug(new MapLogEntry("persisting").And("model", model).And("fields", fields));

			await this._authorizationService.AuthorizeForce(Permission.EditDataObjectType);

			Data.DataObjectType dataObjectTypeDocument = (await this._dataObjectTypeQuery.Ids(dataObjectTypeId).IsActive(IsActive.Active).Collect()).FirstOrDefault();
			if (dataObjectTypeDocument == null) throw new MyNotFoundException(this._localizer["General_ItemNotFound", dataObjectTypeId, nameof(Model.DataObjectType)]);

			Data.DataObjectTypeRankingMethodology document = null;
			DateTime CreatedDate = DateTime.UtcNow;
			DateTime UpdatedDate = CreatedDate;


			if (model.Id != null)
            {
				document = dataObjectTypeDocument.RankingMethodologies?.Where(x => x.Id == model.Id).FirstOrDefault();
				if (document == null) throw new MyNotFoundException(this._localizer["General_ItemNotFound", model.Id, nameof(Model.DataObjectTypeRankingMethodology)]);
				if (model.Hash != this._conventionService.HashValue(document.UpdatedAt)) throw new MyValidationException(this._errors.HashConflict.Code, this._errors.HashConflict.Message);

				CreatedDate = document.CreatedAt;

				dataObjectTypeDocument.RankingMethodologies = dataObjectTypeDocument.RankingMethodologies.Where(x => x.Id != model.Id).ToList();
			}

			Data.RankingConfiguration rankingConfig = new Data.RankingConfiguration()
			{
				RankingProfiles = new List<Data.BaseRankingProfile>()
			};

			foreach(var x in model.Config.RankingProfiles)
            {
				var temp = this._rankingProfileHelperFactory.ChildClass(x.ProfileType).NewData();
				temp.OptionId = x.OptionId;
				temp.OptionWeight = x.OptionWeight;
				temp.ProfileType = x.ProfileType;
				temp.MappedUserValues = x.MappedUserValues;
				temp.IsActive = x.IsActive;
				this._rankingProfileHelperFactory.ChildClass(x.ProfileType).PersistChildClassFields(temp, (BaseRankingProfilePersist)x);

				rankingConfig.RankingProfiles.Add(temp);
            }

			Data.DataObjectTypeRankingMethodology data = new Data.DataObjectTypeRankingMethodology
			{
				Id = document == null ? Guid.NewGuid() : model.Id.Value,
				Name = model.Name,
				CreatedAt = CreatedDate,
				UpdatedAt = UpdatedDate,
				IsActive = IsActive.Active,
				Config = rankingConfig
			};

			if (dataObjectTypeDocument.RankingMethodologies == null) dataObjectTypeDocument.RankingMethodologies = new List<Data.DataObjectTypeRankingMethodology>();
			
			dataObjectTypeDocument.RankingMethodologies.Add(data);
			dataObjectTypeDocument.UpdatedAt = UpdatedDate;

			// Persist Item
			FilterDefinition<Data.DataObjectType> filter = Builders<Data.DataObjectType>.Filter.Eq(u => u.Id, dataObjectTypeId);

			await this._mongoDatabase.ReplaceOneAsync(filter, dataObjectTypeDocument);

			Model.DataObjectTypeRankingMethodology persisted = await this._builderFactory.Builder<Model.DataObjectTypeRankingMethodologyBuilder>().Build(FieldSet.Build(fields, nameof(Model.DataObjectTypeRankingMethodology.Id), nameof(Model.DataObjectTypeRankingMethodology.Hash)), data);

			return persisted;
		}

		public async Task<Model.DataObjectTypeRankingMethodology> DeleteRankingMethodology(Guid dataObjectTypeId, Guid rankingConfigurationId, IFieldSet fields = null)
		{
			this._logger.Debug(new MapLogEntry("deleting").And("rankingConfiguration", rankingConfigurationId).And("dataObjectType", dataObjectTypeId));

			await this._authorizationService.AuthorizeForce(Permission.EditDataObjectType);

			Data.DataObjectType dataObjectTypeDocument = (await this._dataObjectTypeQuery.Ids(dataObjectTypeId).IsActive(IsActive.Active).Collect()).FirstOrDefault();
			if (dataObjectTypeDocument == null) throw new MyNotFoundException(this._localizer["General_ItemNotFound", dataObjectTypeId, nameof(Model.DataObjectType)]);

			var methodData = dataObjectTypeDocument.RankingMethodologies?.Where(x => x.Id == rankingConfigurationId)?.FirstOrDefault();
			if (methodData == null) throw new MyNotFoundException(this._localizer["General_ItemNotFound", rankingConfigurationId, nameof(Model.DataObjectTypeRankingMethodology)]);

			methodData.IsActive = IsActive.Inactive;

			if (rankingConfigurationId == dataObjectTypeDocument.SelectedRankingMethodologyId) dataObjectTypeDocument.SelectedRankingMethodologyId = null;

			FilterDefinition<Data.DataObjectType> filter = Builders<Data.DataObjectType>.Filter.Eq(u => u.Id, dataObjectTypeId);

			await this._mongoDatabase.ReplaceOneAsync(filter, dataObjectTypeDocument);

			return await this._builderFactory.Builder<Model.DataObjectTypeRankingMethodologyBuilder>().Build(fields, methodData);
		}
	}
}
