using Cite.EvalIt.Authorization;
using Cite.EvalIt.Common;
using Cite.EvalIt.Data.Context;
using Cite.EvalIt.ErrorCode;
using Cite.EvalIt.Event;
using Cite.EvalIt.IntegrationEvent.Outbox;
using Cite.EvalIt.Query;
using Cite.Tools.Common.Extensions;
using Cite.Tools.Data.Builder;
using Cite.Tools.Data.Deleter;
using Cite.Tools.Exception;
using Cite.Tools.FieldSet;
using Cite.Tools.Json;
using Cite.Tools.Logging;
using Cite.Tools.Logging.Extensions;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static Cite.EvalIt.Common.NotificationFieldData;

namespace Cite.EvalIt.Service.User
{
	public class UserService : IUserService
	{
		private readonly NotificationsConfig _config;
		private readonly ILogger<UserService> _logger;
        private readonly AppMongoDbContext _mongoDatabase;
		private readonly UserQuery _userQuery;
		private readonly TagQuery _tagQuery;
		private readonly BuilderFactory _builderFactory;
		private readonly DeleterFactory _deleterFactory;
		private readonly JsonHandlingService _jsonHandlingService;
		private readonly INotificationIntegrationEventHandler _notificationIntegrationEventHandler;
		private readonly IStringLocalizer<Resources.MySharedResources> _localizer;
		private readonly IAuthorizationService _authorizationService;
		private readonly ErrorThesaurus _errors;
		private readonly EventBroker _eventBroker;

		public UserService(
			NotificationsConfig config,
			ILogger<UserService> logger,
			AppMongoDbContext mongoDatabase,
			UserQuery userQuery,
			TagQuery tagQuery,
			BuilderFactory builderFactory,
			DeleterFactory deleterFactory,
			IStringLocalizer<Resources.MySharedResources> localizer,
			IAuthorizationService authorizationService,
			JsonHandlingService jsonHandlingService,
			INotificationIntegrationEventHandler notificationIntegrationEventHandler,
			ErrorThesaurus errors,
			EventBroker eventBroker
			)
		{
			this._config = config;
			this._logger = logger;
			this._mongoDatabase = mongoDatabase;
			this._userQuery = userQuery;
			this._tagQuery = tagQuery;
			this._builderFactory = builderFactory;
			this._deleterFactory = deleterFactory;
			this._localizer = localizer;
			this._authorizationService = authorizationService;
			this._jsonHandlingService = jsonHandlingService;
			this._notificationIntegrationEventHandler = notificationIntegrationEventHandler;
			this._errors = errors;
			this._eventBroker = eventBroker;
		}

		public async Task<Model.User> PersistAsync(Model.UserTouchedIntegrationEventPersist model, IFieldSet fields = null)
		{
			this._logger.Debug(new MapLogEntry("persisting").And("model", model).And("fields", fields));

			await this._authorizationService.AuthorizeForce(Permission.EditUser);

			Data.User document = (await this._userQuery.Ids(model.Id.Value).IsActive(IsActive.Active).Collect()).FirstOrDefault();

			IEnumerable<Guid> tagIds = new List<Guid>();
			IEnumerable<UserWithRelationship> network = new List<UserWithRelationship>();

			DateTime CreatedDate = DateTime.UtcNow;
			DateTime UpdatedDate = CreatedDate;

			if (document != null)
			{
				tagIds = document.AssignedTagIds;
				network = document.UserNetworkIds;
				CreatedDate = document.CreatedAt;
			}

			Data.User data = new Data.User
			{
				Id = model.Id.Value,
				Name = model.Name,
				IsActive = IsActive.Active,
				CreatedAt = CreatedDate,
				UpdatedAt = UpdatedDate,
				AssignedTagIds = tagIds,
				UserNetworkIds = network,
				Profile = new Data.UserProfile
				{
					Language = model.Profile.Language,
					Culture = model.Profile.Culture,
					Timezone = model.Profile.Timezone
				}
				
			};

			// Persist Item
			FilterDefinition<Data.User> filter = Builders<Data.User>.Filter.Eq(u => u.Id, model.Id);

			if (document != null) await this._mongoDatabase.ReplaceOneAsync(filter, data);
			else await this._mongoDatabase.InsertOneAsync(data);

			this._eventBroker.EmitUserTouched(data.Id);

			Model.User persisted = await this._builderFactory.Builder<Model.UserBuilder>().Build(FieldSet.Build(fields, nameof(Model.User.Id), nameof(Model.User.Hash)), data);

			return persisted;
        }
		
