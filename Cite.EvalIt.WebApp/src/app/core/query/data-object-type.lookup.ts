import { IsActive } from '@app/core/enum/is-active.enum';
import { Lookup } from '@common/model/lookup';
import { Guid } from '@common/types/guid';

export class DataObjectTypeLookup extends Lookup implements DataObjectTypeFilter {
	ids: Guid[];
	excludedIds: Guid[];
	isActive: IsActive[];
	like: string;

	constructor() {
		super();
	}
}

export interface DataObjectTypeFilter {
	ids: Guid[];
	excludedIds: Guid[];
	isActive: IsActive[];
	like: string;
}