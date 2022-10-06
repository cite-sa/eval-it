import { DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { CommonFormattingModule } from '@common/formatting/common-formatting.module';
import { UserServiceEnumUtils } from '@user-service/core/formatting/enum-utils.service';
import { CultureInfoDisplayPipe } from '@user-service/core/formatting/pipes/culture-info-display.pipe';
import { ForgetMeStatePipe } from '@user-service/core/formatting/pipes/forget-me-state.pipe';
import { ForgetMeValidationPipe } from '@user-service/core/formatting/pipes/forget-me-validation.pipe';
import { IsActiveTypePipe } from '@user-service/core/formatting/pipes/is-active-type.pipe';
import { TimezoneInfoDisplayPipe } from '@user-service/core/formatting/pipes/timezone-info-display.pipe';
import { WhatYouKnowAboutMeStatePipe } from '@user-service/core/formatting/pipes/what-you-know-about-me-state.pipe';
import { WhatYouKnowAboutMeValidationPipe } from '@user-service/core/formatting/pipes/what-you-know-about-me-validation.pipe';

//
//
// This is shared module that provides all user service's formatting utils. Its imported only once on the AppModule.
//
//
@NgModule({
	imports: [
		CommonFormattingModule
	],
	declarations: [
		IsActiveTypePipe,
		CultureInfoDisplayPipe,
		TimezoneInfoDisplayPipe,
		ForgetMeStatePipe,
		ForgetMeValidationPipe,
		WhatYouKnowAboutMeStatePipe,
		WhatYouKnowAboutMeValidationPipe,
	],
	exports: [
		CommonFormattingModule,
		IsActiveTypePipe,
		CultureInfoDisplayPipe,
		TimezoneInfoDisplayPipe,
		ForgetMeStatePipe,
		ForgetMeValidationPipe,
		WhatYouKnowAboutMeStatePipe,
		WhatYouKnowAboutMeValidationPipe,
	],
	providers: [
		UserServiceEnumUtils,
		DatePipe,
		IsActiveTypePipe,
		CultureInfoDisplayPipe,
		TimezoneInfoDisplayPipe,
		ForgetMeStatePipe,
		ForgetMeValidationPipe,
		WhatYouKnowAboutMeStatePipe,
		WhatYouKnowAboutMeValidationPipe,
	]
})
export class UserServiceFormattingModule { }
