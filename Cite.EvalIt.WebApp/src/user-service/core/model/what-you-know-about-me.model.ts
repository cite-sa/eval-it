import { Guid } from '@common/types/guid';
import { IsActive } from '@user-service/core/enum/is-active.enum';
import { WhatYouKnowAboutMeRequestState } from '@user-service/core/enum/what-you-know-about-me-request-state.enum';
import { WhatYouKnowAboutMeRequestValidation } from '@user-service/core/enum/what-you-know-about-me-request-validation.enum';
import { WhatYouKnowAboutMeResultStatus } from '@user-service/core/enum/what-you-know-about-me-result-status.enum';
import { StorageFile } from '@user-service/core/model/storage-file.model';
import { UserServiceUser } from '@user-service/core/model/user.model';

export interface WhatYouKnowAboutMeRequest {
	id?: Guid;
	user: UserServiceUser;
	isActive: IsActive;
	isValidated?: WhatYouKnowAboutMeRequestValidation;
	state?: WhatYouKnowAboutMeRequestState;
	createdAt?: Date;
	updatedAt?: Date;
	expiresAt?: Date;
	token: string;
	storageFile: StorageFile;
	hash: string;
	results: WhatYouKnowAboutMeResult[];
}

export interface WhatYouKnowAboutMeResult {
	id?: Guid;
	request: WhatYouKnowAboutMeRequest;
	source: string;
	status: WhatYouKnowAboutMeResultStatus;
	storageFile: StorageFile;
	createdAt?: Date;
}

export interface WhatYouKnowAboutMeValidate {
	token: string;
}

export interface WhatYouKnowAboutMeDecline {
	token: string;
	text: string;
}

export interface WhatYouKnowAboutMeStamp {
	id?: Guid;
	state?: WhatYouKnowAboutMeRequestState;
}
