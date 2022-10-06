import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BackendErrorValidator } from '@common/forms/validation/custom-validator';
import { ValidationErrorModel } from '@common/forms/validation/error-model/validation-error-model';
import { Validation, ValidationContext } from '@common/forms/validation/validation-context';
import { Guid } from '@common/types/guid';
import { TenantConfiguration, TenantConfigurationEmailClientPersist } from '@notification-service/core/model/tenant-configuration.model';

export class TenantConfigurationEmailClientEditorModel implements TenantConfigurationEmailClientPersist {
	id?: Guid;
	hash?: string;
	requiresCredentials: boolean = false;
	enableSSL: boolean = false;
	hostServer: string;
	hostPortNo: number;
	emailAddress: string;
	emailUsername: string;
	emailPassword: string;

	public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();
	protected formBuilder: FormBuilder = new FormBuilder();

	constructor() { }

	public fromModel(item: TenantConfiguration): TenantConfigurationEmailClientEditorModel {
		this.id = item.id;
		this.hash = item.hash;
		this.requiresCredentials = item.emailClientData.requiresCredentials;
		this.enableSSL = item.emailClientData.enableSSL;
		this.hostServer = item.emailClientData.hostServer;
		this.hostPortNo = item.emailClientData.hostPortNo;
		this.emailAddress = item.emailClientData.emailAddress;
		this.emailUsername = item.emailClientData.emailUsername;
		this.emailPassword = item.emailClientData.emailPassword;
		return this;
	}

	buildForm(context: ValidationContext = null, disabled: boolean = false): FormGroup {
		if (context == null) { context = this.createValidationContext(); }

		return this.formBuilder.group({
			id: [{ value: this.id, disabled: disabled }, context.getValidation('id').validators],
			hash: [{ value: this.hash, disabled: disabled }, context.getValidation('hash').validators],
			requiresCredentials: [{ value: this.requiresCredentials, disabled: disabled }, context.getValidation('requiresCredentials').validators],
			enableSSL: [{ value: this.enableSSL, disabled: disabled }, context.getValidation('enableSSL').validators],
			hostServer: [{ value: this.hostServer, disabled: disabled }, context.getValidation('hostServer').validators],
			hostPortNo: [{ value: this.hostPortNo, disabled: disabled }, context.getValidation('hostPortNo').validators],
			emailAddress: [{ value: this.emailAddress, disabled: disabled }, context.getValidation('emailAddress').validators],
			emailUsername: [{ value: this.emailUsername, disabled: disabled }, context.getValidation('emailUsername').validators],
			emailPassword: [{ value: this.emailPassword, disabled: disabled }, context.getValidation('emailPassword').validators],
		});
	}

	createValidationContext(): ValidationContext {
		const baseContext: ValidationContext = new ValidationContext();
		const baseValidationArray: Validation[] = new Array<Validation>();

		baseValidationArray.push({ key: 'id', validators: [BackendErrorValidator(this.validationErrorModel, 'Id')] });
		baseValidationArray.push({ key: 'hash', validators: [BackendErrorValidator(this.validationErrorModel, 'Hash')] });
		baseValidationArray.push({ key: 'requiresCredentials', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'RequiresCredentials')] });
		baseValidationArray.push({ key: 'enableSSL', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'EnableSSL')] });
		baseValidationArray.push({ key: 'hostServer', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'HostServer')] });
		baseValidationArray.push({ key: 'hostPortNo', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'HostPortNo')] });
		baseValidationArray.push({ key: 'emailAddress', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'EmailAddress')] });
		baseValidationArray.push({ key: 'emailUsername', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'EmailUsername')] });
		baseValidationArray.push({ key: 'emailPassword', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'EmailPassword')] });

		baseContext.validation = baseValidationArray;
		return baseContext;
	}
}
