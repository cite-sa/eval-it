import { NgModule } from '@angular/core';
import { CommonFormsModule } from '@common/forms/common-forms.module';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { AuthProvidersModule } from '@idp-service/ui/auth-providers/auth-providers.module';
import { BasicLoginComponent } from '@idp-service/ui/login/basic/basic-login.component';
import { LoginRoutingModule } from '@idp-service/ui/login/login-routing.module';
import { LoginComponent } from '@idp-service/ui/login/login.component';
import { PasswordResetPopupComponent } from '@idp-service/ui/login/password-reset-popup/password-reset-popup.component';
import { TenantSelectionComponent } from '@idp-service/ui/login/tenant-selection/tenant-selection.component';
import { TotpModule } from '@idp-service/ui/totp/totp.module';
import { NgxCaptchaModule } from 'ngx-captcha';
import { DirectLinkLoginComponent } from '@idp-service/ui/login/direct-link/direct-link-login.component';
import { DirectLinkMailRequestComponent } from '@idp-service/ui/login/direct-link-mail-request/direct-link-mail-request.component';

@NgModule({
	imports: [
		CommonUiModule,
		CommonFormsModule,
		AuthProvidersModule,
		NgxCaptchaModule,
		LoginRoutingModule,
		TotpModule
	],
	declarations: [LoginComponent, BasicLoginComponent, PasswordResetPopupComponent, TenantSelectionComponent, DirectLinkLoginComponent, DirectLinkMailRequestComponent],
	entryComponents: [
		PasswordResetPopupComponent
	]
})
export class LoginModule { }
