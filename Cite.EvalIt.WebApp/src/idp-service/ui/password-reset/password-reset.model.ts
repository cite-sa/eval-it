import { FormBuilder, FormGroup } from '@angular/forms';
import { BackendErrorValidator, CustomErrorValidator } from '@common/forms/validation/custom-validator';
import { ValidationErrorModel } from '@common/forms/validation/error-model/validation-error-model';
import { Validation, ValidationContext } from '@common/forms/validation/validation-context';

export class PasswordResetModel {
	public password: string;
	public passwordRepeat: string;
	public token: string;

	private formBuilder: FormBuilder = new FormBuilder();

	public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();

	constructor() { }

	buildForm(context: ValidationContext = null, disabled: boolean = false): FormGroup {
		if (context == null) { context = this.createValidationContext(); }

		return this.formBuilder.group({
			password: [{ value: this.password, disabled: disabled }, context.getValidation('password').validators],
			passwordRepeat: [{ value: this.passwordRepeat, disabled: disabled }, context.getValidation('passwordRepeat').validators],
			token: [{ value: this.token, disabled: disabled }, context.getValidation('token').validators],
		});
	}

	createValidationContext(): ValidationContext {
		const baseContext: ValidationContext = new ValidationContext();
		const baseValidationArray: Validation[] = new Array<Validation>();
		baseValidationArray.push({ key: 'password', validators: [BackendErrorValidator(this.validationErrorModel, 'Password'), CustomErrorValidator(this.validationErrorModel, ['Password'])] });
		baseValidationArray.push({ key: 'passwordRepeat', validators: [BackendErrorValidator(this.validationErrorModel, 'PasswordRepeat'), CustomErrorValidator(this.validationErrorModel, ['PasswordRepeat'])] });
		baseValidationArray.push({ key: 'token', validators: [] });

		baseContext.validation = baseValidationArray;
		return baseContext;
	}
}
