
import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { RoleType } from '@app/core/enum/role-type.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { BaseComponent } from '@common/base/base.component';
import { FormService } from '@common/forms/form-service';
import { ValidationErrorModel } from '@common/forms/validation/error-model/validation-error-model';
import { MultipleAutoCompleteConfiguration } from '@common/modules/auto-complete/multiple/multiple-auto-complete-configuration';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { FilterService } from '@common/modules/text-filter/filter-service';
import { Guid } from '@common/types/guid';
import { IsActive } from '@idp-service/core/enum/is-active.enum';
import { UserType } from '@idp-service/core/enum/user-type.enum';
import { RegistrationInvitationPersist } from '@idp-service/core/model/registration-invitation.model';
import { InvitationService } from '@idp-service/services/http/invitation.service';
import { UserInvitationEditorModel } from '@idp-service/ui/user-invitation/user-invitation.model';
import { TranslateService } from '@ngx-translate/core';
import { UserServiceUser } from '@user-service/core/model/user.model';
import { UserLookup } from '@user-service/core/query/user.lookup';
import { CultureService } from '@user-service/services/culture.service';
import { UserService } from '@user-service/services/http/user.service';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';

@Component({
	selector: 'app-user-invitation',
	templateUrl: './user-invitation.component.html',
	styleUrls: ['./user-invitation.component.scss']
})
export class UserInvitationComponent extends BaseComponent implements OnInit {
	chipsSeparatorKeysCodes = [ENTER, COMMA, SPACE, 186]; // 186 is Semicolon

	@ViewChild('emailInput') emailInput: ElementRef;

	loading = false;

	private formBuilder: FormBuilder = new FormBuilder();
	formGroup: FormGroup = null;
	roleTypes = this.appEnumUtils.getEnumValues(RoleType);

	private validationErrorModel: ValidationErrorModel = new ValidationErrorModel();

	usersConfiguration: MultipleAutoCompleteConfiguration = {
		initialItems: this.initialUserItems.bind(this),
		filterFn: this.userFilterFn.bind(this),
		displayFn: (item: UserServiceUser) => item.name,
		titleFn: (item: UserServiceUser) => item.name,
	};

	constructor(
		private language: TranslateService,
		private formService: FormService,
		private invitationService: InvitationService,
		private cultureService: CultureService,
		private userService: UserService,
		private uiNotificationService: UiNotificationService,
		private httpErrorHandlingService: HttpErrorHandlingService,
		private filterService: FilterService,
		public appEnumUtils: AppEnumUtils
	) {
		super();
	}

	ngOnInit() {
		this.formGroup = this.buildForm();
	}

	buildForm(): FormGroup {
		return this.formBuilder.group({
			users: new FormControl({ value: undefined, disabled: false }, []),
			usersRole: new FormControl({ value: undefined, disabled: false }, []),
			emails: this.formBuilder.array([]),
			emailsRole: new FormControl({ value: undefined, disabled: false }, [])
		}, {
			validator: (control: AbstractControl): { [key: string]: any } => {
				const usersControl = control.get('users');
				const emailsControl = control.get('emails') as FormArray;

				let valid: Boolean = false;
				if (usersControl.value && usersControl.valid) { valid = true; }
				emailsControl.controls.forEach(element => {
					if (element.value && element.valid) { valid = true; }
				});
				return valid ? null : { 'oneValueRequiredError': { message: '' } };
			}
		});
	}

	resetForm() {
		this.formGroup = this.buildForm();
	}

	formSubmit(): void {
		this.formService.touchAllFormFields(this.formGroup);
		if (!this.isFormValid()) { return; }

		this.invitationService.submitAll(this.getTransformedValue()).pipe(takeUntil(this._destroyed)).subscribe(
			validTime => this.onCallbackSuccess(validTime),
			error => this.onCallbackError(error)
		);
	}

	getTransformedValue(): RegistrationInvitationPersist[] {
		let result: RegistrationInvitationPersist[] = [];
		const users = this.formGroup.get('users').value;
		const usersRole = this.formGroup.get('usersRole').value;
		if (users) {
			result = result.concat(users.map(user => ({ userId: user.id, role: usersRole } as RegistrationInvitationPersist)));
		}
		const emailsRole = this.formGroup.get('emailsRole').value;
		result = result.concat(this.formGroup.get('emails').value.map(item => ({ email: item.email, role: emailsRole } as RegistrationInvitationPersist)));
		return result;
	}

	isFormValid(): boolean {
		if (!this.formGroup.valid) { return false; }

		const userControls = (<FormArray>this.formGroup.get('users'));
		const emailControls = (<FormArray>this.formGroup.get('emails'));
		if (userControls.length === 0 && emailControls.length === 0) {
			return false;
		}

		return true;
	}

