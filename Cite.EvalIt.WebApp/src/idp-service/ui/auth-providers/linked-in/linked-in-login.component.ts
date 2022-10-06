import { AfterViewInit, Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { AuthenticationState, AuthService, LoginStatus } from '@app/core/services/ui/auth.service';
import { BaseComponent } from '@common/base/base.component';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { CredentialProvider } from '@idp-service/core/enum/credential-provider.enum';
import { IdpServiceEnumUtils } from '@idp-service/core/formatting/enum-utils.service';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-linked-in-login',
	templateUrl: './linked-in-login.component.html',
	styleUrls: ['./linked-in-login.component.scss']
})
export class LinkedInLoginComponent extends BaseComponent implements AfterViewInit, OnDestroy {
	@Output() onAuthenticateSuccess = new EventEmitter<string>();

	credentialProviderEnum = CredentialProvider;

	constructor(
		private authService: AuthService,
		public idpEnumUtils: IdpServiceEnumUtils,
		private uiNotificationService: UiNotificationService
	) { super(); }

	ngAfterViewInit() {
		this.authService.getAuthenticationStateObservable()
			.pipe(takeUntil(this._destroyed))
			.subscribe((x: AuthenticationState) => {
				if (x.loginStatus === LoginStatus.LoggedOut) {
					this.logout();
				}
			});
		this.linkedInInit();
	}

	private linkedInInit() {

	}

	public login() {
		// For implementation:
		// https://developer.linkedin.com/docs/oauth2#

		this.uiNotificationService.snackBarNotification('Provider not implemented', SnackBarNotificationLevel.Info);
	}

	public logout() {

	}
}
