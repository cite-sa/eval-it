import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { BackendErrorValidator } from '@common/forms/validation/custom-validator';
import { ValidationErrorModel } from '@common/forms/validation/error-model/validation-error-model';
import { Validation, ValidationContext } from '@common/forms/validation/validation-context';
import { Guid } from '@common/types/guid';
import { ContactType } from '@notification-service/core/enum/contact-type.enum';
import { NotificationType } from '@notification-service/core/enum/notification-type.enum';
import { TenantConfiguration, TenantConfigurationNotifierListPersist } from '@notification-service/core/model/tenant-configuration.model';

export class TenantConfigurationNotifierListEditorModel implements TenantConfigurationNotifierListPersist {
	id?: Guid;
	hash?: string;
	notifiers: { [key: string]: ContactType[] };

	public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();
	protected formBuilder: FormBuilder = new FormBuilder();

	constructor() { }

	public fromModel(item: TenantConfiguration): TenantConfigurationNotifierListEditorModel {
		this.id = item.id;
		this.hash = item.hash;
		this.notifiers = item.notifierListData.notifiers;
		return this;
	}

	buildForm(context: ValidationContext = null, disabled: boolean = false, availableNotificationTypes: NotificationType[]): FormGroup {
		if (context == null) { context = this.createValidationContext(); }

		const notifiersFormGroup = this.formBuilder.group({});
		availableNotificationTypes.forEach(type => {
			notifiersFormGroup.addControl(type, new FormControl(this.notifiers ? this.notifiers[type] : undefined));
		});

		return this.formBuilder.group({
			id: [{ value: this.id, disabled: disabled }, context.getValidation('id').validators],
			hash: [{ value: this.hash, disabled: disabled }, context.getValidation('hash').validators],
			notifiers: notifiersFormGroup,
		});
	}

	createValidationContext(): ValidationContext {
		const baseContext: ValidationContext = new ValidationContext();
		const baseValidationArray: Validation[] = new Array<Validation>();

		baseValidationArray.push({ key: 'id', validators: [BackendErrorValidator(this.validationErrorModel, 'Id')] });
		baseValidationArray.push({ key: 'hash', validators: [BackendErrorValidator(this.validationErrorModel, 'Hash')] });

		baseContext.validation = baseValidationArray;
		return baseContext;
	}
}
