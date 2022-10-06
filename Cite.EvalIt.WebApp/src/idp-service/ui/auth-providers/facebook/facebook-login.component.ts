import { AfterViewInit, Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { AuthenticationState, AuthService, LoginStatus } from '@app/core/services/ui/auth.service';
import { BaseComponent } from '@common/base/base.component';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { LoggingService } from '@common/logging/logging-service';
import { CredentialProvider } from '@idp-service/core/enum/credential-provider.enum';
import { IdpServiceEnumUtils } from '@idp-service/core/formatting/enum-utils.service';
import { takeUntil } from 'rxjs/operators';
/// <reference types="facebook-js-sdk" />

@Component({
	selector: 'app-facebook-login',
	templateUrl: './facebook-login.component.html',
	styleUrls: ['./facebook-login.component.scss']
})
export class FacebookLoginComponent extends BaseComponent implements AfterViewInit, OnDestroy {
	@Output() onAuthenticateSuccess = new EventEmitter<string>();

	private permissions = 'public_profile, email';
	private currentStatusResponse: fb.StatusResponse = null;
	private statusChangeHandler: (statusResponse: fb.StatusResponse) => void;
	credentialProviderEnum = CredentialProvider;

	constructor(
		private installationConfiguration: InstallationConfigurationService,
		private logger: LoggingService,
		private authService: AuthService,
		public idpEnumUtils: IdpServiceEnumUtils
	) { super(); }

	ngAfterViewInit() {
		this.authService.getAuthenticationStateObservable()
			.pipe(takeUntil(this._destroyed))
			.subscribe((x: AuthenticationState) => {
				if (x.loginStatus === LoginStatus.LoggedOut) {
					this.logout();
				}
			});
		this.facebookInit();
	}

	ngOnDestroy(): void {
		if (this.statusChangeHandler) { FB.Event.unsubscribe('auth.statusChange', this.statusChangeHandler); }
	}

	private facebookInit() {
		FB.init({
			appId: this.installationConfiguration.authFacebookClientId,
			cookie: false,
			xfbml: true,
			version: 'v3.2'
		});

		this.statusChangeHandler = (response: fb.StatusResponse) => {
			this.currentStatusResponse = response;
			if (response.status === 'connected') {
				this.onAuthenticateSuccess.emit(response.authResponse.accessToken);
			}
			//TODO: maybe we need to handle logout status change here.
		};
		FB.Event.subscribe('auth.statusChange', this.statusChangeHandler);
	}

	private getStatus(): string {
		if (this.currentStatusResponse && this.currentStatusResponse.status) { return this.currentStatusResponse.status; }
		return '';
	}

	public login() {
		this.logger.info('User requested Facebook login.');
		const currentStatus = this.getStatus();
		this.logger.info('Facebook auth status is: ' + currentStatus);
		if (currentStatus === 'connected') {
			this.onAuthenticateSuccess.emit(this.currentStatusResponse.authResponse.accessToken);
		} else {
			this.logger.info('Logging in to Facebook.');
			FB.login((loginResponse) => {
				this.logger.info('Facebook login completed.');
			}, { scope: this.permissions });
		}
	}

	public logout() {
		this.logger.info('Facebook logout requested.');
		const currentStatus = this.getStatus();
		this.logger.info('Facebook auth status is: ' + this.getStatus());
		if (currentStatus === 'connected') {
			this.logger.info('Logging out from Facebook.');
			FB.logout((logoutResponse: fb.StatusResponse) => {
				this.logger.info('Facebook logout completed.');
			});
		}
	}
}
