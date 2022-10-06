import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '@app/core/services/ui/auth.service';
import { BaseComponent } from '@common/base/base.component';
import { LoggingService } from '@common/logging/logging-service';
import { ConfirmationDialogComponent } from '@common/modules/confirmation-dialog/confirmation-dialog.component';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { Guid } from '@common/types/guid';
import { CredentialProvider } from '@idp-service/core/enum/credential-provider.enum';
import { IdpServiceEnumUtils } from '@idp-service/core/formatting/enum-utils.service';
import { RegistrationInvitationPersist } from '@idp-service/core/model/registration-invitation.model';
import { OverrideUserPassCredential, UserCredential } from '@idp-service/core/model/user-credential.model';
import { IdpServiceUser } from '@idp-service/core/model/user.model';
import { AuthProviderService } from '@idp-service/services/auth-provider.service';
import { CredentialResetService } from '@idp-service/services/http/credential-reset.service';
import { InvitationService } from '@idp-service/services/http/invitation.service';
import { UserService as IdpUserService } from '@idp-service/services/http/user.service';
import { AuthProviderManager } from '@idp-service/ui/auth-providers/manager/auth-provider-manager';
import { TotpService } from '@idp-service/ui/totp/totp.service';
import { UserPassOverrideDialogComponent } from '@idp-service/ui/user-pass-override-dialog/user-pass-override-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { CultureService } from '@user-service/services/culture.service';
import { LanguageService } from '@user-service/services/language.service';
import * as moment from 'moment';
import { takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';

@Component({
	selector: 'app-user-credentials-editor',
	templateUrl: './user-credentials-editor.component.html',
	styleUrls: ['./user-credentials-editor.component.scss']
})
export class UserCredentialsEditorComponent extends BaseComponent implements OnInit {

	@Input() userId: Guid;
	userCredentialProviders: CredentialProvider[] = [];
	formGroup: FormGroup = null;
	authProviderManager: AuthProviderManager;

	constructor(
		public authService: AuthService,
		private dialog: MatDialog,
		private idpUserService: IdpUserService,
		private router: Router,
		private language: TranslateService,
		public idpEnumUtils: IdpServiceEnumUtils,
		private cultureService: CultureService,
		private uiNotificationService: UiNotificationService,
		private logger: LoggingService,
		private invitationService: InvitationService,
		public languageService: LanguageService,
		private authProviderService: AuthProviderService,
		private totpService: TotpService,
		private credentialResetService: CredentialResetService,
		private httpErrorHandlingService: HttpErrorHandlingService
	) {
		super();
	}

	ngOnInit(): void {
		this.authProviderService.getAuthenticationProviderManager()
			.pipe(takeUntil(this._destroyed))
			.subscribe(x => {
				this.authProviderManager = x;
			});

		if (this.userId) {
			this.idpUserService.getSingle(this.userId, [
				nameof<IdpServiceUser>(x => x.id), nameof<IdpServiceUser>(x => x.name),
				nameof<IdpServiceUser>(x => x.type), nameof<IdpServiceUser>(x => x.isActive),
				nameof<IdpServiceUser>(x => x.hash), nameof<IdpServiceUser>(x => x.updatedAt),
				nameof<IdpServiceUser>(x => x.credentials) + '.' + nameof<UserCredential>(x => x.provider),
			]).pipe(takeUntil(this._destroyed))
				.subscribe(
					data => {
						try {
							this.userCredentialProviders = (data.credentials || []).map(x => x.provider);
							return;
						} catch {
							this.logger.error('Could not parse User: ' + data);
							this.uiNotificationService.snackBarNotification(this.language.instant('COMMONS.ERRORS.DEFAULT'), SnackBarNotificationLevel.Error);
						}
					},
					error => this.onCallbackError(error)
				);
		}
	}

	saveCredentials(): void {
		this.idpUserService.updateUserCredentials(this.userId, this.userCredentialProviders)
			.pipe(takeUntil(this._destroyed))
			.subscribe(
				complete => this.onCallbackSuccess(),
				error => this.onCallbackError(error)
			);
	}

	public cancel(): void {
		this.router.navigate(['/users']);
	}

	public sendInvitation() {
		if (this.userId) {
			const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
				maxWidth: '300px',
				data: {
					message: this.language.instant('COMMONS.CONFIRMATION-DIALOG.SEND-INVITATION'),
					confirmButton: this.language.instant('COMMONS.CONFIRMATION-DIALOG.ACTIONS.CONFIRM'),
					cancelButton: this.language.instant('COMMONS.CONFIRMATION-DIALOG.ACTIONS.CANCEL')
				}
			});
			dialogRef.afterClosed().pipe(takeUntil(this._destroyed)).subscribe(result => {
				if (result) {
					const invitation: RegistrationInvitationPersist = {
						userId: this.userId
					};
					this.invitationService.submit(invitation).pipe(takeUntil(this._destroyed)).subscribe(
						validTime => this.onInvitationCallbackSuccess(validTime),
						error => this.onCallbackError(error)
					);
				}
			});
		}
	}

	removeCredential(index: number): void {
		this.userCredentialProviders.splice(index, 1);
		this.saveCredentials();
	}

	resetUserPass() {
		const dialogRef = this.dialog.open(UserPassOverrideDialogComponent, {
			width: '500px',
			data: {}
		});
		dialogRef.afterClosed().pipe(takeUntil(this._destroyed)).subscribe(result => {
			if (result) {
				this.totpService.askForTotpIfAvailable((totp: string) => {
					const userConsentPersists: OverrideUserPassCredential = {
						userId: this.userId,
						public: result.username,
						private: result.password
					};
					this.credentialResetService.userPassOverride(userConsentPersists, totp).pipe(takeUntil(this._destroyed)).subscribe(
						complete => this.onCallbackSuccess(),
						error => this.onCallbackError(error)
					);
				});
			}
		});
	}

	onCallbackSuccess(): void {
		this.uiNotificationService.snackBarNotification(this.language.instant('COMMONS.SNACK-BAR.SUCCESSFUL-UPDATE'), SnackBarNotificationLevel.Success);
		this.router.navigate(['/users']);
	}

	onInvitationCallbackSuccess(validTime): void {
		const message = this.language.instant('USER-SERVICE.USER-EDITOR.MESSAGES.INVITATION-SENT');
		const currentCulture = this.cultureService.getCurrentCulture();
		const dateFormatted = moment().locale(currentCulture.name).add(validTime).format('LLL');

		this.uiNotificationService.snackBarNotification(message + dateFormatted, SnackBarNotificationLevel.Success, 10000);
	}

	onCallbackError(errorResponse: HttpErrorResponse) {
		const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
		this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
	}
}
