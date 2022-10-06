import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { TenantService } from '@app/core/services/http/tenant.service';
import { BaseComponent } from '@common/base/base.component';
import { FormService } from '@common/forms/form-service';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { Guid } from '@common/types/guid';
import { CredentialProvider } from '@idp-service/core/enum/credential-provider.enum';
import { ResetUserCredential } from '@idp-service/core/model/user-credential.model';
import { CredentialResetService } from '@idp-service/services/http/credential-reset.service';
import { PasswordResetModel } from '@idp-service/ui/password-reset/password-reset.model';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-password-reset',
	templateUrl: './password-reset.component.html',
	styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent extends BaseComponent implements OnInit {
	public loading = false;

	formGroup: FormGroup = null;
	passwordResetModel: PasswordResetModel = null;
	tenantId: Guid;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private language: TranslateService,
		private credentialResetService: CredentialResetService,
		private formService: FormService,
		private uiNotificationService: UiNotificationService,
		private httpErrorHandlingService: HttpErrorHandlingService,
		private tenantService: TenantService
	) {
		super();
	}

	ngOnInit() {
		this.route.paramMap.pipe(takeUntil(this._destroyed)).subscribe((paramMap: ParamMap) => {
			const token = paramMap.get('token');
			const tenantCode = paramMap.get('tenantCode');

			if (token && tenantCode) {
				this.tenantService.getSingle(tenantCode).pipe(takeUntil(this._destroyed)).subscribe(x => {
					this.tenantId = x.id;
				});

				this.passwordResetModel = new PasswordResetModel();
				this.passwordResetModel.token = token;
				this.formGroup = this.passwordResetModel.buildForm();
			} else {
				this.router.navigate(['/']);
			}
		});
	}

	formSubmit(): void {
		this.formService.touchAllFormFields(this.formGroup);
		if (!this.isFormValid()) { return; }

		this.loading = true;

		this.credentialResetService.resetProvider(this.getRequestObject(), this.tenantId)
			.pipe(takeUntil(this._destroyed)).subscribe(
				complete => this.onCallbackSuccess(),
				error => this.onCallbackError(error)
			);
	}

	getRequestObject(): ResetUserCredential {
		const item: ResetUserCredential = {
			provider: CredentialProvider.UserPass,
			token: this.formGroup.get('token').value,
			private: this.formGroup.get('password').value,
		};
		return item;
	}

	public isFormValid() {
		if (!this.formGroup.valid) { return false; }

		if (this.formGroup.get('password').value !== this.formGroup.get('passwordRepeat').value) {
			this.passwordResetModel.validationErrorModel.setError('PasswordRepeat', this.language.instant('COMMONS.VALIDATION.PASSWORD-MISMATCH'));
			this.setErrorModel();
			return false;
		}

		return true;
	}

	resetPassword() {
		this.clearErrorModel();
	}

	onCallbackSuccess(): void {
		this.uiNotificationService.snackBarNotification(this.language.instant('IDP-SERVICE.PASSWORD-RESET.SNACK-BAR.SUCCESS'), SnackBarNotificationLevel.Success);
		this.loading = false;
		this.router.navigate(['/']);
	}

	onCallbackError(errorResponse: HttpErrorResponse) {
		const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
		if (error.statusCode === 400) {
			this.passwordResetModel.validationErrorModel.fromJSONObject(errorResponse.error);
			this.formService.validateAllFormFields(this.formGroup);
		} else {
			this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
		}
		this.loading = false;
	}

	clearErrorModel() {
		this.passwordResetModel.validationErrorModel.clear();
		this.formService.validateAllFormFields(this.formGroup);
	}

	setErrorModel() {
		this.formService.validateAllFormFields(this.formGroup);
	}
}
