import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@app/core/services/ui/auth.service';
import { BaseComponent } from '@common/base/base.component';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { CredentialProvider } from '@idp-service/core/enum/credential-provider.enum';
import { TotpKeyInfo } from '@idp-service/core/model/totp.model';
import { UserCredential } from '@idp-service/core/model/user-credential.model';
import { IdpServiceUser } from '@idp-service/core/model/user.model';
import { CredentialProviderService } from '@idp-service/services/http/credential-provider.service';
import { UserService as IdpUserService } from '@idp-service/services/http/user.service';
import { AuthProviderManager } from '@idp-service/ui/auth-providers/manager/auth-provider-manager';
import { takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';

@Component({
	selector: 'app-totp-setup',
	templateUrl: './totp-setup.component.html',
	styleUrls: ['./totp-setup.component.scss']
})
export class TotpSetupComponent extends BaseComponent implements OnInit {

	returnUrl: string;
	user: IdpServiceUser;
	authProviderManager: AuthProviderManager;
	totpEnabled = false;
	totpKeyInfo: TotpKeyInfo;
	totpKey: number;
	currentRegisterStep: TotpRegisterStep;

	totpRegisterStepEnum = TotpRegisterStep;

	constructor(
		private authService: AuthService,
		private router: Router,
		private uiNotificationService: UiNotificationService,
		private httpErrorHandlingService: HttpErrorHandlingService,
		private idpUserService: IdpUserService,
		private credentialProviderService: CredentialProviderService
	) {
		super();
	}

	ngOnInit(): void {
		this.getCredentials();
	}

	enable() {
		this.credentialProviderService.generateTotp()
			.pipe(takeUntil(this._destroyed))
			.subscribe(x => {
				this.totpKeyInfo = x;
				this.currentRegisterStep = TotpRegisterStep.QRCode;
			});
	}

	disable() {
		this.credentialProviderService.revokeTotp()
			.pipe(takeUntil(this._destroyed))
			.subscribe(x => {
				this.reset();
			}, error => this.onCallbackError(error));
	}

	verifyAndRegisterKey() {
		if (!this.totpKeyInfo || !this.totpKey || this.totpKey < 1) { return; }

		this.credentialProviderService.persistTotp(this.totpKeyInfo, this.totpKey)
			.pipe(takeUntil(this._destroyed))
			.subscribe(x => {
				this.reset();
			}, error => this.onCallbackError(error));
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
					if (Array.isArray(this.user.credentials)) {
						this.totpEnabled = this.user.credentials.filter(x => x.provider === CredentialProvider.Totp).length > 0;
					}
				},
				error => this.onCallbackError(error)
			);
	}

	private reset() {
		this.user = undefined;
		this.totpEnabled = undefined;
		this.totpKeyInfo = undefined;
		this.totpKey = undefined;
		this.currentRegisterStep = undefined;
		this.getCredentials();
	}

	public cancel(): void {
		this.router.navigate([this.returnUrl]);
	}

	onCallbackError(errorResponse: HttpErrorResponse) {
		const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
		this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
	}
}

export enum TotpRegisterStep {
	QRCode = 0,
	Verification = 1
}
