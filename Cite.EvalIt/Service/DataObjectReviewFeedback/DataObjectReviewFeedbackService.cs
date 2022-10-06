using Cite.EvalIt.Authorization;
using Cite.EvalIt.Common;
using Cite.EvalIt.Convention;
using Cite.EvalIt.ErrorCode;
using Cite.EvalIt.Model;
using Cite.EvalIt.Query;
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
using Cite.EvalIt.IntegrationEvent.Outbox;

namespace Cite.EvalIt.Service.DataObjectReviewFeedback
{
	public class DataObjectReviewFeedbackService : IDataObjectReviewFeedbackService
	{
		private readonly NotificationsConfig _config;
		private readonly DataObjectQuery _dataObjectQuery;
        private readonly ILogger<DataObjectReviewFeedbackService> _logger;
        private readonly AppMongoDbContext _mongoDatabase;
        private readonly BuilderFactory _builderFactory;
        //private readonly DeleterFactory _deleterFactory;
        private readonly IConventionService _conventionService;
        private readonly IStringLocalizer<Resources.MySharedResources> _localizer;
		private readonly IAuthorizationService _authorizationService;
		private readonly ICipherService _cipherService;
		private readonly ErrorThesaurus _errors;

		public DataObjectReviewFeedbackService(
			NotificationsConfig config,
			DataObjectQuery dataObjectQuery,
            ILogger<DataObjectReviewFeedbackService> logger,
			AppMongoDbContext mongoDatabase,
            BuilderFactory builderFactory,
            //DeleterFactory deleterFactory,
            IConventionService conventionService,
			IStringLocalizer<Resources.MySharedResources> localizer,
			IAuthorizationService authorizationService,
			ICipherService cipherService,
            ErrorThesaurus errors
            )
		{
			this._config = config;
            this._dataObjectQuery = dataObjectQuery;
            this._logger = logger;
			this._mongoDatabase = mongoDatabase;
            this._builderFactory = builderFactory;
            //this._deleterFactory = deleterFactory;
            this._conventionService = conventionService;
			this._localizer = localizer;
			this._authorizationService = authorizationService;
			this._cipherService = cipherService;
			this._errors = errors;
		}

		public async Task<Model.DataObjectReviewFeedback> PersistAsync(Guid currUserId, Guid dataObjectId, Guid reviewId, DataObjectReviewFeedbackPersist feedback, IFieldSet fields = null)
        {
			this._logger.Debug(new MapLogEntry("persisting").And("feedback", feedback.Id).And("dataObjectReview", reviewId).And("dataObject", dataObjectId));

			await this._authorizationService.AuthorizeForce(Permission.EditDataObjectReviewFeedback);

			Data.DataObject dataObjectDocument = (await this._dataObjectQuery.Ids(dataObjectId).IsActive(IsActive.Active).Collect()).FirstOrDefault();
			if (dataObjectDocument == null) throw new MyNotFoundException(this._localizer["General_ItemNotFound", dataObjectId, nameof(Model.DataObject)]);

			Data.DataObjectReview reviewDocument = dataObjectDocument.Reviews?.Where(x => x.Id == reviewId)?.FirstOrDefault();
			if (reviewDocument == null) throw new MyNotFoundException(this._localizer["General_ItemNotFound", reviewId, nameof(Model.DataObjectReview)]);

			DateTime CreatedDate = DateTime.UtcNow;
			DateTime UpdatedDate = CreatedDate;

			Guid? userId = null;
			string userIdHash = null;

			if (feedback.UserId != null)
			{
				if (feedback.Anonymity == ReviewAnonymity.Signed) userId = feedback.UserId;
				else userIdHash = this._cipherService.ToSha256(feedback.UserId.ToString());
			}
			else
			{
				if (feedback.Anonymity == ReviewAnonymity.Signed) userId = currUserId;
				else userIdHash = feedback.UserIdHash;
			}

			if (feedback.Id != null)
			{
				if (feedback.UserId != null) await this._authorizationService.AuthorizeOwnerForce(new OwnedResource() { UserIds = new List<Guid>() { feedback.UserId.Value } });
				else if (this._cipherService.ToSha256(currUserId.ToString()) != feedback.UserIdHash) throw new MyValidationException(this._errors.Forbidden.Code, this._errors.Forbidden.Message);

				Data.DataObjectReviewFeedback oldFeedback = reviewDocument.Feedback.Where(x => x.Id == feedback.Id)?.FirstOrDefault();
				if (oldFeedback == null) throw new MyNotFoundException(this._localizer["General_ItemNotFound", feedback.Id.Value, nameof(Model.DataObjectReview)]);
				if (feedback.Hash != this._conventionService.HashValue(oldFeedback.UpdatedAt)) throw new MyValidationException(this._errors.HashConflict.Code, this._errors.HashConflict.Message);

				bool hasUserChanged = false;

				// New user must be the same as the previous one
				if (feedback.UserId != null)
				{
					if (oldFeedback.UserId != null && feedback.UserId != oldFeedback.UserId) hasUserChanged = true;
					else if (oldFeedback.UserIdHash != null && this._cipherService.ToSha256(feedback.UserId.ToString()) != oldFeedback.UserIdHash) hasUserChanged = true;
				}
				else if (feedback.UserIdHash != null)
				{
					if (oldFeedback.UserIdHash != null && feedback.UserIdHash != oldFeedback.UserIdHash) hasUserChanged = true;
					else if (oldFeedback.UserId != null && this._cipherService.ToSha256(oldFeedback.UserId.ToString()) != feedback.UserIdHash) hasUserChanged = true;
				}

				if (hasUserChanged) throw new MyValidationException("New user must be the same as the previous one");

				CreatedDate = oldFeedback.CreatedAt;

				reviewDocument.Feedback = reviewDocument.Feedback.Where(x => x.Id != feedback.Id);
			}
			else
            {
				if (userId != null) reviewDocument.Feedback = reviewDocument.Feedback.Where(x => x.UserId != userId && x.UserIdHash != this._cipherService.ToSha256(feedback.UserId.ToString()));
				else if (userIdHash != null) reviewDocument.Feedback = reviewDocument.Feedback.Where(x => x.UserIdHash != userIdHash);
            }

			Data.DataObjectReviewFeedback feedbackData = new Data.DataObjectReviewFeedback()
			{
				Id = feedback.Id == null ? Guid.NewGuid() : feedback.Id.Value,
				Anonymity = feedback.Anonymity,
				Visibility = feedback.Visibility,
				FeedbackData = new Data.FeedbackData()
				{
					Like = feedback.FeedbackData.Like
				},
				UserId = userId,
				UserIdHash = userIdHash,
				IsActive = IsActive.Active,
				CreatedAt = CreatedDate,
				UpdatedAt = UpdatedDate
			};

			reviewDocument.Feedback = reviewDocument.Feedback.Append(feedbackData);
			dataObjectDocument.Reviews = dataObjectDocument.Reviews.Where(x => x.Id != reviewDocument.Id).Append(reviewDocument);

			FilterDefinition<Data.DataObject> dataObjectFilter = Builders<Data.DataObject>.Filter.Eq(u => u.Id, dataObjectId);
			
			await this._mongoDatabase.ReplaceOneAsync(dataObjectFilter, dataObjectDocument);

			return await this._builderFactory.Builder<Model.DataObjectReviewFeedbackBuilder>().Build(fields, feedbackData);
		}

