import { Guid } from '@common/types/guid';
import { ForgetMeRequestState } from '@user-service/core/enum/forget-me-request-state.enum';
import { ForgetMeRequestValidation } from '@user-service/core/enum/forget-me-request-validation.enum';
import { ForgetMeResultStatus } from '@user-service/core/enum/forget-me-result-status.enum';
import { IsActive } from '@user-service/core/enum/is-active.enum';
import { UserServiceUser } from '@user-service/core/model/user.model';

export interface ForgetMeRequest {
	id?: Guid;
	user: UserServiceUser;
	isActive: IsActive;
	isValidated?: ForgetMeRequestValidation;
	state?: ForgetMeRequestState;
	createdAt?: Date;
	expiresAt?: Date;
	token: string;
	hash: string;
	results: ForgetMeResult[];
}

export interface ForgetMeResult {
	id?: Guid;
	request: ForgetMeRequest;
	source: string;
	status: ForgetMeResultStatus;
	createdAt?: Date;
}

export interface ForgetMeValidate {
	token: string;
}

export interface ForgetMeDecline {
	token: string;
	text: string;
}

export interface ForgetMeStamp {
	id?: Guid;
	state?: ForgetMeRequestState;
}
