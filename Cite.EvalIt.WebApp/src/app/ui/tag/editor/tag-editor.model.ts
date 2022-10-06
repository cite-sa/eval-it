import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BackendErrorValidator } from '@common/forms/validation/custom-validator';
import { ValidationErrorModel } from '@common/forms/validation/error-model/validation-error-model';
import { Validation, ValidationContext } from '@common/forms/validation/validation-context';
import { BaseEditorModel } from '@common/base/base-editor.model';
import { Tag, TagPersist } from '@app/core/model/tag/tag.model';
import { TagType } from '@app/core/enum/tag-type.enum';
import { TagAppliesTo } from '@app/core/enum/tag-applies-to.enum';

export class TagEditorModel extends BaseEditorModel implements TagPersist {
	label: string;
	type: TagType;
	appliesTo: TagAppliesTo;

	public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();
	protected formBuilder: FormBuilder = new FormBuilder();

	constructor() { super(); }

	public fromModel(item: Tag): TagEditorModel {
		if (item) {
			super.fromModel(item);
			this.label = item.label;
			this.type = item.type;
			this.appliesTo = item.appliesTo;
		}
		return this;
	}

	buildForm(context: ValidationContext = null, disabled: boolean = false): FormGroup {
		if (context == null) { context = this.createValidationContext(); }

		return this.formBuilder.group({
			id: [{ value: this.id, disabled: disabled }, context.getValidation('id').validators],
			label: [{ value: this.label, disabled: disabled }, context.getValidation('label').validators],
			type: [{ value: this.type, disabled: disabled }, context.getValidation('type').validators],
			appliesTo: [{ value: this.appliesTo, disabled: disabled }, context.getValidation('appliesTo').validators],
			hash: [{ value: this.hash, disabled: disabled }, context.getValidation('hash').validators],
		});
	}

	createValidationContext(): ValidationContext {
		const baseContext: ValidationContext = new ValidationContext();
		const baseValidationArray: Validation[] = new Array<Validation>();
		baseValidationArray.push({ key: 'id', validators: [BackendErrorValidator(this.validationErrorModel, 'Id')] });
		baseValidationArray.push({ key: 'hash', validators: [BackendErrorValidator(this.validationErrorModel, 'Hash')] });
		baseValidationArray.push({ key: 'label', validators: [Validators.required, Validators.maxLength(250), BackendErrorValidator(this.validationErrorModel, 'Label')] });
		baseValidationArray.push({ key: 'type', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'Type')] });
		baseValidationArray.push({ key: 'appliesTo', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'AppliesTo')] });

		baseContext.validation = baseValidationArray;
		return baseContext;
	}
}
