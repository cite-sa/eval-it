using Cite.EvalIt.Authorization;
using Cite.EvalIt.Common;
using Cite.EvalIt.Convention;
using Cite.EvalIt.ErrorCode;
using Cite.EvalIt.Model;
using Cite.EvalIt.Query;
using Cite.EvalIt.Service.DataObjectType.EvaluationOptionHelper;
using Cite.EvalIt.Service.DataObjectType.ReviewEvaluationHelper;
using Cite.Tools.Cipher;
using Cite.Tools.Data.Builder;
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
using Cite.EvalIt.Service.DataObjectType.RankingProfileHelper;
using static Cite.EvalIt.Common.NotificationFieldData;
using Cite.EvalIt.IntegrationEvent.Outbox;
using Cite.Tools.Json;

namespace Cite.EvalIt.Service.DataObjectReview
{
	public class DataObjectReviewService : IDataObjectReviewService
	{
		private readonly NotificationsConfig _config;
		private readonly EvaluationOptionHelperFactory<EvaluationConfigurationType, IBaseEvaluationOptionHelper> _evaluationOptionHelperFactory;
		private readonly ReviewEvaluationHelperFactory<ReviewEvaluationType, IReviewEvaluationHelper> _reviewEvaluationHelperFactory;
        private readonly RankingProfileHelperFactory<RankingProfileType, IBaseRankingProfileHelper> _rankingProfileHelperFactory;
		private readonly DataObjectTypeQuery _dataObjectTypeQuery;
		private readonly UserQuery _userQuery;
		private readonly DataObjectQuery _dataObjectQuery;
		private readonly ILogger<DataObjectReviewService> _logger;
		private readonly AppMongoDbContext _mongoDatabase;
		private readonly BuilderFactory _builderFactory;
		//private readonly DeleterFactory _deleterFactory;
		private readonly IConventionService _conventionService;
		private readonly IStringLocalizer<Resources.MySharedResources> _localizer;
		private readonly IAuthorizationService _authorizationService;
		private readonly JsonHandlingService _jsonHandlingService;
		private readonly ICipherService _cipherService;
		private readonly INotificationIntegrationEventHandler _notificationIntegrationEventHandler;
		private readonly ErrorThesaurus _errors;

		public DataObjectReviewService(
			NotificationsConfig config,
			EvaluationOptionHelperFactory<EvaluationConfigurationType, IBaseEvaluationOptionHelper> evaluationOptionHelperFactory,
			ReviewEvaluationHelperFactory<ReviewEvaluationType, IReviewEvaluationHelper> reviewEvaluationHelperFactory,
			RankingProfileHelperFactory<RankingProfileType, IBaseRankingProfileHelper> rankingProfileHelperFactory,
			DataObjectTypeQuery dataObjectTypeQuery,
			UserQuery userQuery,
			DataObjectQuery dataObjectQuery,
            ILogger<DataObjectReviewService> logger,
			AppMongoDbContext mongoDatabase,
			BuilderFactory builderFactory,
			//DeleterFactory deleterFactory,
			IConventionService conventionService,
			IStringLocalizer<Resources.MySharedResources> localizer,
			IAuthorizationService authorizationService,
			JsonHandlingService jsonHandlingService,
			ICipherService cipherService,
			INotificationIntegrationEventHandler notificationIntegrationEventHandler,
			ErrorThesaurus errors
			)
		{
			this._config = config;
			this._evaluationOptionHelperFactory = evaluationOptionHelperFactory;
			this._reviewEvaluationHelperFactory = reviewEvaluationHelperFactory;
			this._rankingProfileHelperFactory = rankingProfileHelperFactory;
			this._dataObjectTypeQuery = dataObjectTypeQuery;
			this._userQuery = userQuery;
			this._dataObjectQuery = dataObjectQuery;
			this._logger = logger;
			this._mongoDatabase = mongoDatabase;
			this._builderFactory = builderFactory;
			//this._deleterFactory = deleterFactory;
			this._conventionService = conventionService;
			this._localizer = localizer;
			this._authorizationService = authorizationService;
			this._jsonHandlingService = jsonHandlingService;
			this._cipherService = cipherService;
			this._notificationIntegrationEventHandler = notificationIntegrationEventHandler;
			this._errors = errors;
		}

