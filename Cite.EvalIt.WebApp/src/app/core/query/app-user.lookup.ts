import { IsActive } from '@app/core/enum/is-active.enum';
import { Lookup } from '@common/model/lookup';
import { Guid } from '@common/types/guid';

export class AppUserLookup extends Lookup implements AppUserFilter {
	ids: Guid[];
	excludedIds: Guid[];
	tagIds: Guid[];
	isActive: IsActive[];
	referenceUserId?: Guid;
	isNetworkCandidate: Boolean[];
	like: string;

	constructor() {
		super();
	}
}

export interface AppUserFilter {
	ids: Guid[];
	excludedIds: Guid[];
	tagIds: Guid[];
	isActive: IsActive[];
	like: string;
}
