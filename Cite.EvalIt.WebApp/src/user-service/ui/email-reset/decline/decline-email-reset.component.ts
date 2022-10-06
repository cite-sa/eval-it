import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { TenantService } from '@app/core/services/http/tenant.service';
import { BaseComponent } from '@common/base/base.component';
import { FormService } from '@common/forms/form-service';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { Guid } from '@common/types/guid';
import { TranslateService } from '@ngx-translate/core';
import { EmailResetService } from '@user-service/services/http/email-reset.service';
import { UserEmailResetDeclineModel } from '@user-service/ui/email-reset/decline/user-email-reset-decline.model';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-decline-email-reset',
	templateUrl: './decline-email-reset.component.html',
	styleUrls: ['./decline-email-reset.component.scss']
})
export class DeclineEmailResetComponent extends BaseComponent implements OnInit {
	public loading = false;

	formGroup: FormGroup = null;
	userEmailResetDeclineModel: UserEmailResetDeclineModel = null;
	tenantId: Guid;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private language: TranslateService,
		private emailResetService: EmailResetService,
		private formService: FormService,
		private uiNotificationService: UiNotificationService,
		private httpErrorHandlingService: HttpErrorHandlingService,
		private tenantService: TenantService,
		public installationConfiguration: InstallationConfigurationService
	) {
		super();
	}

	ngOnInit() {
		let awareness = false;
		if (this.router.url.indexOf('/awareness/') > -1) {
			awareness = true;
		}
		this.route.paramMap.pipe(takeUntil(this._destroyed)).subscribe((paramMap: ParamMap) => {
			const token = paramMap.get('token');
			const tenantCode = paramMap.get('tenantCode');

			if (token && tenantCode) {
				this.tenantService.getSingle(tenantCode).pipe(takeUntil(this._destroyed)).subscribe(x => {
					this.tenantId = x.id;
				});

				this.userEmailResetDeclineModel = new UserEmailResetDeclineModel();
				this.userEmailResetDeclineModel.token = token;
				this.userEmailResetDeclineModel.fromAwareness = !!(awareness);
				this.formGroup = this.userEmailResetDeclineModel.buildForm();
			}
		});
	}

	formSubmit(): void {
		this.formService.touchAllFormFields(this.formGroup);
		if (!this.isFormValid()) { return; }

		this.loading = true;

		this.emailResetService.decline(this.formGroup.value, this.tenantId).pipe(takeUntil(this._destroyed)).subscribe(
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
		this.uiNotificationService.snackBarNotification(this.language.instant('USER-SERVICE.DECLINE-EMAIL-RESET.SNACK-BAR.SUCCESS'), SnackBarNotificationLevel.Success);
		this.loading = false;
		this.router.navigate(['/']);
	}

	onCallbackError(errorResponse: HttpErrorResponse) {
		const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
		if (error.statusCode === 400) {
			this.userEmailResetDeclineModel.validationErrorModel.fromJSONObject(errorResponse.error);
			this.formService.validateAllFormFields(this.formGroup);
		} else {
			this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
		}
		this.loading = false;
	}

	clearErrorModel() {
		this.userEmailResetDeclineModel.validationErrorModel.clear();
		this.formService.validateAllFormFields(this.formGroup);
	}

	setErrorModel() {
		this.formService.validateAllFormFields(this.formGroup);
	}
}