		public async Task<Model.DataObjectReview> PersistAsync(Guid currUserId, Guid dataObjectId, DataObjectReviewPersist review, IFieldSet fields = null)
		{
			this._logger.Debug(new MapLogEntry("persisting").And("review", review.Id).And("dataObject", dataObjectId));

			if (!(await this._authorizationService.CanEditOrOwner(review.UserId, review.UserIdHash, new string[] { Permission.EditDataObjectReview }, new string[] { "admin" }))) throw new MyValidationException(this._errors.Forbidden.Code, this._errors.Forbidden.Message);

			Data.DataObject dataObjectDocument = (await this._dataObjectQuery.Ids(dataObjectId).IsActive(IsActive.Active).Collect()).FirstOrDefault();
			if (dataObjectDocument == null ) throw new MyNotFoundException(this._localizer["General_ItemNotFound", dataObjectId, nameof(Model.DataObject)]);

			Data.DataObjectType selfContainedType = null;
			Data.DataObjectType dataObjectType = (await this._dataObjectTypeQuery.Ids(dataObjectDocument.DataObjectTypeId).IsActive(IsActive.Active).Collect()).FirstOrDefault();
			if (dataObjectType.MultipleReviewOption == false)
			{
				string authorHash = review.UserIdHash ?? (review.UserId != null ? this._cipherService.ToSha256(review.UserId.ToString()) : null) ?? this._cipherService.ToSha256(currUserId.ToString());
				if (dataObjectDocument.Reviews.Where(x => (x.UserIdHash == authorHash || (x.UserId != null && this._cipherService.ToSha256(x.UserId.ToString()) == authorHash)) && x.Id != review.Id && x.IsActive == IsActive.Active).Count() > 0) throw new MyValidationException("User has already left a review for this object");
			}

			DateTime CreatedDate = DateTime.UtcNow;
			DateTime UpdatedDate = CreatedDate;

			Data.DataObjectReview oldReview = null;
			Guid? userId = null;
			string userIdHash = null;

			if (review.UserId != null)
			{
				if (review.Anonymity == ReviewAnonymity.Signed) userId = review.UserId;
				else userIdHash = this._cipherService.ToSha256(review.UserId.ToString());
			}
			else
			{
				if (review.Anonymity == ReviewAnonymity.Signed) userId = currUserId;
				else userIdHash = review.UserIdHash ?? this._cipherService.ToSha256(currUserId.ToString());
			}

			if (review.Id != null)
			{
				oldReview = dataObjectDocument.Reviews.Where(x => x.Id == review.Id)?.FirstOrDefault();
				if (oldReview == null) throw new MyNotFoundException(this._localizer["General_ItemNotFound", review.Id.Value, nameof(Model.DataObjectReview)]);
				if (review.Hash != this._conventionService.HashValue(oldReview.UpdatedAt)) throw new MyValidationException(this._errors.HashConflict.Code, this._errors.HashConflict.Message);

				bool hasUserChanged = false;

				// New user must be the same as the previous one
				if (userId != null)
				{
					if (oldReview.UserId != null && userId != oldReview.UserId) hasUserChanged = true;
					else if (oldReview.UserIdHash != null && this._cipherService.ToSha256(userId.ToString()) != oldReview.UserIdHash) hasUserChanged = true;
				}
				else
				{
					if (oldReview.UserIdHash != null && userIdHash != oldReview.UserIdHash) hasUserChanged = true;
					else if (oldReview.UserId != null && this._cipherService.ToSha256(oldReview.UserId.ToString()) != userIdHash) hasUserChanged = true;
				}

				if(hasUserChanged) throw new MyValidationException("New user must be the same as the previous one");

				CreatedDate = oldReview.CreatedAt;

				if (review.DataObjectType != null)
				{
					Data.EvaluationConfiguration config = new Data.EvaluationConfiguration()
					{
						EvalOptions = new List<Data.BaseEvaluationOption>()
					};

					foreach (var x in review.DataObjectType.Config.EvalOptions)
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

					selfContainedType = new Data.DataObjectType
					{
						Id = dataObjectType.Id,
						Name = dataObjectType.Name,
						Config = config,
						IsActive = dataObjectType.IsActive,
						CreatedAt = dataObjectType.CreatedAt,
						UpdatedAt = dataObjectType.UpdatedAt
					};
				}
				else selfContainedType = dataObjectType;

				dataObjectDocument.Reviews = dataObjectDocument.Reviews.Where(x => x.Id != review.Id);
			}
			else
			{
				selfContainedType = new Data.DataObjectType
				{
					Id = dataObjectType.Id,
					Name = dataObjectType.Name,
					Config = new Data.EvaluationConfiguration
					{
						EvalOptions = dataObjectType.Config.EvalOptions,
					},
					IsActive = dataObjectType.IsActive,
					CreatedAt = dataObjectType.CreatedAt,
					UpdatedAt = dataObjectType.UpdatedAt
				};
			}

			Data.ReviewEvaluationData evaluationData = new Data.ReviewEvaluationData()
			{
				Evaluations = new List<Data.ReviewEvaluation>()
			};

			foreach(var x in review.EvaluationData.Evaluations)
            {
				var temp = this._reviewEvaluationHelperFactory.ChildClass(x.EvaluationType).NewData();
				temp.OptionId = x.OptionId;
				temp.EvaluationType = x.EvaluationType;
				this._reviewEvaluationHelperFactory.ChildClass(x.EvaluationType).PersistChildClassFields(temp, (ReviewEvaluationPersist)x);

				evaluationData.Evaluations.Add(temp);
			}

			Data.DataObjectReview reviewData = new Data.DataObjectReview()
			{
				Id = review.Id == null ? Guid.NewGuid() : review.Id.Value,
				Anonymity = review.Anonymity,
				Visibility = review.Visibility,
				EvaluationData = evaluationData,
				UserId = userId,
				UserIdHash = userIdHash,
				DataObjectType = selfContainedType,
				RankScore = review.Id == null ? null : oldReview.RankScore,
				Feedback = review.Id == null ? new List<Data.DataObjectReviewFeedback>() : oldReview.Feedback,
				IsActive = IsActive.Active,
				CreatedAt = CreatedDate,
				UpdatedAt = UpdatedDate
			};

			dataObjectDocument.Reviews = dataObjectDocument.Reviews.Append(reviewData);

			FilterDefinition<Data.DataObject> dataObjectFilter = Builders<Data.DataObject>.Filter.Eq(u => u.Id, dataObjectId);

			await this._mongoDatabase.ReplaceOneAsync(dataObjectFilter, dataObjectDocument);

			Guid reviewedUserId = dataObjectDocument.UserId;
			Guid? reviewingUserId = userId;
			Guid reviewId = reviewData.Id;

			if (review.Id == null) // Only send notification when creating a new review
			{
				if (review.Visibility == ReviewVisibility.Public && review.Anonymity == ReviewAnonymity.Signed && reviewingUserId != null) await this.SendUserSignedReviewNotification(reviewedUserId, reviewingUserId.Value, reviewId, dataObjectDocument.Title, dataObjectId);
				else if (review.Visibility == ReviewVisibility.Trusted && reviewingUserId != null)
				{
					Data.User reviewingUser = ( await this._userQuery.Ids(reviewingUserId.Value).IsActive(IsActive.Active).Collect()).FirstOrDefault();
					if( reviewingUser != null && reviewingUser.UserNetworkIds.Select(u => u.Id).Contains(reviewedUserId)) await this.SendUserSignedReviewNotification(reviewedUserId, reviewingUserId.Value, reviewId, dataObjectDocument.Title, dataObjectId);
				}
				else if (review.Visibility == ReviewVisibility.Public && review.Anonymity == ReviewAnonymity.Anonymous) await this.SendUserUnsignedReviewNotification(reviewedUserId, reviewId, dataObjectDocument.Title, dataObjectId);
			}
			return await this._builderFactory.Builder<Model.DataObjectReviewBuilder>().Build(fields, reviewData);
		}