	addEmail(event: MatChipInputEvent) {
		const email = event.value ? event.value.trim() : null;

		if (email) {
			const userControls = (<FormArray>this.formGroup.get('users'));
			const emailControls = (<FormArray>this.formGroup.get('emails'));
			const newItem = new UserInvitationEditorModel();
			newItem.email = email;
			emailControls.push(newItem.buildFormForUserInvitationArray(this.validationErrorModel, emailControls, userControls));
		}

		// Reset the input value
		if (event.input) {
			event.input.value = '';
		}
		this.formService.validateAllFormFields(this.formGroup.get('emails'));
	}

	removeEmail(index: number) {
		const emailControls = (<FormArray>this.formGroup.get('emails'));
		emailControls.removeAt(index);
		this.emailInput.nativeElement.focus();
	}

	sendInvitations() {
		this.clearErrorModel();
	}

	getTooltipColor(element: AbstractControl): string {
		return element.get('email').hasError('backendError') ||
			element.get('email').hasError('email') ||
			element.get('email').hasError('required')
			? 'warn' : 'primary';
	}

	getTooltipMessage(element: AbstractControl, index: number): string {
		const addedIndex = (<FormArray>this.formGroup.get('users')).length; // must use this because we first send users and the emails to backend
		const errors: string[] = [];
		//if (element.get('email').hasError('backendError')) { errors.push(this.errorModel.emailMap.get(index + addedIndex)); }
		if (element.get('email').hasError('required')) { errors.push(this.language.instant('COMMONS.VALIDATION.REQUIRED')); }
		if (element.get('email').hasError('email')) { errors.push(this.language.instant('COMMONS.VALIDATION.EMAIL')); }
		return errors.join(', ');
	}

	getTooltipIsEnabled(element: AbstractControl): boolean {
		return element.get('email').hasError('backendError') ||
			element.get('email').hasError('email') ||
			element.get('email').hasError('required');
	}

	onCallbackSuccess(validTime): void {
		const message = this.language.instant('IDP-SERVICE.USER-INVITATION.SNACK-BAR.SUCCESS');
		const currentCulture = this.cultureService.getCurrentCulture();
		const dateFormatted = moment().locale(currentCulture.name).add(validTime).format('LLL');

		this.uiNotificationService.snackBarNotification(message + dateFormatted, SnackBarNotificationLevel.Success, 10000);

		this.loading = false;
		this.resetForm();
	}

	onCallbackError(errorResponse: HttpErrorResponse) {
		const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
		if (error.statusCode === 400) {
			this.validationErrorModel.fromJSONObject(errorResponse.error);
			this.setErrorModel();
		} else {
			this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
		}
	}

	clearErrorModel() {
		//this.formService.clearErrorModel(this.errorModel, this.validationErrorModel);
		this.formService.validateAllFormFields(this.formGroup);
	}

	setErrorModel() {
		//this.formService.setErrorModel(this.errorModel, this.validationErrorModel);
		this.formService.validateAllFormFields(this.formGroup);
	}

	getUserIdsFunction(items: UserInvitationEditorModel[]): Guid[] {
		const result: Guid[] = [];
		if (items && items.length) {
			items.forEach((i) => result.push(i.userId));
		}
		return result;
	}

	userHasErrorFunction(element: AbstractControl): boolean {
		return element.get('userId').hasError('backendError') ||
			element.get('userId').hasError('required');
	}

	userErrorTextFunction(element: AbstractControl, index: number): string {
		const errors: string[] = [];
		//if (element.get('userId').hasError('backendError')) { errors.push(this.errorModel.userIdMap.get(index)); }
		if (element.get('userId').hasError('required')) { errors.push(this.language.instant('COMMONS.VALIDATION.REQUIRED')); }
		return errors.join(', ');
	}

	displayFunctionUserChip(element?: FormGroup): string | undefined {
		return element ? `${element.get('name').value} (${element.get('email').value})` : undefined;
	}

	//binding is required if we need to access 'this' inside the function
	bindFunction(func: Function, context) {
		//return func.bind(context);
	}

	buildUserLookup(like?: string, excludedIds?: Guid[]): UserLookup {
		const lookup: UserLookup = new UserLookup();
		lookup.type = [UserType.Person];
		lookup.isActive = [IsActive.Active];
		lookup.project = {
			fields: [
				nameof<UserServiceUser>(x => x.id),
				nameof<UserServiceUser>(x => x.name),
				nameof<UserServiceUser>(x => x.hash),
				nameof<UserServiceUser>(x => x.updatedAt)
			]
		};
		if (like) { lookup.like = this.filterService.transformLike(like); }
		if (excludedIds && excludedIds.length > 0) { lookup.excludedIds = excludedIds; }
		return lookup;
	}

	initialUserItems(selectedItems?: UserServiceUser[]): Observable<UserServiceUser[]> {
		return this.userService.query(this.buildUserLookup(null, selectedItems ? selectedItems.map(x => x.id) : null)).pipe(map(x => x.items));
	}

	userFilterFn(searchQuery: string, selectedItems?: UserServiceUser[]): Observable<UserServiceUser[]> {
		return this.userService.query(this.buildUserLookup(searchQuery, selectedItems ? selectedItems.map(x => x.id) : null)).pipe(map(x => x.items));
	}

}
