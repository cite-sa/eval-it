import { Lookup } from '@common/model/lookup';
import { Guid } from '@common/types/guid';
import { ForgetMeRequestState } from '@user-service/core/enum/forget-me-request-state.enum';
import { ForgetMeRequestValidation } from '@user-service/core/enum/forget-me-request-validation.enum';
import { IsActive } from '@user-service/core/enum/is-active.enum';

export interface ForgetMeRequestFilter {
	ids: Guid[];
	like: string;
	isActive: IsActive[];
	userIds: Guid[];
	isValidated: ForgetMeRequestValidation[];
	state: ForgetMeRequestState[];
}

export class ForgetMeRequestLookup extends Lookup implements ForgetMeRequestFilter {
	ids: Guid[];
	like: string;
	isActive: IsActive[];
	userIds: Guid[];
	isValidated: ForgetMeRequestValidation[];
	state: ForgetMeRequestState[];


	constructor() {
		super();
	}
}
