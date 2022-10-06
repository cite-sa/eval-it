import { UserNetworkRelationship } from '@app/core/enum/user-network-relationship.enum';
import { AppUserProfile, AppUserProfilePersist } from '@app/core/model/app-user/app-user-profile.model';
import { Tag } from '@app/core/model/tag/tag.model';
import { BaseEntity, BaseEntityPersist } from '@common/base/base-entity.model';
import { Guid } from '@common/types/guid';

export interface AppUser extends BaseEntity  {
	name: string;
	assignedTagIds: Tag[]
	userNetworkIds: UserWithRelationship[]
	profile: AppUserProfile;
	isNetworkCandidate: boolean;
}

export interface AppUserPersist extends BaseEntityPersist {
	name: string;
	profile: AppUserProfilePersist;
}

export interface TagSetPersist {
	tagIds: Guid[];
}

export interface UserWithRelationship {
	id: Guid;
	user: AppUser;
	relationship: UserNetworkRelationship;
}

export interface UserWithRelationshipPersist {
	id: Guid;
	relationship: UserNetworkRelationship;
}