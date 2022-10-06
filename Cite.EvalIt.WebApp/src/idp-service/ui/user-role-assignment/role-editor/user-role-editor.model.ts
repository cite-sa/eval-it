import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BaseFormEditorModel } from '@common/base/base-form-editor-model';
import { BackendErrorValidator } from '@common/forms/validation/custom-validator';
import { Validation, ValidationContext } from '@common/forms/validation/validation-context';
import { Guid } from '@common/types/guid';

export class UserRoleEditorModel extends BaseFormEditorModel {
	id: Guid;
	hash: string;
	roles: String[];

	buildForm(context: ValidationContext = null, disabled: boolean): FormGroup {
		if (context == null) { context = this.createValidationContext(); }

		return this.formBuilder.group({
			id: new FormControl({ value: this.id, disabled: disabled }, context.getValidation('id').validators),
			hash: new FormControl({ value: this.hash, disabled: disabled }, context.getValidation('hash').validators),
			roles: new FormControl({ value: this.roles, disabled: disabled }, context.getValidation('roles').validators)
		});
	}

	createValidationContext(): ValidationContext {
		const validationContext: ValidationContext = new ValidationContext();
		const validationArray: Validation[] = new Array<Validation>();

		validationArray.push({ key: 'id', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'Id')] });
		validationArray.push({ key: 'hash', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'Hash')] });
		validationArray.push({ key: 'roles', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'Roles')] });

		validationContext.validation = validationArray;
		return validationContext;
	}
}
