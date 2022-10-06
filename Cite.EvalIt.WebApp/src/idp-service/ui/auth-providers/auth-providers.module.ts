import { NgModule } from '@angular/core';
import { FormattingModule } from '@app/core/formatting/formatting.module';
import { CommonFormsModule } from '@common/forms/common-forms.module';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { IdpServiceFormattingModule } from '@idp-service/core/formatting/formatting.module';
import { AuthProvidersComponent } from '@idp-service/ui/auth-providers/auth-providers.component';
import { DefaultProviderComponent } from '@idp-service/ui/auth-providers/default/default-provider.component';
import { DirectLinkRegisterComponent } from '@idp-service/ui/auth-providers/direct-link-register/direct-link-register.component';
import { FacebookLoginComponent } from '@idp-service/ui/auth-providers/facebook/facebook-login.component';
import { GithubLoginComponent } from '@idp-service/ui/auth-providers/github/github-login.component';
import { GoogleLoginComponent } from '@idp-service/ui/auth-providers/google/google-login.component';
import { TaxisnetLoginComponent } from '@idp-service/ui/auth-providers/taxisnet/taxisnet-login.component';
import { LinkedInLoginComponent } from '@idp-service/ui/auth-providers/linked-in/linked-in-login.component';
import { SamlResponseLoginComponent } from '@idp-service/ui/auth-providers/saml/saml-login-response/saml-login-response.component';
import { SamlLoginComponent } from '@idp-service/ui/auth-providers/saml/saml-login.component';
import { CASResponseLoginComponent } from '@idp-service/ui/auth-providers/cas/cas-login-response/cas-login-response.component';
import { CASLoginComponent } from '@idp-service/ui/auth-providers/cas/cas-login.component';
import { TransientRegisterComponent } from '@idp-service/ui/auth-providers/transient-register/transient-register.component';
import { TwitterLoginComponent } from '@idp-service/ui/auth-providers/twitter/twitter-login.component';
import { UserPassRegisterComponent } from '@idp-service/ui/auth-providers/user-pass-register/user-pass-register.component';
import { NgxCaptchaModule } from 'ngx-captcha';
import { TaxisnetLoginResponseComponent } from '@idp-service/ui/auth-providers/taxisnet/taxisnet-login-response/taxisnet-login-response.component';
import { OpenIDConnectCodeLoginComponent } from '@idp-service/ui/auth-providers/openid-connect-code/openid-connect-code-login.component';
import { OpenIDConnectCodeResponseLoginComponent } from '@idp-service/ui/auth-providers/openid-connect-code/openid-connect-code-login-response/openid-connect-code-login-response.component';

@NgModule({
	imports: [
		CommonUiModule,
		CommonFormsModule,
		FormattingModule,
		IdpServiceFormattingModule,
		NgxCaptchaModule
	],
	declarations: [
		AuthProvidersComponent,
		GoogleLoginComponent,
		TaxisnetLoginComponent,
		TaxisnetLoginResponseComponent,
		FacebookLoginComponent,
		UserPassRegisterComponent,
		DirectLinkRegisterComponent,
		TransientRegisterComponent,
		DefaultProviderComponent,
		SamlLoginComponent,
		SamlResponseLoginComponent,
		OpenIDConnectCodeLoginComponent,
		OpenIDConnectCodeResponseLoginComponent,
		CASLoginComponent,
		CASResponseLoginComponent,
		GithubLoginComponent,
		TwitterLoginComponent,
		LinkedInLoginComponent
	],
	entryComponents: [],
	exports: [
		AuthProvidersComponent,
		UserPassRegisterComponent,
		DirectLinkRegisterComponent,
		TransientRegisterComponent
	]
})
export class AuthProvidersModule { }
