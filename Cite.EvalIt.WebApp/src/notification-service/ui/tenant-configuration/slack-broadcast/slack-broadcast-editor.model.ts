import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BackendErrorValidator } from '@common/forms/validation/custom-validator';
import { ValidationErrorModel } from '@common/forms/validation/error-model/validation-error-model';
import { Validation, ValidationContext } from '@common/forms/validation/validation-context';
import { Guid } from '@common/types/guid';
import { SlackBroadcastWebhookInfo, TenantConfiguration, TenantConfigurationSlackBroadcastPersist } from '@notification-service/core/model/tenant-configuration.model';

export class TenantConfigurationSlackBroadcastEditorModel implements TenantConfigurationSlackBroadcastPersist {
	id?: Guid;
	hash?: string;
	webhooks: SlackBroadcastWebhookInfo[];

	public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();
	protected formBuilder: FormBuilder = new FormBuilder();

	public fromModel(item: TenantConfiguration): TenantConfigurationSlackBroadcastEditorModel {
		if (item) {
			this.id = item.id;
			this.hash = item.hash;
			this.webhooks = item.slackBroadcastData.webhooks;
		}
		return this;
	}

	buildForm(disabled: boolean = false): FormGroup {

		const webhooksFormArray = new Array<FormGroup>();
		if (this.webhooks) {
			this.webhooks.forEach((element, index) => {
				webhooksFormArray.push(this.buildWebhookForm(new SlackBroadcastWebhookInfoFormModel().fromModel(element), index, disabled));
			});
		}

		return this.formBuilder.group({
			id: [{ value: this.id, disabled: disabled }],
			hash: [{ value: this.hash, disabled: disabled }],
			webhooks: this.formBuilder.array(webhooksFormArray),
		});
	}

	buildWebhookForm(webhook: SlackBroadcastWebhookInfoFormModel, index: number, disabled: boolean = false): FormGroup {
		return webhook.buildForm(null, `Details[${index}]`, disabled, this.validationErrorModel);
	}

	helperReapplyValidators(webhooks: FormArray) {
		if (!Array.isArray(webhooks.controls)) { return; }
		webhooks.controls.forEach((element, index) => {
			const webhookItemEditorModel = new SlackBroadcastWebhookInfoFormModel();
			webhookItemEditorModel.validationErrorModel = this.validationErrorModel;
			const context = webhookItemEditorModel.createValidationContext(`Details[${index}]`);
			const formGroup = element as FormGroup;
			Object.keys(formGroup.controls).forEach(key => {
				formGroup.get(key).setValidators(context.getValidation(key).validators);
			});
		});
	}
}


export class SlackBroadcastWebhookInfoFormModel implements SlackBroadcastWebhookInfo {
	id: Guid;
	name: string;
	webhook: string;

	public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();
	protected formBuilder: FormBuilder = new FormBuilder();

	public fromModel(item: SlackBroadcastWebhookInfo): SlackBroadcastWebhookInfoFormModel {
		if (item) {
			this.name = item.name;
			this.webhook = item.webhook;
		}
		return this;
	}

	buildForm(context: ValidationContext = null, baseProperty: string = null, disabled: boolean = false, validationErrorModel: ValidationErrorModel): FormGroup {
		this.validationErrorModel = validationErrorModel;
		if (context == null) { context = this.createValidationContext(baseProperty); }
		return this.formBuilder.group({
			id: [{ value: this.id, disabled: disabled }, context.getValidation('id').validators],
			name: [{ value: this.name, disabled: disabled }, context.getValidation('name').validators],
			webhook: [{ value: this.webhook, disabled: disabled }, context.getValidation('webhook').validators],
		});
	}

	createValidationContext(baseProperty?: string): ValidationContext {
		const baseContext: ValidationContext = new ValidationContext();
		const baseValidationArray: Validation[] = new Array<Validation>();
		baseValidationArray.push({ key: 'id', validators: [] });
		baseValidationArray.push({ key: 'name', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Name'))] });
		baseValidationArray.push({ key: 'webhook', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Webhook'))] });
		baseContext.validation = baseValidationArray;
		return baseContext;
	}


	helperGetValidation(baseProperty: string, property: string) {
		if (baseProperty) {
			return `${baseProperty}.${property}`;
		} else {
			return property;
		}
	}
}