		public async Task DeleteAndSaveAsync(Guid id)
		{
			this._logger.Debug("deleting user {id}", id);

			await this._authorizationService.AuthorizeForce(Permission.DeleteUser);

			await this._deleterFactory.Deleter<Model.UserDeleter>().DeleteAndSave(id.AsArray());
		}

		public async Task<Model.User> SetTags(Guid userId, IEnumerable<Guid> tagIds, IFieldSet fields = null)
		{
			this._logger.Debug(new MapLogEntry("setting").And("tags", tagIds).And("user", userId));

			await this._authorizationService.AuthorizeForce(Permission.EditUser);

			Data.User userDocument = (await this._userQuery.Ids(userId).IsActive(IsActive.Active).Collect()).FirstOrDefault();
			if (userDocument == null) throw new MyNotFoundException(this._localizer["General_ItemNotFound", userId, nameof(Model.User)]);

			IEnumerable<Data.Tag> tagDocuments = await this._tagQuery.Ids(tagIds.Distinct()).IsActive(IsActive.Active).Collect();
			
			if (tagDocuments == null) throw new MyNotFoundException(this._localizer["General_ItemNotFound", tagIds, nameof(Model.Tag)]);
			if (tagDocuments.Select(x => x.Id).Distinct().Intersect(tagIds.Distinct()).Count() < tagIds.Distinct().Count()) throw new MyNotFoundException(this._localizer["General_ItemNotFound", tagIds, nameof(Model.Tag)]);
			if (tagDocuments.Where( x => x.AppliesTo == TagAppliesTo.Object).Any()) throw new MyValidationException("Tag can only be applied to Objects");

			userDocument.AssignedTagIds = tagDocuments.Select(x => x.Id).Distinct();

			FilterDefinition<Data.User> userFilter = Builders<Data.User>.Filter.Eq(u => u.Id, userId);

			await this._mongoDatabase.ReplaceOneAsync(userFilter, userDocument);

			return await this._builderFactory.Builder<Model.UserBuilder>().Build(fields, userDocument);
		}

		public async Task<Model.User> UserNetworkAdd(Guid sourceUserId, UserWithRelationship userWithRelationship, IFieldSet fields = null)
		{
			await this._authorizationService.AuthorizeOrOwnerForce(new OwnedResource() { UserIds = new List<Guid>() { sourceUserId } },Permission.EditUser);

			IEnumerable<Data.User> userDocuments = await this._userQuery.Ids(new Guid[] { sourceUserId, userWithRelationship.Id }).IsActive(IsActive.Active).Collect();
			if (userDocuments.Count() < 2) throw new MyNotFoundException(this._localizer["Items_NotFound", nameof(Model.User)]);

			Data.User sourceUser = userDocuments.Where(u => u.Id == sourceUserId).FirstOrDefault();
			Data.User targetUser = userDocuments.Where(u => u.Id == userWithRelationship.Id).FirstOrDefault();

			if (sourceUser.UserNetworkIds.Select( p => p.Id).Contains(userWithRelationship.Id))
            {
				sourceUser.UserNetworkIds.Where(p => p.Id == userWithRelationship.Id).FirstOrDefault().Relationship = userWithRelationship.Relationship;
            }
			else sourceUser.UserNetworkIds = sourceUser.UserNetworkIds.Append(new UserWithRelationship() { Id = userWithRelationship.Id, Relationship = userWithRelationship.Relationship });

			FilterDefinition<Data.User> sourceUserFilter = Builders<Data.User>.Filter.Eq(u => u.Id, sourceUserId );

			await this._mongoDatabase.ReplaceOneAsync(sourceUserFilter, sourceUser);

			if (userWithRelationship.Relationship == UserNetworkRelationship.Follow) await this.SendUserFollowNotification(sourceUser, targetUser);
			if (userWithRelationship.Relationship == UserNetworkRelationship.Trust) await this.SendUserTrustNotification(sourceUser, targetUser);

			return await this._builderFactory.Builder<Model.UserBuilder>().Build(fields, sourceUser);
		}

