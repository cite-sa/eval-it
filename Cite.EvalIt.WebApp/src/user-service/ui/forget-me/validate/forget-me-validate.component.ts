import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BaseComponent } from '@common/base/base.component';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { TotpService } from '@idp-service/ui/totp/totp.service';
import { ForgetMeValidate } from '@user-service/core/model/forget-me.model';
import { ForgetMeRequestService } from '@user-service/services/http/forget-me-request.service';
import { takeUntil } from 'rxjs/operators';

@Component({
	templateUrl: './forget-me-validate.component.html',
	styleUrls: ['./forget-me-validate.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class ForgetMeValidateComponent extends BaseComponent implements OnInit {

	completed = false;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private forgetMeService: ForgetMeRequestService,
		private totpService: TotpService,
		private uiNotificationService: UiNotificationService,
		private httpErrorHandlingService: HttpErrorHandlingService,
	) {
		super();
	}

	ngOnInit() {
		this.route.paramMap.pipe(takeUntil(this._destroyed)).subscribe((paramMap: ParamMap) => {
			const token = paramMap.get('token');
			const tenantCode = paramMap.get('tenantCode');

			if (token && tenantCode) {
				this.totpService.askForTotpIfAvailable((totp: string) => {
					const item: ForgetMeValidate = {
						token: token
					};
					this.forgetMeService.validate(item, totp)
						.pipe(takeUntil(this._destroyed))
						.subscribe(
							success => this.completed = true,
							error => this.onError(error)
						);
				});
			} else {
				this.router.navigate(['/']);
			}
		});
	}

	private onError(errorResponse: HttpErrorResponse) {
		const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
		this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
	}
}
