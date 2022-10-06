import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AuthService } from '@app/core/services/ui/auth.service';
import { BaseComponent } from '@common/base/base.component';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { UserConsentPersist } from '@idp-service/core/model/consent.model';
import { ConsentService } from '@idp-service/services/http/consent.service';
import { ConsentValidity } from '@idp-service/ui/user-consents/editor/user-consents-editor.component';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-user-consents',
	templateUrl: './user-consents.component.html',
	styleUrls: ['./user-consents.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class UserConsentsComponent extends BaseComponent implements OnInit {

	consentsValidity: ConsentValidity;
	returnUrl: string;

	constructor(
		private authService: AuthService,
		private router: Router,
		private route: ActivatedRoute,
		private consentService: ConsentService,
		private uiNotificationService: UiNotificationService,
		private httpErrorHandlingService: HttpErrorHandlingService
	) {
		super();
	}

	ngOnInit(): void {
		this.route.queryParamMap.pipe(takeUntil(this._destroyed)).subscribe((paramMap: ParamMap) => {
			this.returnUrl = paramMap.get('returnUrl') || '/';
		});
	}

	public consentsValidityChanged(consentsValidity: ConsentValidity) {
		this.consentsValidity = consentsValidity;
	}

	public save() {
		const userConsentPersists: UserConsentPersist[] = this.consentsValidity.userConsents.map(x => {
			return {
				userId: this.authService.userId(),
				consentId: x.consentId,
				response: x.response
			};
		});
		this.consentService.persist(userConsentPersists).pipe(takeUntil(this._destroyed)).subscribe(
			complete => this.onCallbackSuccess(),
			error => this.onCallbackError(error)
		);
	}

	public cancel(): void {
		this.router.navigate([this.returnUrl]);
	}

	onCallbackSuccess(): void {
		// we need to refresh the page to apply culture changes
		window.location.href = this.returnUrl;
	}

	onCallbackError(errorResponse: HttpErrorResponse) {
		const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
		this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
	}
}
