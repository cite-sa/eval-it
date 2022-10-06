import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AuthService } from '@app/core/services/ui/auth.service';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { LoggingService } from '@common/logging/logging-service';
import { BaseComponent } from '@common/base/base.component';
import { FormService } from '@common/forms/form-service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { TranslateService } from '@ngx-translate/core';
import { ContactInfoType } from '@user-service/core/enum/contact-info-type.enum';
import { UserServiceUser, UserServiceUserContactInfo } from '@user-service/core/model/user.model';
import { UserService } from '@user-service/services/http/user.service';
import { UserProfileChangeEmailDialogComponent } from '@user-service/ui/user-profile/contact-info/change-email-dialog/change-email-dialog.component';
import { UserProfileContactInfoEditorModel } from '@user-service/ui/user-profile/contact-info/contact-info-editor.model';
import { takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';

@Component({
	selector: 'app-contact-info-editor',
	templateUrl: './contact-info-editor.component.html',
	styleUrls: ['./contact-info-editor.component.scss']
})
export class UserProfileContactInfoEditorComponent extends BaseComponent implements OnInit {

	returnUrl: string;
	formGroup: FormGroup;
	contactInfoModel: UserProfileContactInfoEditorModel;
	user: UserServiceUser;
	contactInfoTypeEnum = ContactInfoType;

	constructor(
		private dialog: MatDialog,
		private userService: UserService,
		private route: ActivatedRoute,
		private router: Router,
		private language: TranslateService,
		private authService: AuthService,
		private formService: FormService,
		private uiNotificationService: UiNotificationService,
		private logger: LoggingService,
		private httpErrorHandlingService: HttpErrorHandlingService,
	) {
		super();
	}

	ngOnInit(): void {
		this.route.queryParamMap.pipe(takeUntil(this._destroyed)).subscribe((paramMap: ParamMap) => {
			this.returnUrl = paramMap.get('returnUrl') || '/';
		});

		const userId = this.authService.userId();
		if (userId) {
			this.userService.getSingle(userId, [
				nameof<UserServiceUser>(x => x.id),
				nameof<UserServiceUser>(x => x.hash),
				nameof<UserServiceUser>(x => x.contacts) + '.' + nameof<UserServiceUserContactInfo>(x => x.type),
				nameof<UserServiceUser>(x => x.contacts) + '.' + nameof<UserServiceUserContactInfo>(x => x.value),
			]).pipe(takeUntil(this._destroyed))
				.subscribe(
					data => {
						try {
							this.user = data;
							this.contactInfoModel = new UserProfileContactInfoEditorModel().fromModel(this.user);
							this.formGroup = this.contactInfoModel.buildForm();
						} catch {
							this.logger.error('Could not parse UserProfile: ' + data);
							this.uiNotificationService.snackBarNotification(this.language.instant('COMMONS.ERRORS.DEFAULT'), SnackBarNotificationLevel.Error);
						}
					},
					error => this.onCallbackError(error)
				);
		}
	}

	formSubmit(): void {
		this.formService.touchAllFormFields(this.formGroup);
		if (!this.isFormValid()) { return; }

		this.userService.updateUserProfileContacts(this.formGroup.value)
			.pipe(takeUntil(this._destroyed))
			.subscribe(
				complete => this.onCallbackSuccess(),
				error => this.onCallbackError(error)
			);
	}

	public isFormValid() {
		return this.formGroup.valid;
	}

	public save() {
		this.clearErrorModel();
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
		if (error.statusCode === 400) {
			this.contactInfoModel.validationErrorModel.fromJSONObject(errorResponse.error);
			this.formService.validateAllFormFields(this.formGroup);
		} else {
			this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
		}
	}

	clearErrorModel() {
		this.contactInfoModel.validationErrorModel.clear();
		this.formService.validateAllFormFields(this.formGroup);
	}

	changeEmail() {
		const dialogRef = this.dialog.open(UserProfileChangeEmailDialogComponent, {
			data: {}
		});
	}

	getHtmlElementContactInfoTypeName(contactInfoType: ContactInfoType): string {
		switch (contactInfoType) {
			case ContactInfoType.MobilePhone: return 'mobilePhone';
			case ContactInfoType.LandLinePhone: return 'landLinePhone';
			default: return null;
		}
	}

	getHtmlElementContactInfoTypePlaceholder(contactInfoType: ContactInfoType): string {
		switch (contactInfoType) {
			case ContactInfoType.MobilePhone: return this.language.instant('USER-SERVICE.USER-PROFILE-COMPONENT.CONTACT-INFO.MOBILE-PHONE');
			case ContactInfoType.LandLinePhone: return this.language.instant('USER-SERVICE.USER-PROFILE-COMPONENT.CONTACT-INFO.LANDLINE-PHONE');
			default: return null;
		}
	}

	getEmail(): string {
		if (!this.user || !Array.isArray(this.user.contacts)) { return ''; }
		const email = this.user.contacts.filter(x => x.type === ContactInfoType.Email)[0];
		return email ? email.value : '';
	}
}