		public async Task DeleteAndSaveAsync(Guid currUserId, Guid dataObjectId, Guid reviewId, Guid feedbackId)
        {
			this._logger.Debug(new MapLogEntry("deleting").And("feedback", feedbackId).And("dataObjectReview", reviewId).And("dataObject", dataObjectId));

			await this._authorizationService.AuthorizeForce(Permission.DeleteDataObjectReviewFeedback);

			Data.DataObject dataObjectDocument = (await this._dataObjectQuery.Ids(dataObjectId).IsActive(IsActive.Active).Collect()).FirstOrDefault();
			if (dataObjectDocument == null) throw new MyNotFoundException(this._localizer["General_ItemNotFound", dataObjectId, nameof(Model.DataObject)]);

			Data.DataObjectReview reviewDocument = dataObjectDocument.Reviews?.Where(x => x.Id == reviewId)?.FirstOrDefault();
			if (reviewDocument == null) throw new MyNotFoundException(this._localizer["General_ItemNotFound", reviewId, nameof(Model.DataObjectReview)]);

			Data.DataObjectReviewFeedback feedbackData = reviewDocument.Feedback?.Where(x => x.Id == feedbackId)?.FirstOrDefault();
			if (feedbackData == null) throw new MyNotFoundException(this._localizer["General_ItemNotFound", reviewId, nameof(Model.DataObjectReview)]);

			if (feedbackData.UserId != null) await this._authorizationService.AuthorizeOwnerForce(new OwnedResource() { UserIds = new List<Guid>() { feedbackData.UserId.Value } });
			else if (this._cipherService.ToSha256(currUserId.ToString()) != feedbackData.UserIdHash) throw new MyValidationException(this._errors.Forbidden.Code, this._errors.Forbidden.Message);

			feedbackData.IsActive = IsActive.Inactive;

			reviewDocument.Feedback = reviewDocument.Feedback?.Where(x => x.Id != feedbackId).Append(feedbackData);
			dataObjectDocument.Reviews = dataObjectDocument.Reviews.Where(x => x.Id != reviewId).Append(reviewDocument);

			FilterDefinition<Data.DataObject> dataObjectFilter = Builders<Data.DataObject>.Filter.Eq(u => u.Id, dataObjectId);

			await this._mongoDatabase.ReplaceOneAsync(dataObjectFilter, dataObjectDocument);
		}
	}
}
