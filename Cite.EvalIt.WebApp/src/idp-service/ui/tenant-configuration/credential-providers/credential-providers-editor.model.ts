import { FormBuilder, FormGroup } from '@angular/forms';
import { BackendErrorValidator } from '@common/forms/validation/custom-validator';
import { ValidationErrorModel } from '@common/forms/validation/error-model/validation-error-model';
import { Validation, ValidationContext } from '@common/forms/validation/validation-context';
import { CredentialProvider } from '@idp-service/core/enum/credential-provider.enum';
import { TenantCredentialProviderPersist } from '@idp-service/core/model/tenant-configuration.model';
import { AuthProviderManager } from '@idp-service/ui/auth-providers/manager/auth-provider-manager';

export class TenantConfigurationCredentialProvidersEditorModel implements TenantCredentialProviderPersist {
	providers: CredentialProvider[];


	public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();
	protected formBuilder: FormBuilder = new FormBuilder();

	constructor() { }

	public fromModel(item: AuthProviderManager): TenantConfigurationCredentialProvidersEditorModel {
		this.providers = item ? item.all().map(provider => provider.credentialProvider) : null;
		return this;
	}

	buildForm(context: ValidationContext = null, disabled: boolean = false): FormGroup {
		if (context == null) { context = this.createValidationContext(); }

		return this.formBuilder.group({
			providers: [{ value: this.providers, disabled: disabled }, context.getValidation('providers').validators],
		});
	}

	createValidationContext(): ValidationContext {
		const baseContext: ValidationContext = new ValidationContext();
		const baseValidationArray: Validation[] = new Array<Validation>();

		baseValidationArray.push({ key: 'providers', validators: [BackendErrorValidator(this.validationErrorModel, 'Providers')] });

		baseContext.validation = baseValidationArray;
		return baseContext;
	}
}
