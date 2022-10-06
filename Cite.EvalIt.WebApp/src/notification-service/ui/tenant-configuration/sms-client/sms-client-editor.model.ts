import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BackendErrorValidator } from '@common/forms/validation/custom-validator';
import { ValidationErrorModel } from '@common/forms/validation/error-model/validation-error-model';
import { Validation, ValidationContext } from '@common/forms/validation/validation-context';
import { Guid } from '@common/types/guid';
import { TenantConfiguration, TenantConfigurationSmsClientPersist } from '@notification-service/core/model/tenant-configuration.model';

export class TenantConfigurationSmsClientEditorModel implements TenantConfigurationSmsClientPersist {
	id?: Guid;
	hash?: string;
	applicationId: string;
	applicationSecret: string;
	sendAsName: string;

	public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();
	protected formBuilder: FormBuilder = new FormBuilder();

	constructor() { }

	public fromModel(item: TenantConfiguration): TenantConfigurationSmsClientEditorModel {
		this.id = item.id;
		this.hash = item.hash;
		this.applicationId = item.smsClientData.applicationId;
		this.applicationSecret = item.smsClientData.applicationSecret;
		this.sendAsName = item.smsClientData.sendAsName;
		return this;
	}

	buildForm(context: ValidationContext = null, disabled: boolean = false): FormGroup {
		if (context == null) { context = this.createValidationContext(); }

		return this.formBuilder.group({
			id: [{ value: this.id, disabled: disabled }, context.getValidation('id').validators],
			hash: [{ value: this.hash, disabled: disabled }, context.getValidation('hash').validators],
			applicationId: [{ value: this.applicationId, disabled: disabled }, context.getValidation('applicationId').validators],
			applicationSecret: [{ value: this.applicationSecret, disabled: disabled }, context.getValidation('applicationSecret').validators],
			sendAsName: [{ value: this.sendAsName, disabled: disabled }, context.getValidation('sendAsName').validators],
		});
	}

	createValidationContext(): ValidationContext {
		const baseContext: ValidationContext = new ValidationContext();
		const baseValidationArray: Validation[] = new Array<Validation>();

		baseValidationArray.push({ key: 'id', validators: [BackendErrorValidator(this.validationErrorModel, 'Id')] });
		baseValidationArray.push({ key: 'hash', validators: [BackendErrorValidator(this.validationErrorModel, 'Hash')] });
		baseValidationArray.push({ key: 'applicationId', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'ApplicationId')] });
		baseValidationArray.push({ key: 'applicationSecret', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'ApplicationSecret')] });
		baseValidationArray.push({ key: 'sendAsName', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'SendAsName')] });

		baseContext.validation = baseValidationArray;
		return baseContext;
	}
}
