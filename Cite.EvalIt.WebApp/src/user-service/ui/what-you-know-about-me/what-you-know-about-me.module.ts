import { NgModule } from '@angular/core';
import { CommonFormsModule } from '@common/forms/common-forms.module';
import { ConfirmationDialogModule } from '@common/modules/confirmation-dialog/confirmation-dialog.module';
import { ListingModule } from '@common/modules/listing/listing.module';
import { TextFilterModule } from '@common/modules/text-filter/text-filter.module';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { TotpModule } from '@idp-service/ui/totp/totp.module';
import { UserServiceFormattingModule } from '@user-service/core/formatting/formatting.module';
import { DeclineWhatYouKnowAboutMeComponent } from '@user-service/ui/what-you-know-about-me/decline/decline-what-you-know-about-me.component';
import { WhatYouKnowAboutMeRequestFiltersComponent } from '@user-service/ui/what-you-know-about-me/requests/filters/what-you-know-about-me-request-listing-filters.component';
import { WhatYouKnowAboutMeRequestListingComponent } from '@user-service/ui/what-you-know-about-me/requests/what-you-know-about-me-request-listing.component';
import { WhatYouKnowAboutMeValidateComponent } from '@user-service/ui/what-you-know-about-me/validate/what-you-know-about-me-validate.component';
import { WhatYouKnowAboutMeRoutingModule } from '@user-service/ui/what-you-know-about-me/what-you-know-about-me-routing.module';
import { NgxCaptchaModule } from 'ngx-captcha';
import { UserSettingsModule } from '@common/modules/user-settings/user-settings.module';

@NgModule({
	imports: [
		CommonUiModule,
		CommonFormsModule,
		ConfirmationDialogModule,
		ListingModule,
		TextFilterModule,
		UserServiceFormattingModule,
		NgxCaptchaModule,
		TotpModule,
		WhatYouKnowAboutMeRoutingModule,
		UserSettingsModule
	],
	declarations: [
		WhatYouKnowAboutMeRequestListingComponent,
		WhatYouKnowAboutMeRequestFiltersComponent,
		WhatYouKnowAboutMeValidateComponent,
		DeclineWhatYouKnowAboutMeComponent
	]
})
export class WhatYouKnowAboutMeModule { }
