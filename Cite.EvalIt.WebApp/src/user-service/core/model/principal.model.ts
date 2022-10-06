import { Guid } from '@common/types/guid';
import { UserServicePermission } from '@user-service/core/enum/permission.enum';
import { TentativeUserProfile } from '@user-service/core/enum/tentative-user-profile.enum';
import { UserType } from '@user-service/core/enum/user-type.enum';

export interface UserServiceAccount {
	isAuthenticated: boolean;
	permissions: UserServicePermission[];
	principal: UserPrincipalInfo;
	profile: UserProfileInfo;
}

export interface UserPrincipalInfo {
	subject: Guid;
	name: string;
	scope: string[];
	client: string;
	notBefore: Date;
	authenticatedAt: Date;
	expiresAt: Date;
}

export interface UserProfileInfo {
	type: UserType;
	tenant: Guid;
	isTentative: TentativeUserProfile;
	profilePictureRef: string;
	profilePictureUrl: string;
	culture: string;
	language: string;
	timezone: string;
}
