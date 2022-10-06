import { NgModule } from '@angular/core';
import { CommonFormsModule } from '@common/forms/common-forms.module';
import { ConfirmationDialogModule } from '@common/modules/confirmation-dialog/confirmation-dialog.module';
import { ListingModule } from '@common/modules/listing/listing.module';
import { TextFilterModule } from '@common/modules/text-filter/text-filter.module';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { TotpModule } from '@idp-service/ui/totp/totp.module';
import { UserServiceFormattingModule } from '@user-service/core/formatting/formatting.module';
import { DeclineForgetMeComponent } from '@user-service/ui/forget-me/decline/decline-forget-me.component';
import { ForgetMeRoutingModule } from '@user-service/ui/forget-me/forget-me-routing.module';
import { ForgetMeRequestFiltersComponent } from '@user-service/ui/forget-me/requests/filters/forget-me-request-listing-filters.component';
import { ForgetMeRequestListingComponent } from '@user-service/ui/forget-me/requests/forget-me-request-listing.component';
import { ForgetMeValidateComponent } from '@user-service/ui/forget-me/validate/forget-me-validate.component';
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
		ForgetMeRoutingModule,
		UserSettingsModule
	],
	declarations: [
		ForgetMeRequestListingComponent,
		ForgetMeRequestFiltersComponent,
		ForgetMeValidateComponent,
		DeclineForgetMeComponent
	]
})
export class ForgetMeModule { }
