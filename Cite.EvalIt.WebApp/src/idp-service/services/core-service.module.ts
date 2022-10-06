import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { BaseHttpService } from '@common/base/base-http.service';
import { FormService } from '@common/forms/form-service';
import { LoggingService } from '@common/logging/logging-service';
import { HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { FilterService } from '@common/modules/text-filter/filter-service';
import { AuthProviderService } from '@idp-service/services/auth-provider.service';
import { ConsentService } from '@idp-service/services/http/consent.service';
import { CredentialProviderService } from '@idp-service/services/http/credential-provider.service';
import { CredentialResetService } from '@idp-service/services/http/credential-reset.service';
import { IdpService } from '@idp-service/services/http/idp.service';
import { InvitationService } from '@idp-service/services/http/invitation.service';
import { PrincipalService } from '@idp-service/services/http/principal.service';
import { TokenService } from '@idp-service/services/http/token.service';
import { UserService as IdpUserService } from '@idp-service/services/http/user.service';
import { SamlLoginService } from '@idp-service/services/saml-login.service';
import { CASLoginService } from '@idp-service/services/cas-login.service';
import { TaxisnetLoginService } from '@idp-service/services/taxisnet-login.service';
import { OpenIDConnectCodeLoginService } from '@idp-service/services/openid-connect-code-login.service';

//
//
// This is shared module that provides all idp service's services. Its imported only once on the AppModule.
//
//
@NgModule({})
export class CoreIdpServiceModule {
	constructor(@Optional() @SkipSelf() parentModule: CoreIdpServiceModule) {
		if (parentModule) {
			throw new Error(
				'CoreIdpServiceModule is already loaded. Import it in the AppModule only');
		}
	}
	static forRoot(): ModuleWithProviders<CoreIdpServiceModule> {
		return {
			ngModule: CoreIdpServiceModule,
			providers: [
				BaseHttpService,
				IdpService,
				InvitationService,
				IdpUserService,
				UiNotificationService,
				HttpErrorHandlingService,
				ConsentService,
				CredentialProviderService,
				FilterService,
				SamlLoginService,
				OpenIDConnectCodeLoginService,
				CASLoginService,
				TaxisnetLoginService,
				FormService,
				CredentialResetService,
				TokenService,
				LoggingService,
				AuthProviderService,
				PrincipalService,
			],
		};
	}
}