		private async Task SendUserFollowNotification(Data.User followingUser, Data.User followedUser)
        {
			if (!this._config.UserFollow.NotificationKey.HasValue) new MyApplicationException(this._errors.SystemError.Code, this._errors.SystemError.Message);
			NotificationFieldData notificationUserFollowData = new NotificationFieldData
			{
				Fields = new List<FieldInfo>()
				   {
						new FieldInfo { Key = this._config.UserFollow.Template.Name, Type = FieldInfo.DataType.String, Value = followedUser.Name },
						new FieldInfo { Key = this._config.UserFollow.Template.TargetUserId, Type = FieldInfo.DataType.String, Value = followingUser.Id.ToString()},
						new FieldInfo { Key = this._config.UserFollow.Template.TargetUserName, Type = FieldInfo.DataType.String, Value = followingUser.Name}
				   }
			};

			NotificationIntegrationEvent notificationUserFollowIntegrationEvent = new NotificationIntegrationEvent
			{
				UserId = followedUser.Id,
				NotificationType = this._config.UserFollow.NotificationKey
			};
			notificationUserFollowIntegrationEvent.Data = this._jsonHandlingService.ToJsonSafe(notificationUserFollowData);

			await this._notificationIntegrationEventHandler.HandleAsync(notificationUserFollowIntegrationEvent);

		}

		private async Task SendUserTrustNotification(Data.User trustingUser, Data.User trustedUser)
		{
			if (!this._config.UserTrust.NotificationKey.HasValue) new MyApplicationException(this._errors.SystemError.Code, this._errors.SystemError.Message);
			NotificationFieldData notificationUserTrustData = new NotificationFieldData
			{
				Fields = new List<FieldInfo>()
				   {
						new FieldInfo { Key = this._config.UserTrust.Template.Name, Type = FieldInfo.DataType.String, Value = trustedUser.Name },
						new FieldInfo { Key = this._config.UserTrust.Template.TargetUserId, Type = FieldInfo.DataType.String, Value = trustingUser.Id.ToString()},
						new FieldInfo { Key = this._config.UserTrust.Template.TargetUserName, Type = FieldInfo.DataType.String, Value = trustingUser.Name}
				   }
			};

			NotificationIntegrationEvent notificationUserTrustIntegrationEvent = new NotificationIntegrationEvent
			{
				UserId = trustedUser.Id,
				NotificationType = this._config.UserTrust.NotificationKey
			};
			notificationUserTrustIntegrationEvent.Data = this._jsonHandlingService.ToJsonSafe(notificationUserTrustData);

			await this._notificationIntegrationEventHandler.HandleAsync(notificationUserTrustIntegrationEvent);

		}

