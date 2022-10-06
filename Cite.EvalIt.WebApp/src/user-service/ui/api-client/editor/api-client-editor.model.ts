import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LanguageService } from '@user-service/services/language.service';
import { BackendErrorValidator } from '@common/forms/validation/custom-validator';
import { ValidationErrorModel } from '@common/forms/validation/error-model/validation-error-model';
import { Validation, ValidationContext } from '@common/forms/validation/validation-context';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { UserType } from '@user-service/core/enum/user-type.enum';
import { UserServiceUser, UserServiceUserPersist } from '@user-service/core/model/user.model';
import { UserProfileEditorModel } from '@user-service/ui/users/editor/user-editor.model';
import { BaseEditorModel } from '@common/base/base-editor.model';

export class ApiClientEditorModel extends BaseEditorModel implements UserServiceUserPersist {
	name: string;
	type?: UserType;

	public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();
	protected formBuilder: FormBuilder = new FormBuilder();

	constructor() { super(); }

	public fromModel(item: UserServiceUser): ApiClientEditorModel {

		if(item){
			super.fromModel(item);
			this.name = item.name;
			this.type = item.type;
		}
		return this;
	}

	buildForm(installationConfiguration: InstallationConfigurationService, languageService: LanguageService, context: ValidationContext = null, disabled: boolean = false): FormGroup {
		if (context == null) { context = this.createValidationContext(); }

		return this.formBuilder.group({
			id: [{ value: this.id, disabled: disabled }, context.getValidation('id').validators],
			name: [{ value: this.name, disabled: disabled }, context.getValidation('name').validators],
			type: [{ value: UserType.Service, disabled: disabled }, context.getValidation('type').validators],
			hash: [{ value: this.hash, disabled: disabled }, context.getValidation('hash').validators],
			profile: new UserProfileEditorModel().buildForm(installationConfiguration, languageService, context.getValidation('profile').descendantValidations, disabled),
		});
	}

	createValidationContext(): ValidationContext {
		const baseContext: ValidationContext = new ValidationContext();
		const baseValidationArray: Validation[] = new Array<Validation>();
		baseValidationArray.push({ key: 'id', validators: [BackendErrorValidator(this.validationErrorModel, 'Id')] });
		baseValidationArray.push({ key: 'name', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'Name')] });
		baseValidationArray.push({ key: 'type', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'Type')] });
		baseValidationArray.push({ key: 'hash', validators: [BackendErrorValidator(this.validationErrorModel, 'Hash')] });

		const profileContext: ValidationContext = new ValidationContext();
		const profileArray: Validation[] = new Array<Validation>();
		profileArray.push({ key: 'timezone', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'Profile.Timezone')] });
		profileArray.push({ key: 'culture', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'Profile.Culture')] });
		profileArray.push({ key: 'language', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'Profile.Language')] });
		profileArray.push({ key: 'profilePicture', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'Profile.ProfilePicture')] });
		profileArray.push({ key: 'isTentative', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'Profile.IsTentative')] });
		profileContext.validation = profileArray;
		baseValidationArray.push({ key: 'profile', descendantValidations: profileContext });

		baseContext.validation = baseValidationArray;
		return baseContext;
	}
}
