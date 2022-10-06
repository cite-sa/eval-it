import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { BaseComponent } from '@common/base/base.component';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { HttpErrorHandlingService, HttpError } from '@common/modules/errors/error-handling/http-error-handling.service';
import { UserService } from '@user-service/services/http/user.service';
import { UiNotificationService, SnackBarNotificationLevel } from '@common/modules/notification/ui-notification-service';
import { IdpService } from '@idp-service/services/http/idp.service';
import { FormService } from '@common/forms/form-service';
import { DirectLinkRegistrationInfo } from '@idp-service/core/model/direct-link-registration-info';
import { SignUpInfo } from '@idp-service/core/model/idp.model';
import { SignUpMode } from '@idp-service/core/enum/sign-up-mode.enum';
import { Guid } from '@common/types/guid';

@Component({
	selector: 'app-direct-link-mail-request',
	templateUrl: './direct-link-mail-request.component.html',
	styleUrls: ['./direct-link-mail-request.component.scss']
})
export class DirectLinkMailRequestComponent extends BaseComponent implements OnInit {
	private formBuilder: FormBuilder = new FormBuilder();
	formGroup: FormGroup = null;
	@Input() totpEnabled = false;
	@Input() tenantId: Guid;

	constructor(
		public installationConfiguration: InstallationConfigurationService,
		private zone: NgZone,
		private router: Router,
		private httpErrorHandlingService: HttpErrorHandlingService,
		public userService: UserService,
		private uiNotificationService: UiNotificationService,
		private idpService: IdpService,
		private formService: FormService,
		private language: TranslateService,
	) { super(); }

	ngOnInit() {
		this.formGroup = this.buildForm();
	}

	buildForm(): FormGroup {
		const formGroup = this.formBuilder.group({
			email: ['', [Validators.email, Validators.required]],
		});

		return formGroup;
	}

	public isFormValid() {
		this.formService.touchAllFormFields(this.formGroup);
		return this.formGroup.valid;
	}

	public register(): void {
		if (!this.isFormValid()) { return; }

		this.idpService.renewDirectLink(this.formGroup.get('email').value, this.tenantId)
			.pipe(takeUntil(this._destroyed))
			.subscribe(() => this.onDirectLinkRegisterSuccess(), (error) => this.onDirectLinkSignUpError(error));
	}

	onSignUpSuccess(): void {
		this.uiNotificationService.snackBarNotification(this.language.instant('COMMONS.SNACK-BAR.SUCCESSFUL-LOGIN'), SnackBarNotificationLevel.Success);
		this.zone.run(() => this.router.navigateByUrl('/'));
	}

	onDirectLinkRegisterSuccess(): void {
		this.zone.run(() => this.router.navigate(['/login/direct-link/' + this.tenantId.toString()], { queryParams: { check_mail: true } }));
	}

	onDirectLinkSignUpError(errorResponse: HttpErrorResponse) {
		if (errorResponse && errorResponse.error && errorResponse.error.code === 104) {
			this.uiNotificationService.snackBarNotification(this.language.instant('COMMONS.SNACK-BAR.INACTIVE-USER-EMAIL-IS-USED'), SnackBarNotificationLevel.Warning, 10000);
		} else if (errorResponse && errorResponse.error && errorResponse.error.code === 152) {
			this.zone.run(() => this.router.navigate(['/login/direct-link/' + this.tenantId.toString()], { queryParams: { check_mail: true } }));
		} else {
			const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
			this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
		}
	}
}
