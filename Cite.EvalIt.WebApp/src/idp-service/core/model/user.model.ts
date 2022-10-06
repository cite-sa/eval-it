import { Guid } from '@common/types/guid';
import { IsActive } from '@idp-service/core/enum/is-active.enum';
import { UserType } from '@idp-service/core/enum/user-type.enum';
import { UserClaim } from '@idp-service/core/model/user-claim.model';
import { UserCredential } from '@idp-service/core/model/user-credential.model';

export interface IdpServiceUser {
	id: Guid;
	name: string;
	isActive?: IsActive;
	type?: UserType;
	createdAt?: Date;
	updatedAt?: Date;
	hash: string;
	credentials: UserCredential[];
	claims: UserClaim[];
}

export interface IdpServiceUserPersist {
	id: Guid;
	name: string;
	type?: UserType;
	hash: string;
	credentials: UserCredential[];
	claims: UserClaim[];
}
