import { Injectable } from '@angular/core';
import { BaseEnumUtilsService } from '@common/base/base-enum-utils.service';
import { TranslateService } from '@ngx-translate/core';
import { ContactType } from '@notification-service/core/enum/contact-type.enum';
import { ForgetMeRequestState } from '@user-service/core/enum/forget-me-request-state.enum';
import { ForgetMeRequestValidation } from '@user-service/core/enum/forget-me-request-validation.enum';
import { IsActive } from '@user-service/core/enum/is-active.enum';
import { WhatYouKnowAboutMeRequestState } from '@user-service/core/enum/what-you-know-about-me-request-state.enum';
import { WhatYouKnowAboutMeRequestValidation } from '@user-service/core/enum/what-you-know-about-me-request-validation.enum';

@Injectable()
export class UserServiceEnumUtils extends BaseEnumUtilsService {
	constructor(private language: TranslateService) { super(); }

	public toIsActiveString(value: IsActive): string {
		switch (value) {
			case IsActive.Active: return this.language.instant('USER-SERVICE.TYPES.IS-ACTIVE.ACTIVE');
			case IsActive.Inactive: return this.language.instant('USER-SERVICE.TYPES.IS-ACTIVE.INACTIVE');
			default: return '';
		}
	}

	public toForgetMeValidationString(value: ForgetMeRequestValidation): string {
		switch (value) {
			case ForgetMeRequestValidation.Pending: return this.language.instant('USER-SERVICE.TYPES.FORGET-ME-VALIDATION.PENDING');
			case ForgetMeRequestValidation.Validated: return this.language.instant('USER-SERVICE.TYPES.FORGET-ME-VALIDATION.VALIDATED');
			default: return '';
		}
	}

	public toForgetMeStateString(value: ForgetMeRequestState): string {
		switch (value) {
			case ForgetMeRequestState.Pending: return this.language.instant('USER-SERVICE.TYPES.FORGET-ME-STATE.PENDING');
			case ForgetMeRequestState.Approved: return this.language.instant('USER-SERVICE.TYPES.FORGET-ME-STATE.APPROVED');
			case ForgetMeRequestState.Denied: return this.language.instant('USER-SERVICE.TYPES.FORGET-ME-STATE.DENIED');
			case ForgetMeRequestState.Completed: return this.language.instant('USER-SERVICE.TYPES.FORGET-ME-STATE.COMPLETED');
			default: return '';
		}
	}

	public toWhatYouKnowAboutMeValidationString(value: WhatYouKnowAboutMeRequestValidation): string {
		switch (value) {
			case WhatYouKnowAboutMeRequestValidation.Pending: return this.language.instant('USER-SERVICE.TYPES.WHAT-YOU-KNOW-ABOUT-ME-VALIDATION.PENDING');
			case WhatYouKnowAboutMeRequestValidation.Validated: return this.language.instant('USER-SERVICE.TYPES.WHAT-YOU-KNOW-ABOUT-ME-VALIDATION.VALIDATED');
			default: return '';
		}
	}

	public toWhatYouKnowAboutMeStateString(value: WhatYouKnowAboutMeRequestState): string {
		switch (value) {
			case WhatYouKnowAboutMeRequestState.Pending: return this.language.instant('USER-SERVICE.TYPES.WHAT-YOU-KNOW-ABOUT-ME-STATE.PENDING');
			case WhatYouKnowAboutMeRequestState.Approved: return this.language.instant('USER-SERVICE.TYPES.WHAT-YOU-KNOW-ABOUT-ME-STATE.APPROVED');
			case WhatYouKnowAboutMeRequestState.Denied: return this.language.instant('USER-SERVICE.TYPES.WHAT-YOU-KNOW-ABOUT-ME-STATE.DENIED');
			case WhatYouKnowAboutMeRequestState.Completed: return this.language.instant('USER-SERVICE.TYPES.WHAT-YOU-KNOW-ABOUT-ME-STATE.COMPLETED');
			default: return '';
		}
	}

	public toContactTypeString(value: ContactType): string {
		switch (value) {
			case ContactType.Email: return this.language.instant('USER-SERVICE.TYPES.CONTACT-TYPE.EMAIL');
			case ContactType.SlackBroadcast: return this.language.instant('USER-SERVICE.TYPES.CONTACT-TYPE.SLACK-BROADCAST');
			case ContactType.Sms: return this.language.instant('USER-SERVICE.TYPES.CONTACT-TYPE.SMS');
			default: return '';
		}
	}
}
