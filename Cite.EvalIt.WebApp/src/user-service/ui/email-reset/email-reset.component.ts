import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { TenantService } from '@app/core/services/http/tenant.service';
import { BaseComponent } from '@common/base/base.component';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { TranslateService } from '@ngx-translate/core';
import { EmailResetService } from '@user-service/services/http/email-reset.service';
import { takeUntil } from 'rxjs/operators';
import { ResetUserEmail } from '@user-service/core/model/email-reset.model';

@Component({
	selector: 'app-email-reset',
	templateUrl: './email-reset.component.html',
	styleUrls: ['./email-reset.component.scss']
})
export class EmailResetComponent extends BaseComponent implements OnInit {
	public loading = false;
	public succeeded = false;

	constructor(
		private route: ActivatedRoute,
		private language: TranslateService,
		private emailResetService: EmailResetService,
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
					const tenantId = x.id;
					//TODO do we need tenant here?
					const emailResetModel: ResetUserEmail = {
						token: token
					};

					this.loading = true;
					this.emailResetService.resetEmail(emailResetModel)
						.pipe(takeUntil(this._destroyed)).subscribe(
							complete => this.onCallbackSuccess(),
							error => this.onCallbackError(error)
						);
				});
			} else {
				this.succeeded = false;
			}
		});
	}

	onCallbackSuccess(): void {
		this.uiNotificationService.snackBarNotification(this.language.instant('USER-SERVICE.EMAIL-RESET.SNACK-BAR.SUCCESS'), SnackBarNotificationLevel.Success);
		this.loading = false;
		this.succeeded = true;
	}

	onCallbackError(errorResponse: HttpErrorResponse) {
		const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
		this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
		this.loading = false;
		this.succeeded = false;
	}
}
