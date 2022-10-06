import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { AuthenticationState, AuthService, LoginStatus } from '@app/core/services/ui/auth.service';
import { BaseComponent } from '@common/base/base.component';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { CredentialProvider } from '@idp-service/core/enum/credential-provider.enum';
import { IdpServiceEnumUtils } from '@idp-service/core/formatting/enum-utils.service';
import { takeUntil } from 'rxjs/operators';
import { OAuthService } from 'angular-oauth2-oidc';
import { TaxisnetLoginService } from '@idp-service/services/taxisnet-login.service';
import { SignUpMode } from '@idp-service/core/enum/sign-up-mode.enum';
import { ConsentSelection } from '@idp-service/ui/user-consents/editor/user-consents-editor.component';
import { JwksValidationHandler } from 'angular-oauth2-oidc-jwks';
import { Guid } from '@common/types/guid';

@Component({
	selector: 'app-taxisnet-login',
	templateUrl: './taxisnet-login.component.html',
	styleUrls: ['./taxisnet-login.component.scss']
})
export class TaxisnetLoginComponent extends BaseComponent implements AfterViewInit, OnDestroy {
	@Input() signUpMode: SignUpMode;
	@Input() tenantId: Guid;
	@Input() invitationCode: string;
	@Input() signupConsents: ConsentSelection[];
	@Output() onAuthenticateSuccess = new EventEmitter<string>();

	credentialProviderEnum = CredentialProvider;

	constructor(
		private authService: AuthService,
		public idpEnumUtils: IdpServiceEnumUtils,
		private oauthService: OAuthService,
		private installationConfiguration: InstallationConfigurationService,
		private uiNotificationService: UiNotificationService,
		private taxisnetLoginService: TaxisnetLoginService
	) { super(); }

	ngAfterViewInit() {
		this.authService.getAuthenticationStateObservable()
			.pipe(takeUntil(this._destroyed))
			.subscribe((x: AuthenticationState) => {
				if (x.loginStatus === LoginStatus.LoggedOut) {
					this.logout();
				}
			});
		this.taxisnetInit();
	}

	private taxisnetInit() {
		this.oauthService.configure({
			clientId: this.installationConfiguration.authTaxisnetClientId,
			scope: this.installationConfiguration.authTaxisnetScope,
			responseType: this.installationConfiguration.authTaxisnetResponseType,
			loginUrl: this.installationConfiguration.authTaxisnetLoginUrl,
			requireHttps: false,
			redirectUri: this.installationConfiguration.authTaxisnetCallbackUrl,
			disablePKCE: true,
			nonceStateSeparator: '&',
			oidc: false
		});
		this.oauthService.tokenValidationHandler = new JwksValidationHandler();
	}

	public login() {
		const state = this.taxisnetLoginService.buildState(this.tenantId, this.signUpMode, this.invitationCode, this.signupConsents);
		if (state !== '') { this.oauthService.initImplicitFlow(state); } else { this.oauthService.initImplicitFlow(); }
	}

	public logout() {

	}
}
