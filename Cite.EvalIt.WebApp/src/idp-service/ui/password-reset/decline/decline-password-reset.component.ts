import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { TenantService } from '@app/core/services/http/tenant.service';
import { BaseComponent } from '@common/base/base.component';
import { FormService } from '@common/forms/form-service';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { Guid } from '@common/types/guid';
import { CredentialResetService } from '@idp-service/services/http/credential-reset.service';
import { UserCredentialDeclineModel } from '@idp-service/ui/password-reset/decline/user-credential-decline.model';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-decline-password-reset',
	templateUrl: './decline-password-reset.component.html',
	styleUrls: ['./decline-password-reset.component.scss']
})
export class DeclinePasswordResetComponent extends BaseComponent implements OnInit {
	public loading = false;

	formGroup: FormGroup = null;
	userCredentialDeclineModel: UserCredentialDeclineModel = null;
	tenantId: Guid;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private language: TranslateService,
		private credentialResetService: CredentialResetService,
		private formService: FormService,
		private uiNotificationService: UiNotificationService,
		private httpErrorHandlingService: HttpErrorHandlingService,
		private tenantService: TenantService,
		public installationConfiguration: InstallationConfigurationService
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

				this.userCredentialDeclineModel = new UserCredentialDeclineModel();
				this.userCredentialDeclineModel.token = token;
				this.formGroup = this.userCredentialDeclineModel.buildForm();
			}
		});
	}

	formSubmit(): void {
		this.formService.touchAllFormFields(this.formGroup);
		if (!this.isFormValid()) { return; }

		this.loading = true;

		this.credentialResetService.decline(this.formGroup.value, this.tenantId).pipe(takeUntil(this._destroyed)).subscribe(
			complete => this.onCallbackSuccess(),
			error => this.onCallbackError(error)
		);
	}

	public isFormValid() {
		return this.formGroup.valid;
	}

	decline() {
		this.clearErrorModel();
	}

	onCallbackSuccess(): void {
		this.uiNotificationService.snackBarNotification(this.language.instant('IDP-SERVICE.DECLINE-PASSWORD-RESET.SNACK-BAR.SUCCESS'), SnackBarNotificationLevel.Success);
		this.loading = false;
		this.router.navigate(['/']);
	}

	onCallbackError(errorResponse: HttpErrorResponse) {
		const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
		if (error.statusCode === 400) {
			this.userCredentialDeclineModel.validationErrorModel.fromJSONObject(errorResponse.error);
			this.formService.validateAllFormFields(this.formGroup);
		} else {
			this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
		}
		this.loading = false;
	}

	clearErrorModel() {
		this.userCredentialDeclineModel.validationErrorModel.clear();
		this.formService.validateAllFormFields(this.formGroup);
	}

	setErrorModel() {
		this.formService.validateAllFormFields(this.formGroup);
	}
}
