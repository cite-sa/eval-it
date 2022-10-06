import { Guid } from '@common/types/guid';

export interface PersistedGrantAggregation {
	subjectId: string;
	userId?: Guid;
	userName: string;
	clientId: string;
	type: string;
	latestExpiresAt?: Date;
	latestCreatedAt?: Date;
	count?: number;
}

export interface PersistedGrantAggregationKey {
	subjectId: string;
	clientId: string;
	type: string;
}
