import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '@app/core/services/ui/auth.service';
import { BaseComponent } from '@common/base/base.component';
import { FormService } from '@common/forms/form-service';
import { ConfirmationDialogComponent } from '@common/modules/confirmation-dialog/confirmation-dialog.component';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { TotpService } from '@idp-service/ui/totp/totp.service';
import { TranslateService } from '@ngx-translate/core';
import { CultureService } from '@user-service/services/culture.service';
import { EmailResetService } from '@user-service/services/http/email-reset.service';
import { UserProfileChangeEmailEditorModel } from '@user-service/ui/user-profile/contact-info/change-email-dialog/change-email-dialog.model';
import * as moment from 'moment';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-user-profile-change-email-dialog',
	templateUrl: './change-email-dialog.component.html',
	styleUrls: ['./change-email-dialog.component.scss']
})
export class UserProfileChangeEmailDialogComponent extends BaseComponent implements OnInit {

	formGroup: FormGroup;
	userProfileEmail: UserProfileChangeEmailEditorModel;

	constructor(
		private dialog: MatDialog,
		public dialogRef: MatDialogRef<UserProfileChangeEmailDialogComponent>,
		private emailResetService: EmailResetService,
		private formService: FormService,
		private uiNotificationService: UiNotificationService,
		private httpErrorHandlingService: HttpErrorHandlingService,
		private authService: AuthService,
		private language: TranslateService,
		private cultureService: CultureService,
		private totpService: TotpService
	) {
		super();
	}

	ngOnInit(): void {
		this.userProfileEmail = new UserProfileChangeEmailEditorModel();
		this.formGroup = this.userProfileEmail.buildForm();
	}

	submit(): void {
		this.clearErrorModel();

		this.formService.touchAllFormFields(this.formGroup);
		if (!this.isFormValid()) { return; }

		this.totpService.askForTotpIfAvailable((totp: string) => {
			this.persist(this.formGroup.get('email').value, totp);
		});
	}

	private persist(email: string, totp: string): void {
		const tenantId = this.authService.tenantId();
		if (tenantId) {
			this.emailResetService.emailResetRequest({ email: email }, totp)
				.pipe(takeUntil(this._destroyed))
				.subscribe(
					validTime => this.onCallbackSuccess(validTime),
					error => this.onCallbackError(error)
				);
		}
	}

	removeEmail() {
		const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
			data: {
				message: this.language.instant('USER-SERVICE.USER-PROFILE-COMPONENT.CHANGE-EMAIL-DIALOG.REMOVE-CONFIRMATION'),
				confirmButton: this.language.instant('COMMONS.CONFIRMATION-DIALOG.ACTIONS.CONFIRM'),
				cancelButton: this.language.instant('COMMONS.CONFIRMATION-DIALOG.ACTIONS.CANCEL')
			}
		});
		dialogRef.afterClosed().pipe(takeUntil(this._destroyed)).subscribe(result => {
			if (result) {
				this.totpService.askForTotpIfAvailable((totp: string) => {
					this.persist('', totp);
				});
			}
		});
	}

	getTransformedValue(): any {
		const obj = this.formGroup.value;
		delete obj.emailRepeat;
		return obj;
	}

	public isFormValid() {
		if (!this.formGroup.valid) { return false; }

		const value = this.formGroup.value;
		if (value.email !== value.emailRepeat) {
			this.userProfileEmail.validationErrorModel.setError(`EmailRepeat`, this.language.instant('COMMONS.VALIDATION.EMAIL-MISMATCH'));
			this.formService.validateAllFormFields(this.formGroup);
			return false;
		}

		return true;
	}

	cancel() {
		this.dialogRef.close();
	}

	onCallbackSuccess(validTime): void {
		const message = this.language.instant('USER-SERVICE.USER-PROFILE-COMPONENT.CHANGE-EMAIL-DIALOG.SUCCESS');
		const currentCulture = this.cultureService.getCurrentCulture();
		const dateFormatted = moment().locale(currentCulture.name).add(validTime, 'seconds').format('LLL');

		this.uiNotificationService.snackBarNotification(message + dateFormatted, SnackBarNotificationLevel.Success, 10000);
		this.dialogRef.close();
	}

	onCallbackError(errorResponse: HttpErrorResponse) {
		const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
		if (error.statusCode === 400) {
			this.userProfileEmail.validationErrorModel.fromJSONObject(errorResponse.error);
			this.formService.validateAllFormFields(this.formGroup);
		} else {
			this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
		}
	}

	clearErrorModel() {
		this.userProfileEmail.validationErrorModel.clear();
		this.formService.validateAllFormFields(this.formGroup);
	}
}
