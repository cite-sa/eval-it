import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BaseComponent } from '@common/base/base.component';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { TotpService } from '@idp-service/ui/totp/totp.service';
import { WhatYouKnowAboutMeValidate } from '@user-service/core/model/what-you-know-about-me.model';
import { WhatYouKnowAboutMeService } from '@user-service/services/http/what-you-know-about-me.service';
import { takeUntil } from 'rxjs/operators';

@Component({
	templateUrl: './what-you-know-about-me-validate.component.html',
	styleUrls: ['./what-you-know-about-me-validate.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class WhatYouKnowAboutMeValidateComponent extends BaseComponent implements OnInit {

	completed = false;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private whatYouKnowAboutMeService: WhatYouKnowAboutMeService,
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
				const item: WhatYouKnowAboutMeValidate = {
					token: token
				};
				this.whatYouKnowAboutMeService.validate(item)
					.pipe(takeUntil(this._destroyed))
					.subscribe(
						success => this.completed = true,
						error => this.onError(error)
					);
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
