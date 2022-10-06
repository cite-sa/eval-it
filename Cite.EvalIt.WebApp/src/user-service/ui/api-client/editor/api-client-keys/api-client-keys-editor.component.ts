import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '@app/core/services/ui/auth.service';
import { BaseComponent } from '@common/base/base.component';
import { LoggingService } from '@common/logging/logging-service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { Guid } from '@common/types/guid';
import { CredentialProvider } from '@idp-service/core/enum/credential-provider.enum';
import { IdpServiceEnumUtils } from '@idp-service/core/formatting/enum-utils.service';
import { UserCredential } from '@idp-service/core/model/user-credential.model';
import { IdpServiceUser } from '@idp-service/core/model/user.model';
import { AuthProviderService } from '@idp-service/services/auth-provider.service';
import { CredentialProviderService } from '@idp-service/services/http/credential-provider.service';
import { UserService as IdpUserService } from '@idp-service/services/http/user.service';
import { AuthProviderManager } from '@idp-service/ui/auth-providers/manager/auth-provider-manager';
import { TotpService } from '@idp-service/ui/totp/totp.service';
import { TranslateService } from '@ngx-translate/core';
import { CultureService } from '@user-service/services/culture.service';
import { LanguageService } from '@user-service/services/language.service';
import { ApiKeyPopupDialogComponent } from '@user-service/ui/api-client/editor/api-key-popup/api-key-popup.component';
import { takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';

@Component({
	selector: 'app-api-client-keys-editor',
	templateUrl: './api-client-keys-editor.component.html',
	styleUrls: ['./api-client-keys-editor.component.scss']
})
export class ApiClientKeysEditorComponent extends BaseComponent implements OnInit {

	@Input() userId: Guid;
	userCredentialProviders: CredentialProvider[] = [];
	formGroup: FormGroup = null;
	authProviderManager: AuthProviderManager;

	constructor(
		private dialog: MatDialog,
		public authService: AuthService,
		private idpUserService: IdpUserService,
		private router: Router,
		private language: TranslateService,
		public idpEnumUtils: IdpServiceEnumUtils,
		private cultureService: CultureService,
		private uiNotificationService: UiNotificationService,
		private logger: LoggingService,
		public languageService: LanguageService,
		private authProviderService: AuthProviderService,
		private credentialProviderService: CredentialProviderService,
		private totpService: TotpService
	) {
		super();
	}

	ngOnInit(): void {
		this.authProviderService.getAuthenticationProviderManager()
			.pipe(takeUntil(this._destroyed))
			.subscribe(x => {
				this.authProviderManager = x;
			});

		if (this.userId) { this.getCredentials(); }
	}

	getCredentials() {
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

	removeCredential(index: number): void {
		this.userCredentialProviders.splice(index, 1);
		this.saveCredentials();
	}

	resetUserPass() {

	}

	onCallbackSuccess(): void {
		this.uiNotificationService.snackBarNotification(this.language.instant('COMMONS.SNACK-BAR.SUCCESSFUL-UPDATE'), SnackBarNotificationLevel.Success);
		this.router.navigate(['/users']);
	}

	onCallbackError(errorResponse: HttpErrorResponse) {
		//ΤODO
		// const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
		// if (error.statusCode === 400) {
		// 	this.user.validationErrorModel.fromJSONObject(errorResponse.error);
		// 	this.formService.validateAllFormFields(this.formGroup);
		// } else {
		// 	this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
		// }
	}

	createNewApiKey() {
		this.totpService.askForTotpIfAvailable((totp: string) => {
			this.credentialProviderService.generateApiKey(this.userId, totp)
				.pipe(
					takeUntil(this._destroyed)
				)
				.subscribe(x => {
					const dialogRef = this.dialog.open(ApiKeyPopupDialogComponent, {
						maxWidth: '600px',
						data: x
					});
					dialogRef.afterClosed()
						.pipe(takeUntil(this._destroyed))
						.subscribe(result => {
							this.getCredentials();
						});
				});
		});
	}
}
