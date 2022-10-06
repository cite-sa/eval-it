import { IsActive } from '@app/core/enum/is-active.enum';
import { Lookup } from '@common/model/lookup';
import { Guid } from '@common/types/guid';

export class DataObjectLookup extends Lookup implements DataObjectFilter {
	ids: Guid[];
	excludedIds: Guid[];
	tagIds: Guid[];
	typeIds: Guid[];
	userIds: Guid[];
	isActive: IsActive[];
	like: string;
	likeDescription: string;

	constructor() {
		super();
	}
}

export interface DataObjectFilter {
	ids: Guid[];
	excludedIds: Guid[];
	tagIds: Guid[];
	typeIds: Guid[];
	userIds: Guid[];
	isActive: IsActive[];
	like: string;
	likeDescription: string;
}