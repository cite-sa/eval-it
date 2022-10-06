import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BackendErrorValidator } from '@common/forms/validation/custom-validator';
import { ValidationErrorModel } from '@common/forms/validation/error-model/validation-error-model';
import { Validation, ValidationContext } from '@common/forms/validation/validation-context';
import { Guid } from '@common/types/guid';

export class InvitationEditorModel {
	userId: Guid;
	email: string;

	public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();
	protected formBuilder: FormBuilder = new FormBuilder();

	constructor() { }

	buildForm(context: ValidationContext = null): FormGroup {
		if (context == null) { context = this.createValidationContext(); }

		return this.formBuilder.group({
			userId: [{ value: this.userId }, context.getValidation('userId').validators],
			email: [{ value: this.email }, context.getValidation('email').validators],
		});
	}

	createValidationContext(): ValidationContext {
		const baseContext: ValidationContext = new ValidationContext();
		const baseValidationArray: Validation[] = new Array<Validation>();
		baseValidationArray.push({ key: 'userId', validators: [BackendErrorValidator(this.validationErrorModel, 'UserId')] });
		baseValidationArray.push({ key: 'email', validators: [Validators.required, Validators.email, BackendErrorValidator(this.validationErrorModel, 'Email')] });

		baseContext.validation = baseValidationArray;
		return baseContext;
	}
}
