import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Serializable } from '@common/types/json/serializable';
import { RoleType } from '@app/core/enum/role-type.enum';
import { BackendArrayErrorValidator, BackendErrorValidator } from '@common/forms/validation/custom-validator';
import { ValidationErrorModel } from '@common/forms/validation/error-model/validation-error-model';
import { Guid } from '@common/types/guid';

export class UserInvitationEditorModel implements Serializable<UserInvitationEditorModel> {
	userId: Guid;
	email?: string;
	role?: RoleType;

	protected formBuilder: FormBuilder = new FormBuilder();

	constructor() { }

	public fromJSONObject(item: any): UserInvitationEditorModel {
		this.userId = item.userId;
		this.email = item.email;

		return this;
	}

	buildForm(validationErrorModel: ValidationErrorModel): FormGroup {
		return this.formBuilder.group({
			userId: [this.userId],
			email: [this.email, [Validators.required, Validators.email, BackendErrorValidator(validationErrorModel, 'Email')]]
		});
	}

	// Expects the FormGroup to be added to the array
	buildFormForUserInvitationArray(validationErrorModel: ValidationErrorModel, array: FormArray, arrayToSkip: FormArray): FormGroup {
		const formGroup = this.formBuilder.group({
			email: this.email
		});

		const propertyNameGetter = () => {
			return `[${array.controls.indexOf(formGroup) + arrayToSkip.length}].Email`;
		};

		formGroup.get('email').setValidators([Validators.required, Validators.email, BackendArrayErrorValidator(validationErrorModel, propertyNameGetter)]);

		return formGroup;
	}
}
