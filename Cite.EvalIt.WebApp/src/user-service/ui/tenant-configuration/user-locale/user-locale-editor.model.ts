import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BackendErrorValidator } from '@common/forms/validation/custom-validator';
import { ValidationErrorModel } from '@common/forms/validation/error-model/validation-error-model';
import { Validation, ValidationContext } from '@common/forms/validation/validation-context';
import { Guid } from '@common/types/guid';
import { TenantConfiguration, TenantConfigurationUserLocalePersist } from '@user-service/core/model/tenant-configuration.model';

export class TenantConfigurationUserLocaleEditorModel implements TenantConfigurationUserLocalePersist {
	id?: Guid;
	hash: string;
	timezone: string;
	language: string;
	culture: string;

	public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();
	protected formBuilder: FormBuilder = new FormBuilder();

	constructor() { }

	public fromModel(item: TenantConfiguration): TenantConfigurationUserLocaleEditorModel {
		this.id = item.id;
		this.timezone = item.defaultUserLocaleData.timezone;
		this.culture = item.defaultUserLocaleData.culture;
		this.language = item.defaultUserLocaleData.language;
		this.hash = item.hash;
		return this;
	}

	buildForm(context: ValidationContext = null, disabled: boolean = false): FormGroup {
		if (context == null) { context = this.createValidationContext(); }

		return this.formBuilder.group({
			id: [{ value: this.id, disabled: disabled }, context.getValidation('id').validators],
			hash: [{ value: this.hash, disabled: disabled }, context.getValidation('hash').validators],
			timezone: [{ value: this.timezone, disabled: disabled }, context.getValidation('timezone').validators],
			culture: [{ value: this.culture, disabled: disabled }, context.getValidation('culture').validators],
			language: [{ value: this.language, disabled: disabled }, context.getValidation('language').validators],
		});
	}

	createValidationContext(): ValidationContext {
		const baseContext: ValidationContext = new ValidationContext();
		const baseValidationArray: Validation[] = new Array<Validation>();

		baseValidationArray.push({ key: 'id', validators: [BackendErrorValidator(this.validationErrorModel, 'Id')] });
		baseValidationArray.push({ key: 'hash', validators: [BackendErrorValidator(this.validationErrorModel, 'Hash')] });
		baseValidationArray.push({ key: 'timezone', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'Timezone')] });
		baseValidationArray.push({ key: 'culture', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'Culture')] });
		baseValidationArray.push({ key: 'language', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'Language')] });

		baseContext.validation = baseValidationArray;
		return baseContext;
	}
}
