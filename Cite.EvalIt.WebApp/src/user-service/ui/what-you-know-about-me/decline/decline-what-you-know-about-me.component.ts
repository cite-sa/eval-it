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
import { TranslateService } from '@ngx-translate/core';
import { WhatYouKnowAboutMeService } from '@user-service/services/http/what-you-know-about-me.service';
import { WhatYouKnowAboutMeDeclineModel } from '@user-service/ui/what-you-know-about-me/decline/what-you-know-about-me-decline.model';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-decline-what-you-know-about-me',
	templateUrl: './decline-what-you-know-about-me.component.html',
	styleUrls: ['./decline-what-you-know-about-me.component.scss']
})
export class DeclineWhatYouKnowAboutMeComponent extends BaseComponent implements OnInit {
	public loading = false;

	formGroup: FormGroup = null;
	whatYouKnowAboutMeDeclineModel: WhatYouKnowAboutMeDeclineModel = null;
	tenantId: Guid;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private language: TranslateService,
		private whatYouKnowAboutMeService: WhatYouKnowAboutMeService,
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

				this.whatYouKnowAboutMeDeclineModel = new WhatYouKnowAboutMeDeclineModel();
				this.whatYouKnowAboutMeDeclineModel.token = token;
				this.formGroup = this.whatYouKnowAboutMeDeclineModel.buildForm();
			}
		});
	}

	formSubmit(): void {
		this.formService.touchAllFormFields(this.formGroup);
		if (!this.isFormValid()) { return; }

		this.whatYouKnowAboutMeService.decline(this.formGroup.value).pipe(takeUntil(this._destroyed)).subscribe(
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
		this.uiNotificationService.snackBarNotification(this.language.instant('USER-SERVICE.DECLINE-WHAT-YOU-KNOW-ABOUT-ME.SNACK-BAR.SUCCESS'), SnackBarNotificationLevel.Success);
		this.loading = false;
		this.router.navigate(['/']);
	}

	onCallbackError(errorResponse: HttpErrorResponse) {
		const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
		if (error.statusCode === 400) {
			this.whatYouKnowAboutMeDeclineModel.validationErrorModel.fromJSONObject(errorResponse.error);
			this.formService.validateAllFormFields(this.formGroup);
		} else {
			this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
		}
		this.loading = false;
	}

	clearErrorModel() {
		this.whatYouKnowAboutMeDeclineModel.validationErrorModel.clear();
		this.formService.validateAllFormFields(this.formGroup);
	}

	setErrorModel() {
		this.formService.validateAllFormFields(this.formGroup);
	}
}
