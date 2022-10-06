import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CultureService } from '@user-service/services/culture.service';
import { BaseComponent } from '@common/base/base.component';
import { FormService } from '@common/forms/form-service';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { CredentialProvider } from '@idp-service/core/enum/credential-provider.enum';
import { RecoveryInfoType } from '@idp-service/core/enum/recovery-info-type.enum';
import { CredentialResetRequest } from '@idp-service/core/model/user-recovery-info.model';
import { CredentialResetService } from '@idp-service/services/http/credential-reset.service';
import { PassWordResetPopupModel } from '@idp-service/ui/login/password-reset-popup/password-reset-popup.model';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-password-reset-popup',
	templateUrl: './password-reset-popup.component.html',
	styleUrls: ['./password-reset-popup.component.scss']
})
export class PasswordResetPopupComponent extends BaseComponent implements OnInit {
	public loading = false;

	formGroup: FormGroup = null;
	passWordResetModel: PassWordResetPopupModel = null;

	constructor(
		private dialogRef: MatDialogRef<PasswordResetPopupComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private language: TranslateService,
		private credentialResetService: CredentialResetService,
		private formService: FormService,
		private cultureService: CultureService,
		private uiNotificationService: UiNotificationService,
		private httpErrorHandlingService: HttpErrorHandlingService,
		public installationConfiguration: InstallationConfigurationService
	) {
		super();
	}

	ngOnInit() {
		this.passWordResetModel = new PassWordResetPopupModel();
		this.formGroup = this.passWordResetModel.buildForm();
	}

	formSubmit(): void {
		this.formService.touchAllFormFields(this.formGroup);
		if (!this.isFormValid()) { return; }

		this.loading = true;

		const item: CredentialResetRequest = {
			provider: CredentialProvider.UserPass,
			recoveryType: RecoveryInfoType.Email,
			value: this.formGroup.get('email').value,
			recaptcha: this.formGroup.get('recaptcha').value
		};

		this.credentialResetService.request(item, this.data.tenantId).pipe(takeUntil(this._destroyed)).subscribe(
			validTime => this.onCallbackSuccess(validTime),
			error => this.onCallbackError(error)
		);
	}

	public isFormValid() {
		return this.formGroup.valid;
	}

	resetPassword() {
		this.passWordResetModel.validationErrorModel.clear();
		this.formService.validateAllFormFields(this.formGroup);
	}

	onCallbackSuccess(validTime): void {
		const message = this.language.instant('IDP-SERVICE.PASSWORD-RESET-POPUP.SNACK-BAR.SUCCESS');
		const currentCulture = this.cultureService.getCurrentCulture();
		const dateFormatted = moment().locale(currentCulture.name).add(validTime).format('LLL');

		this.uiNotificationService.snackBarNotification(message + dateFormatted, SnackBarNotificationLevel.Success, 10000);

		this.loading = false;
		this.dialogRef.close();
	}

	onCallbackError(errorResponse: HttpErrorResponse) {
		const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
		if (error.statusCode === 400) {
			this.passWordResetModel.validationErrorModel.fromJSONObject(errorResponse.error);
			this.formService.validateAllFormFields(this.formGroup);
		} else {
			this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
		}
		this.loading = false;
	}
}

