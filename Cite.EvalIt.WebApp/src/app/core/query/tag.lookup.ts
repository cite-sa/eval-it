import { IsActive } from '@app/core/enum/is-active.enum';
import { TagAppliesTo } from '@app/core/enum/tag-applies-to.enum';
import { TagType } from '@app/core/enum/tag-type.enum';
import { Lookup } from '@common/model/lookup';
import { Guid } from '@common/types/guid';

export class TagLookup extends Lookup implements TagFilter {
	ids: Guid[];
	excludedIds: Guid[];
	userIds: Guid[];
	excludedUserIds: Guid[];
	dataObjectIds: Guid[];
	excludedDataObjectIds: Guid[];
	isActive: IsActive[];
	appliesTo: TagAppliesTo[];
	type: TagType[];
	like: string;

	constructor() {
		super();
	}
}

export interface TagFilter {
	ids: Guid[];
	excludedIds: Guid[];
	userIds: Guid[];
	excludedUserIds: Guid[];
	dataObjectIds: Guid[];
	excludedDataObjectIds: Guid[];
	isActive: IsActive[];
	appliesTo: TagAppliesTo[];
	type: TagType[];
	like: string;
}