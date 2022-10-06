import { NgModule } from '@angular/core';
import { CommonFormsModule } from '@common/forms/common-forms.module';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { DeclinePasswordResetComponent } from '@idp-service/ui/password-reset/decline/decline-password-reset.component';
import { PasswordResetRoutingModule } from '@idp-service/ui/password-reset/password-reset-routing.module';
import { PasswordResetComponent } from '@idp-service/ui/password-reset/password-reset.component';
import { NgxCaptchaModule } from 'ngx-captcha';

@NgModule({
	imports: [
		CommonUiModule,
		CommonFormsModule,
		NgxCaptchaModule,
		PasswordResetRoutingModule
	],
	declarations: [
		PasswordResetComponent,
		DeclinePasswordResetComponent
	],
	entryComponents: []
})
export class PasswordResetModule { }
