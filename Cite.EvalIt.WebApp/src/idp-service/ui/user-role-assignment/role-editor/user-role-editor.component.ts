import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { RoleType } from '@app/core/enum/role-type.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { AuthService } from '@app/core/services/ui/auth.service';
import { BaseComponent } from '@common/base/base.component';
import { FormService } from '@common/forms/form-service';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { UserClaimPersist } from '@idp-service/core/model/user-claim.model';
import { IdpServiceUser } from '@idp-service/core/model/user.model';
import { UserService as IdpUserService } from '@idp-service/services/http/user.service';
import { UserRoleEditorModel } from '@idp-service/ui/user-role-assignment/role-editor/user-role-editor.model';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-user-role-editor',
	templateUrl: './user-role-editor.component.html',
	styleUrls: ['./user-role-editor.component.scss']
})
export class UserRoleEditorComponent extends BaseComponent implements OnInit, OnChanges {

	@Input() item: IdpServiceUser;
	@Input() unsavedUser: IdpServiceUser;
	@Output() onRolesChanged = new EventEmitter<IdpServiceUser>();
	@Output() onRolesSaved = new EventEmitter();
	@Output() onRolesEditCanceled = new EventEmitter();
	
	userRoleValues: RoleType[] = this.appEnumUtils.getEnumValues(RoleType);

	nowEditing = false;
	formGroup: FormGroup = null;
	userRoleEditorModel: UserRoleEditorModel = null;

	constructor(
		public authService: AuthService,
		private idpUserService: IdpUserService,
		private language: TranslateService,
		public appEnumUtils: AppEnumUtils,
		private formService: FormService,
		private uiNotificationService: UiNotificationService,
		private httpErrorHandlingService: HttpErrorHandlingService
	) {
		super();
	}

	ngOnInit(): void {
		const disabled = !this.unsavedUser;
		this.nowEditing = !disabled;
		this.userRoleEditorModel = new UserRoleEditorModel();
		this.userRoleEditorModel.id = this.unsavedUser !== undefined ? this.unsavedUser.id : this.item.id;
		this.userRoleEditorModel.hash = this.unsavedUser !== undefined ? this.unsavedUser.hash : this.item.hash;

		this.userRoleEditorModel.roles = this.unsavedUser !== undefined ? this.getUserRoles(this.unsavedUser) : this.getUserRoles(this.item);
		this.formGroup = this.userRoleEditorModel.buildForm(null, disabled);
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes['item'] && !changes['item'].isFirstChange()) {
			this.updateForm();
		}
		else if (changes['unsavedUser'] && !changes['unsavedUser'].isFirstChange() && changes['unsavedUser'].currentValue == null && this.nowEditing)
		{
			this.updateForm();
		}
	}

	getUserRoles(item: IdpServiceUser): RoleType[] {
		const userRoles = [];
		if (item && item.claims) {
			item.claims.filter(x => x.claim === 'role').forEach(userClaim => {
				userRoles.push(userClaim.value);
			});
		}
		return userRoles;
	}

	updateForm() {
		this.formGroup.get('id').setValue(this.item.id, { emitEvent: false });
		this.formGroup.get('hash').setValue(this.item.hash, { emitEvent: false });

		if (this.unsavedUser) {
			this.formGroup.get('roles').setValue(this.getUserRoles(this.unsavedUser), { emitEvent: false });
			this.enableItemEditing();
		} else {
			this.formGroup.get('roles').setValue(this.getUserRoles(this.item), { emitEvent: false });
			this.disableItemEditing();
		}
	}

	formSubmit(): void {
		this.formService.touchAllFormFields(this.formGroup);
		if (!this.isFormValid()) { return; }

		this.idpUserService.updateUserClaims(this.userRoleEditorModel.id, this.readdNonRoleClaims(this.createUserClaimPersist(this.formGroup.value), this.item))
			.pipe(takeUntil(this._destroyed))
			.subscribe(
				complete => this.onCallbackSuccess(),
				error => this.onCallbackError(error)
			);
	}

	readdNonRoleClaims(roleClaims: UserClaimPersist[], existingUser: IdpServiceUser) : UserClaimPersist[] {
		let nonRoleClaims = existingUser.claims.filter(x => x.claim != 'role');

		return roleClaims.concat(nonRoleClaims);
	}

	createUserClaimPersist(obj): UserClaimPersist[] {
		const result: UserClaimPersist[] = obj.roles.map(role => {
			return {
				claim: 'role',
				value: role
			};
		});
		return result;
	}

	public isFormValid() {
		return this.formGroup.valid;
	}

	public editItem(): void {
		this.enableItemEditing();
	}

	public save() {
		this.userRoleEditorModel.validationErrorModel.clear();
		this.formService.validateAllFormFields(this.formGroup);
	}

	public cancel() {
		this.formGroup.get('roles').setValue(this.getUserRoles(this.item), { emitEvent: false });
		this.disableItemEditing();
		this.onRolesEditCanceled.emit();
	}

	onSelectionChange(change: MatSelectChange) {
		let unsaved : IdpServiceUser = {
			id: this.formGroup.value.id,
			name: this.item.name,
			hash: this.formGroup.value.hash,
			credentials: this.item.credentials,
			claims : this.formGroup.value.roles.map(x =>{return {claim: 'role', value: x}})
		}
		this.onRolesChanged.emit(unsaved);
	}

	enableItemEditing() {
		this.formGroup.enable({ emitEvent: false });
		this.nowEditing = true;
	}

	disableItemEditing() {
		this.formGroup.disable({ emitEvent: false });
		this.nowEditing = false;
	}

	onCallbackSuccess(): void {
		this.disableItemEditing();
		this.uiNotificationService.snackBarNotification(this.language.instant('COMMONS.SNACK-BAR.SUCCESSFUL-UPDATE'), SnackBarNotificationLevel.Success);
		this.onRolesSaved.emit();
	}

	onCallbackError(errorResponse: HttpErrorResponse) {
		const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
		if (error.statusCode === 400 && error['errorCode'] === 128) {
			this.userRoleEditorModel.validationErrorModel.fromJSONObject(errorResponse.error);
			this.formService.validateAllFormFields(this.formGroup);
		} else {
			this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
		}
	}
}
