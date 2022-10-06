import { NgModule } from '@angular/core';
import { CommonFormsModule } from '@common/forms/common-forms.module';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { AuthProvidersModule } from '@idp-service/ui/auth-providers/auth-providers.module';
import { UserConsentsModule } from '@idp-service/ui/user-consents/user-consents.module';
import { DeclineRegistrationInvitationComponent } from '@idp-service/ui/user-registration/decline-registration-invitation/decline-registration-invitation.component';
import { UserRegistrationRoutingModule } from '@idp-service/ui/user-registration/user-registration-routing.module';
import { UserRegistrationComponent } from '@idp-service/ui/user-registration/user-registration.component';
import { NgxCaptchaModule } from 'ngx-captcha';

@NgModule({
	imports: [
		CommonUiModule,
		CommonFormsModule,
		UserRegistrationRoutingModule,
		AuthProvidersModule,
		UserConsentsModule,
		NgxCaptchaModule
	],
	declarations: [
		UserRegistrationComponent,
		DeclineRegistrationInvitationComponent
	],
	entryComponents: []
})
export class UserRegistrationModule { }
