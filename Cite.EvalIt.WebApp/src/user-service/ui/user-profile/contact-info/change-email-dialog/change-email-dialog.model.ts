import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Serializable } from '@common/types/json/serializable';
import { BackendErrorValidator } from '@common/forms/validation/custom-validator';
import { ValidationErrorModel } from '@common/forms/validation/error-model/validation-error-model';
import { Validation, ValidationContext } from '@common/forms/validation/validation-context';

export class UserProfileChangeEmailEditorModel implements Serializable<UserProfileChangeEmailEditorModel> {
	email: string;
	emailRepeat: string;

	public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();
	protected formBuilder: FormBuilder = new FormBuilder();

	constructor() { }

	public fromJSONObject(item: any): UserProfileChangeEmailEditorModel {
		this.email = item.email;
		this.emailRepeat = item.emailRepeat;
		return this;
	}

	buildForm(context: ValidationContext = null, disabled: boolean = false): FormGroup {
		if (context == null) { context = this.createValidationContext(); }

		return this.formBuilder.group({
			email: [{ value: this.email, disabled: disabled }, context.getValidation('email').validators],
			emailRepeat: [{ value: this.emailRepeat, disabled: disabled }, context.getValidation('emailRepeat').validators],
		});
	}

	createValidationContext(): ValidationContext {
		const baseContext: ValidationContext = new ValidationContext();
		const baseValidationArray: Validation[] = new Array<Validation>();

		baseValidationArray.push({ key: 'email', validators: [Validators.required, Validators.email, BackendErrorValidator(this.validationErrorModel, 'Email')] });
		baseValidationArray.push({ key: 'emailRepeat', validators: [Validators.required, Validators.email, BackendErrorValidator(this.validationErrorModel, 'EmailRepeat')] });

		baseContext.validation = baseValidationArray;
		return baseContext;
	}
}
