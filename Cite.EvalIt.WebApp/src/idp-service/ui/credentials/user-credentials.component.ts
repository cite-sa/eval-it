import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@app/core/services/ui/auth.service';
import { BaseComponent } from '@common/base/base.component';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { IdpServiceEnumUtils } from '@idp-service/core/formatting/enum-utils.service';
import { RegistrationInvitationPersist } from '@idp-service/core/model/registration-invitation.model';
import { UserCredential } from '@idp-service/core/model/user-credential.model';
import { IdpServiceUser } from '@idp-service/core/model/user.model';
import { AuthProviderService } from '@idp-service/services/auth-provider.service';
import { InvitationService } from '@idp-service/services/http/invitation.service';
import { UserService } from '@idp-service/services/http/user.service';
import { AuthProviderManager } from '@idp-service/ui/auth-providers/manager/auth-provider-manager';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';

@Component({
	selector: 'app-user-credentials',
	templateUrl: './user-credentials.component.html',
	styleUrls: ['./user-credentials.component.scss']
})
export class UserCredentialsComponent extends BaseComponent implements OnInit {

	returnUrl: string;
	user: IdpServiceUser;
	authProviderManager: AuthProviderManager;

	constructor(
		private authService: AuthService,
		private router: Router,
		private uiNotificationService: UiNotificationService,
		private httpErrorHandlingService: HttpErrorHandlingService,
		public idpEnumUtils: IdpServiceEnumUtils,
		private idpUserService: UserService,
		private language: TranslateService,
		private authProviderService: AuthProviderService,
		private invitationService: InvitationService
	) {
		super();
	}

	ngOnInit(): void {
		this.authProviderService.getAuthenticationProviderManager()
			.pipe(takeUntil(this._destroyed))
			.subscribe(x => {
				this.authProviderManager = x;
			});
		this.getCredentials();
	}

	getCredentials() {
		this.idpUserService.getSingle(this.authService.userId(), [
			nameof<IdpServiceUser>(x => x.id),
			nameof<IdpServiceUser>(x => x.hash),
			nameof<IdpServiceUser>(x => x.credentials) + '.' + nameof<UserCredential>(x => x.provider)
		]).pipe(takeUntil(this._destroyed))
			.subscribe(
				data => {
					this.user = data;
				},
				error => this.onCallbackError(error)
			);
	}

	removeCredential(credential: UserCredential, index: number) {
		const items = this.user.credentials;
		items.splice(index, 1);
		this.idpUserService.updateUserCredentials(this.user.id, items.map(x => x.provider))
			.pipe(takeUntil(this._destroyed))
			.subscribe(result => {
				this.getCredentials();
			});
	}

	canAddProvider(): boolean {
		if (!this.authProviderManager || !this.user) { return false; }

		const userCredentials = this.user.credentials || [];
		const existingProviders = userCredentials.map(x => x.provider);
		return this.authProviderManager.primaryProviders().filter(x => !existingProviders.includes(x.credentialProvider)).length > 0;
	}

	addProvider(): void {
		const item: RegistrationInvitationPersist = {
			userId: this.user.id
		};
		this.invitationService.submit(item).subscribe(x => {
			this.uiNotificationService.popupNotification(this.language.instant('IDP-SERVICE.USER-CREDENTIALS.ADD-POPUP-TITLE'), this.language.instant('IDP-SERVICE.USER-CREDENTIALS.ADD-POPUP-MESSAGE'));
		});
	}

	public cancel(): void {
		this.router.navigate([this.returnUrl]);
	}

	onCallbackSuccess(): void {
		// we need to refresh the page to apply culture changes
		window.location.href = this.returnUrl;
	}

	onCallbackError(errorResponse: HttpErrorResponse) {
		const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
		this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
	}
}