		private async Task SendUserSignedReviewNotification(Guid reviewedUserId, Guid reviewingUserId, Guid reviewId, string objectName, Guid objectId)
		{

			IEnumerable<Data.User> userDocuments = await this._userQuery.Ids(new Guid[] { reviewedUserId, reviewingUserId }).IsActive(IsActive.Active).Collect();
			if (userDocuments.Count() < 2 && reviewedUserId != reviewingUserId) throw new MyNotFoundException(this._localizer["Items_NotFound", nameof(Model.User)]);

			Data.User reviewedUser = userDocuments.Where(u => u.Id == reviewedUserId).FirstOrDefault();
			Data.User reviewingUser = userDocuments.Where(u => u.Id == reviewingUserId).FirstOrDefault();

			if (!this._config.UserReviewSigned.NotificationKey.HasValue) new MyApplicationException(this._errors.SystemError.Code, this._errors.SystemError.Message);
			NotificationFieldData notificationUserSignedReviewData = new NotificationFieldData
			{
				Fields = new List<FieldInfo>()
				   {
						new FieldInfo { Key = this._config.UserReviewSigned.Template.Name, Type = FieldInfo.DataType.String, Value = reviewedUser.Name },
						new FieldInfo { Key = this._config.UserReviewSigned.Template.TargetUserId, Type = FieldInfo.DataType.String, Value = reviewingUser.Id.ToString()},
						new FieldInfo { Key = this._config.UserReviewSigned.Template.TargetUserName, Type = FieldInfo.DataType.String, Value = reviewingUser.Name},
						new FieldInfo { Key = this._config.UserReviewSigned.Template.TargetReviewId, Type = FieldInfo.DataType.String, Value = reviewId.ToString()},
						new FieldInfo { Key = this._config.UserReviewSigned.Template.TargetObjectName, Type = FieldInfo.DataType.String, Value = objectName },
						new FieldInfo { Key = this._config.UserReviewSigned.Template.TargetObjectId, Type = FieldInfo.DataType.String, Value = objectId.ToString()}
				   }
			};

			NotificationIntegrationEvent notificationUserSignedReviewIntegrationEvent = new NotificationIntegrationEvent
			{
				UserId = reviewedUser.Id,
				NotificationType = this._config.UserReviewSigned.NotificationKey
			};
			notificationUserSignedReviewIntegrationEvent.Data = this._jsonHandlingService.ToJsonSafe(notificationUserSignedReviewData);

			await this._notificationIntegrationEventHandler.HandleAsync(notificationUserSignedReviewIntegrationEvent);
		}

