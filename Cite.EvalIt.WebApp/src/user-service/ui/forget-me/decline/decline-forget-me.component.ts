import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { TenantService } from '@app/core/services/http/tenant.service';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { BaseComponent } from '@common/base/base.component';
import { FormService } from '@common/forms/form-service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { Guid } from '@common/types/guid';
import { TranslateService } from '@ngx-translate/core';
import { ForgetMeRequestService } from '@user-service/services/http/forget-me-request.service';
import { ForgetMeDeclineModel } from '@user-service/ui/forget-me/decline/forget-me-decline.model';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-decline-forget-me',
	templateUrl: './decline-forget-me.component.html',
	styleUrls: ['./decline-forget-me.component.scss']
})
export class DeclineForgetMeComponent extends BaseComponent implements OnInit {
	public loading = false;

	formGroup: FormGroup = null;
	forgetMeDeclineModel: ForgetMeDeclineModel = null;
	tenantId: Guid;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private language: TranslateService,
		private forgetMeService: ForgetMeRequestService,
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

				this.forgetMeDeclineModel = new ForgetMeDeclineModel();
				this.forgetMeDeclineModel.token = token;
				this.formGroup = this.forgetMeDeclineModel.buildForm();
			}
		});
	}

	formSubmit(): void {
		this.formService.touchAllFormFields(this.formGroup);
		if (!this.isFormValid()) { return; }

		this.forgetMeService.decline(this.formGroup.value).pipe(takeUntil(this._destroyed)).subscribe(
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
		this.uiNotificationService.snackBarNotification(this.language.instant('USER-SERVICE.DECLINE-FORGET-ME.SNACK-BAR.SUCCESS'), SnackBarNotificationLevel.Success);
		this.loading = false;
		this.router.navigate(['/']);
	}

	onCallbackError(errorResponse: HttpErrorResponse) {
		const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
		if (error.statusCode === 400) {
			this.forgetMeDeclineModel.validationErrorModel.fromJSONObject(errorResponse.error);
			this.formService.validateAllFormFields(this.formGroup);
		} else {
			this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
		}
		this.loading = false;
	}

	clearErrorModel() {
		this.forgetMeDeclineModel.validationErrorModel.clear();
		this.formService.validateAllFormFields(this.formGroup);
	}

	setErrorModel() {
		this.formService.validateAllFormFields(this.formGroup);
	}
}
