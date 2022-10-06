import { Guid } from '@common/types/guid';

export interface UserClaim {
	id?: number;
	userId?: Guid;
	claim: string;
	value: string;
	createdAt?: Date;
}

export interface UserClaimPersist {
	claim: string;
	value: string;
}