		private async Task SendUserUnsignedReviewNotification(Guid reviewedUserId, Guid reviewId, string objectName, Guid objectId)
		{

			IEnumerable<Data.User> userDocuments = await this._userQuery.Ids(new Guid[] { reviewedUserId }).IsActive(IsActive.Active).Collect();
			if (userDocuments.Count() < 1) throw new MyNotFoundException(this._localizer["Items_NotFound", nameof(Model.User)]);

			Data.User reviewedUser = userDocuments.Where(u => u.Id == reviewedUserId).FirstOrDefault();

			if (!this._config.UserReviewUnsigned.NotificationKey.HasValue) new MyApplicationException(this._errors.SystemError.Code, this._errors.SystemError.Message);
			NotificationFieldData notificationUserUnsignedReviewData = new NotificationFieldData
			{
				Fields = new List<FieldInfo>()
				   {
						new FieldInfo { Key = this._config.UserReviewUnsigned.Template.Name, Type = FieldInfo.DataType.String, Value = reviewedUser.Name },
						new FieldInfo { Key = this._config.UserReviewUnsigned.Template.TargetReviewId, Type = FieldInfo.DataType.String, Value = reviewId.ToString()},
						new FieldInfo { Key = this._config.UserReviewUnsigned.Template.TargetObjectName, Type = FieldInfo.DataType.String, Value = objectName },
						new FieldInfo { Key = this._config.UserReviewUnsigned.Template.TargetObjectId, Type = FieldInfo.DataType.String, Value = objectId.ToString()}
				   }
			};

			NotificationIntegrationEvent notificationUserUnsignedReviewIntegrationEvent = new NotificationIntegrationEvent
			{
				UserId = reviewedUser.Id,
				NotificationType = this._config.UserReviewUnsigned.NotificationKey
			};
			notificationUserUnsignedReviewIntegrationEvent.Data = this._jsonHandlingService.ToJsonSafe(notificationUserUnsignedReviewData);

			await this._notificationIntegrationEventHandler.HandleAsync(notificationUserUnsignedReviewIntegrationEvent);
		}

