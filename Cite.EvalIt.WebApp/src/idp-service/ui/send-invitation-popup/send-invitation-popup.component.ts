import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CultureService } from '@user-service/services/culture.service';
import { BaseComponent } from '@common/base/base.component';
import { FormService } from '@common/forms/form-service';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { InvitationService } from '@idp-service/services/http/invitation.service';
import { InvitationEditorModel } from '@idp-service/ui/send-invitation-popup/invitation-editor.model';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-send-invitation-popup',
	templateUrl: './send-invitation-popup.component.html',
	styleUrls: ['./send-invitation-popup.component.scss']
})
export class SendInvitationPopupComponent extends BaseComponent implements OnInit {
	public loading = false;

	invitation: InvitationEditorModel;
	formGroup: FormGroup = null;

	constructor(
		private dialogRef: MatDialogRef<SendInvitationPopupComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private language: TranslateService,
		private invitationService: InvitationService,
		private formService: FormService,
		private cultureService: CultureService,
		private uiNotificationService: UiNotificationService,
		private httpErrorHandlingService: HttpErrorHandlingService
	) {
		super();
	}

	ngOnInit() {
		this.invitation = new InvitationEditorModel();
		this.invitation.userId = this.data.userId;
		this.invitation.email = this.data.email;

		this.formGroup = this.invitation.buildForm();
	}

	formSubmit(): void {
		this.formService.touchAllFormFields(this.formGroup);
		if (!this.isFormValid()) { return; }

		this.loading = true;

		this.invitationService.submit(this.formGroup.value)
			.pipe(takeUntil(this._destroyed))
			.subscribe(
				validTime => this.onCallbackSuccess(validTime),
				error => this.onCallbackError(error)
			);
	}

	public isFormValid() {
		return this.formGroup.valid;
	}

	resetPassword() {
		this.invitation.validationErrorModel.clear();
		this.formService.validateAllFormFields(this.formGroup);
	}

	onCallbackSuccess(validTime): void {
		const message = this.language.instant('IDP-SERVICE.SEND-INVITATION-POPUP.SNACK-BAR.SUCCESS');
		const currentCulture = this.cultureService.getCurrentCulture();
		const dateFormatted = moment().locale(currentCulture.name).add(validTime).format('LLL');

		this.uiNotificationService.snackBarNotification(message + dateFormatted, SnackBarNotificationLevel.Success, 10000);
		this.loading = false;
		this.dialogRef.close();
	}

	onCallbackError(errorResponse: HttpErrorResponse) {
		const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
		if (error.statusCode === 400) {
			this.invitation.validationErrorModel.fromJSONObject(errorResponse.error);
			this.formService.validateAllFormFields(this.formGroup);
		} else {
			this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
		}
		this.loading = false;
	}
}
