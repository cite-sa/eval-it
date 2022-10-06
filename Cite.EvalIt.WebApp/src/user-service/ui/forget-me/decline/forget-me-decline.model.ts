import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BackendErrorValidator } from '@common/forms/validation/custom-validator';
import { ValidationErrorModel } from '@common/forms/validation/error-model/validation-error-model';
import { Validation, ValidationContext } from '@common/forms/validation/validation-context';
import { ForgetMeDecline } from '@user-service/core/model/forget-me.model';

export class ForgetMeDeclineModel implements ForgetMeDecline {
	public text: string;
	public token: string;

	private formBuilder: FormBuilder = new FormBuilder();

	public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();

	constructor() { }

	buildForm(context: ValidationContext = null, disabled: boolean = false): FormGroup {
		if (context == null) { context = this.createValidationContext(); }

		return this.formBuilder.group({
			text: [{ value: this.text, disabled: disabled }, context.getValidation('text').validators],
			token: [{ value: this.token, disabled: disabled }, context.getValidation('token').validators],
			recaptcha: ['', Validators.required]
		});
	}

	createValidationContext(): ValidationContext {
		const baseContext: ValidationContext = new ValidationContext();
		const baseValidationArray: Validation[] = new Array<Validation>();
		baseValidationArray.push({ key: 'text', validators: [BackendErrorValidator(this.validationErrorModel, 'Text')] });
		baseValidationArray.push({ key: 'token', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'Token')] });

		baseContext.validation = baseValidationArray;
		return baseContext;
	}
}
