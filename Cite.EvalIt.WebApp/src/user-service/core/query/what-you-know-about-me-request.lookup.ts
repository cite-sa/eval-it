import { Lookup } from '@common/model/lookup';
import { Guid } from '@common/types/guid';
import { IsActive } from '@user-service/core/enum/is-active.enum';
import { WhatYouKnowAboutMeRequestState } from '@user-service/core/enum/what-you-know-about-me-request-state.enum';
import { WhatYouKnowAboutMeRequestValidation } from '@user-service/core/enum/what-you-know-about-me-request-validation.enum';

export class WhatYouKnowAboutMeRequestLookup extends Lookup implements WhatYouKnowAboutMeRequestFilter {
	ids: Guid[];
	like: string;
	isActive: IsActive[];
	userIds: Guid[];
	isValidated: WhatYouKnowAboutMeRequestValidation[];
	state: WhatYouKnowAboutMeRequestState[];


	constructor() {
		super();
	}
}

export interface WhatYouKnowAboutMeRequestFilter {
	ids: Guid[];
	like: string;
	isActive: IsActive[];
	userIds: Guid[];
	isValidated: WhatYouKnowAboutMeRequestValidation[];
	state: WhatYouKnowAboutMeRequestState[];
}