		public async Task<Model.User> UserNetworkRemove(Guid sourceUserId, UserWithRelationship userWithRelationship, IFieldSet fields = null)
		{
			await this._authorizationService.AuthorizeOrOwnerForce(new OwnedResource() { UserIds = new List<Guid>() { sourceUserId } }, Permission.EditUser);

			IEnumerable<Data.User> userDocuments = await this._userQuery.Ids(new Guid[] { sourceUserId, userWithRelationship.Id }).IsActive(IsActive.Active).Collect();
			if (userDocuments.Count() < 2) throw new MyNotFoundException(this._localizer["Items_NotFound", nameof(Model.User)]);

			Data.User sourceUser = userDocuments.Where(u => u.Id == sourceUserId).FirstOrDefault();
			Data.User targetUser = userDocuments.Where(u => u.Id == userWithRelationship.Id).FirstOrDefault();

			if (!sourceUser.UserNetworkIds.Select(p => p.Id).Contains(userWithRelationship.Id) 
				|| sourceUser.UserNetworkIds.Where( u => u.Id == userWithRelationship.Id).FirstOrDefault().Relationship != userWithRelationship.Relationship)
			{
				throw new MyNotFoundException(this._localizer["General_ItemNotFound", userWithRelationship.Id, nameof(UserWithRelationship)]);
			}

			sourceUser.UserNetworkIds = sourceUser.UserNetworkIds.Where(u => u.Id != userWithRelationship.Id);

			FilterDefinition<Data.User> sourceUserFilter = Builders<Data.User>.Filter.Eq(u => u.Id, sourceUserId);

			await this._mongoDatabase.ReplaceOneAsync(sourceUserFilter, sourceUser);

			if (userWithRelationship.Relationship == UserNetworkRelationship.Follow) await this.SendUserUnfollowNotification(sourceUser, targetUser);
			if (userWithRelationship.Relationship == UserNetworkRelationship.Trust) await this.SendUserUntrustNotification(sourceUser, targetUser);

			return await this._builderFactory.Builder<Model.UserBuilder>().Build(fields, sourceUser);
		}

		private async Task SendUserUnfollowNotification(Data.User unfollowingUser, Data.User unfollowedUser)
		{
			if (!this._config.UserUnfollow.NotificationKey.HasValue) new MyApplicationException(this._errors.SystemError.Code, this._errors.SystemError.Message);
			NotificationFieldData notificationUserUnfollowData = new NotificationFieldData
            {
				Fields = new List<FieldInfo>()
				   {
						new FieldInfo { Key = this._config.UserUnfollow.Template.Name, Type = FieldInfo.DataType.String, Value = unfollowedUser.Name },
						new FieldInfo { Key = this._config.UserUnfollow.Template.TargetUserId, Type = FieldInfo.DataType.String, Value = unfollowingUser.Id.ToString()},
						new FieldInfo { Key = this._config.UserUnfollow.Template.TargetUserName, Type = FieldInfo.DataType.String, Value = unfollowingUser.Name}
				   }
			};

			NotificationIntegrationEvent notificationUserUnfollowIntegrationEvent = new NotificationIntegrationEvent
			{
				UserId = unfollowedUser.Id,
				NotificationType = this._config.UserUnfollow.NotificationKey
			};
			notificationUserUnfollowIntegrationEvent.Data = this._jsonHandlingService.ToJsonSafe(notificationUserUnfollowData);

			await this._notificationIntegrationEventHandler.HandleAsync(notificationUserUnfollowIntegrationEvent);

		}

		private async Task SendUserUntrustNotification(Data.User untrustingUser, Data.User untrustedUser)
		{
			if (!this._config.UserUntrust.NotificationKey.HasValue) new MyApplicationException(this._errors.SystemError.Code, this._errors.SystemError.Message);
			NotificationFieldData notificationUserUntrustData = new NotificationFieldData
			{
				Fields = new List<FieldInfo>()
				   {
						new FieldInfo { Key = this._config.UserUntrust.Template.Name, Type = FieldInfo.DataType.String, Value = untrustedUser.Name },
						new FieldInfo { Key = this._config.UserUntrust.Template.TargetUserId, Type = FieldInfo.DataType.String, Value = untrustingUser.Id.ToString()},
						new FieldInfo { Key = this._config.UserUntrust.Template.TargetUserName, Type = FieldInfo.DataType.String, Value = untrustingUser.Name}
				   }
			};

			NotificationIntegrationEvent notificationUserUntrustIntegrationEvent = new NotificationIntegrationEvent
			{
				UserId = untrustedUser.Id,
				NotificationType = this._config.UserUntrust.NotificationKey
			};
			notificationUserUntrustIntegrationEvent.Data = this._jsonHandlingService.ToJsonSafe(notificationUserUntrustData);

			await this._notificationIntegrationEventHandler.HandleAsync(notificationUserUntrustIntegrationEvent);

		}


	}
}