		public async Task DeleteAndSaveAsync(Guid currUserId, Guid dataObjectId, Guid reviewId)
		{
			this._logger.Debug(new MapLogEntry("deleting").And("review", reviewId).And("dataObject", dataObjectId));

			await this._authorizationService.AuthorizeForce(Permission.DeleteDataObjectReview);

			Data.DataObject dataObjectDocument = (await this._dataObjectQuery.Ids(dataObjectId).IsActive(IsActive.Active).Collect()).FirstOrDefault();
			if (dataObjectDocument == null) throw new MyNotFoundException(this._localizer["General_ItemNotFound", dataObjectId, nameof(Model.DataObject)]);

			var reviewData = dataObjectDocument.Reviews?.Where(x => x.Id == reviewId)?.FirstOrDefault();
			if (reviewData == null) throw new MyNotFoundException(this._localizer["General_ItemNotFound", reviewId, nameof(Model.DataObjectReview)]);

			if (reviewData.UserId != null) await this._authorizationService.AuthorizeOwnerForce(new OwnedResource() { UserIds = new List<Guid>() { reviewData.UserId.Value } });
			else if (this._cipherService.ToSha256(currUserId.ToString()) != reviewData.UserIdHash) throw new MyValidationException(this._errors.Forbidden.Code, this._errors.Forbidden.Message);

			reviewData.IsActive = IsActive.Inactive;

			dataObjectDocument.Reviews = dataObjectDocument.Reviews.Where(x => x.Id != reviewId).Append(reviewData);

			FilterDefinition<Data.DataObject> dataObjectFilter = Builders<Data.DataObject>.Filter.Eq(u => u.Id, dataObjectId);

			await this._mongoDatabase.ReplaceOneAsync(dataObjectFilter, dataObjectDocument);
		}

		public async Task<float?> ReviewRankCalculate(Data.DataObjectReview review)
        {
			this._logger.Debug(new MapLogEntry("calculating rank for").And("review", review.Id));

			Data.DataObjectType dataObjectTypeDocument = (await this._dataObjectTypeQuery.Ids(review.DataObjectType.Id).IsActive(IsActive.Active).Collect()).FirstOrDefault();
			if (dataObjectTypeDocument == null) throw new MyNotFoundException(this._localizer["General_ItemNotFound", review.DataObjectType.Id, nameof(Model.DataObjectType)]);

			Data.DataObjectTypeRankingMethodology currentMethodology = null;
			if (dataObjectTypeDocument.SelectedRankingMethodologyId != null) currentMethodology = dataObjectTypeDocument.RankingMethodologies?.Where(x => x.IsActive == IsActive.Active && x.Id == dataObjectTypeDocument.SelectedRankingMethodologyId.Value).FirstOrDefault();
			if (currentMethodology == null) currentMethodology = dataObjectTypeDocument.RankingMethodologies?.Where(x => x.IsActive == IsActive.Active).FirstOrDefault();
			if (currentMethodology == null) return null;

			float weightedSum = 0;
			float weights = 0;

            foreach (Data.ReviewEvaluation evaluation in review.EvaluationData.Evaluations)
            {
				var correspondingProfile = currentMethodology.Config.RankingProfiles.Where(x => x.OptionId == evaluation.OptionId).FirstOrDefault();
				if (correspondingProfile == null) continue;

				var correspondingOption = review.DataObjectType.Config.EvalOptions.Where(x => x.OptionId == evaluation.OptionId).FirstOrDefault();
				if (correspondingOption == null) continue;

				var optionRank = this._rankingProfileHelperFactory.ChildClass(correspondingProfile.ProfileType).CalculateOptionRank(correspondingProfile, correspondingOption, evaluation);
				if (optionRank == null) continue;

				weightedSum += optionRank.Value*correspondingProfile.OptionWeight;
				weights += correspondingProfile.OptionWeight;
			}

			if (weights == 0) return null;

			return weightedSum / weights;
		}
	}
}
