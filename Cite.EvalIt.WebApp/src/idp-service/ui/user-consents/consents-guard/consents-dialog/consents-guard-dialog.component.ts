import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from '@app/core/services/ui/auth.service';
import { BaseComponent } from '@common/base/base.component';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { Guid } from '@common/types/guid';
import { UserConsentPersist } from '@idp-service/core/model/consent.model';
import { ConsentService } from '@idp-service/services/http/consent.service';
import { TotpService } from '@idp-service/ui/totp/totp.service';
import { ConsentValidity } from '@idp-service/ui/user-consents/editor/user-consents-editor.component';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-consents-guard-dialog-component',
	templateUrl: './consents-guard-dialog.component.html',
	styleUrls: ['./consents-guard-dialog.component.scss']
})
export class ConsentsGuardDialogComponent extends BaseComponent implements OnInit {

	consentsValidity: ConsentValidity;
	requirements: Guid[];

	constructor(
		public dialogRef: MatDialogRef<ConsentsGuardDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private authService: AuthService,
		private consentService: ConsentService,
		private uiNotificationService: UiNotificationService,
		private httpErrorHandlingService: HttpErrorHandlingService,
		private totpService: TotpService
	) {
		super();

		this.requirements = data.requirements;
	}

	ngOnInit(): void {

	}

	public consentsValidityChanged(consentsValidity: ConsentValidity) {
		this.consentsValidity = consentsValidity;
	}

	public save() {
		this.totpService.askForTotpIfAvailable((totp: string) => {
			const userConsentPersists: UserConsentPersist[] = this.consentsValidity.userConsents.map(x => {
				return {
					userId: this.authService.userId(),
					consentId: x.consentId,
					response: x.response
				};
			});
			this.consentService.persist(userConsentPersists, totp).pipe(takeUntil(this._destroyed)).subscribe(
				complete => this.onCallbackSuccess(),
				error => this.onCallbackError(error)
			);
		});
	}

	public cancel(): void {
		this.dialogRef.close(false);
	}

	onCallbackSuccess(): void {
		this.dialogRef.close(true);
	}

	onCallbackError(errorResponse: HttpErrorResponse) {
		const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
		this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
	}
}
