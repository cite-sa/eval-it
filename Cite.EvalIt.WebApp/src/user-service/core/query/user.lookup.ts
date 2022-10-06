import { Lookup } from '@common/model/lookup';
import { Guid } from '@common/types/guid';
import { IsActive } from '@user-service/core/enum/is-active.enum';
import { UserType } from '@user-service/core/enum/user-type.enum';

export interface UserFilter {
	ids: Guid[];
	excludedIds: Guid[];
	type: UserType[];
	like: string;
	isActive: IsActive[];
}

export class UserLookup extends Lookup implements UserFilter {
	ids: Guid[];
	excludedIds: Guid[];
	type: UserType[];
	like: string;
	isActive: IsActive[];

	constructor() {
		super();
	}
}
