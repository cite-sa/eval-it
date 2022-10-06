import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BackendErrorValidator } from '@common/forms/validation/custom-validator';
import { ValidationErrorModel } from '@common/forms/validation/error-model/validation-error-model';
import { Validation, ValidationContext } from '@common/forms/validation/validation-context';
import { Tag } from '@app/core/model/tag/tag.model';
import { Guid } from '@common/types/guid';
import { BaseEditorModel } from '@common/base/base-editor.model';
import { TagSetPersist } from '@app/core/model/app-user/app-user.model';

export class TagSetModel extends BaseEditorModel implements TagSetPersist  {

	public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();
	protected formBuilder: FormBuilder = new FormBuilder();

	constructor() { super() }
	tagIds: Guid[];

	public fromTags(items: Tag[]): TagSetModel {
		if (items) {
			this.tagIds = items.map(t => t.id);
		}
		return this;
	}

	buildForm(context: ValidationContext = null, isNew: boolean = true , disabled: boolean = false): FormGroup {
		if (context == null) { context = this.createValidationContext(); }

		return this.formBuilder.group({
			tagIds: [{ value: this.tagIds, disabled: disabled || !isNew }, context.getValidation('tagIds').validators],
		});
	}

	createValidationContext(): ValidationContext {
		const baseContext: ValidationContext = new ValidationContext();
		const baseValidationArray: Validation[] = new Array<Validation>();
		baseValidationArray.push({ key: 'tagIds', validators: [BackendErrorValidator(this.validationErrorModel, 'TagIds')] });

		baseContext.validation = baseValidationArray;
		return baseContext;
	}
}

