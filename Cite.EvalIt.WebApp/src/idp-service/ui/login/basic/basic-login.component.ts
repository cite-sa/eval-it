import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BaseComponent } from '@common/base/base.component';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { Guid } from '@common/types/guid';
import { Credential } from '@idp-service/core/model/idp.model';
import { IdpService } from '@idp-service/services/http/idp.service';
import { PasswordResetPopupComponent } from '@idp-service/ui/login/password-reset-popup/password-reset-popup.component';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-basic-login',
	templateUrl: './basic-login.component.html',
	styleUrls: ['./basic-login.component.scss']
})
export class BasicLoginComponent extends BaseComponent implements OnInit {

	@Output() onAuthenticateSuccess = new EventEmitter<any>();

	private formBuilder: FormBuilder = new FormBuilder();
	formGroup: FormGroup = null;
	@Input() tenantId: Guid;
	@Input() totpEnabled = false;

	constructor(
		private dialog: MatDialog,
		private idpService: IdpService,
		private language: TranslateService,
		private uiNotificationService: UiNotificationService,
		private httpErrorHandlingService: HttpErrorHandlingService
	) { super(); }

	ngOnInit() {
		this.formGroup = this.buildForm();
	}

	buildForm(): FormGroup {
		return this.formBuilder.group({
			username: ['', [Validators.required]],
			password: ['', [Validators.required]],
			totp: ['', []],
		});
	}

	public isFormValid() {
		return this.formGroup.valid;
	}

	login() {
		if (!this.isFormValid()) { return; }

		const credential: Credential = {
			username: this.formGroup.get('username').value,
			password: this.formGroup.get('password').value
		};
		const totpCode = this.totpEnabled ? this.formGroup.get('totp').value : undefined;
		this.idpService.login(credential, this.tenantId, totpCode).pipe(takeUntil(this._destroyed)).subscribe(
			account => this.onLoginSuccess(),
			error => this.onLoginError(error)
		);
	}

	passwordReset() {
		const dialogRef = this.dialog.open(PasswordResetPopupComponent, {
			width: '350px',
			data: {
				tenantId: this.tenantId
			}
		});
	}

	private onLoginSuccess(): void {
		this.uiNotificationService.snackBarNotification(this.language.instant('COMMONS.SNACK-BAR.SUCCESSFUL-LOGIN'), SnackBarNotificationLevel.Success);
		this.onAuthenticateSuccess.emit();
	}

	private onLoginError(errorResponse: HttpErrorResponse) {
		const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
		this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
	}
}
