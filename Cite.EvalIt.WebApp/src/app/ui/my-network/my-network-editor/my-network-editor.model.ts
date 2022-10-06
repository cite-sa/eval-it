import { FormBuilder, FormGroup } from '@angular/forms';
import { BackendErrorValidator } from '@common/forms/validation/custom-validator';
import { ValidationErrorModel } from '@common/forms/validation/error-model/validation-error-model';
import { Validation, ValidationContext } from '@common/forms/validation/validation-context';
import { BaseEditorModel } from '@common/base/base-editor.model';
import { UserWithRelationship, UserWithRelationshipPersist } from '@app/core/model/app-user/app-user.model';
import { UserNetworkRelationship } from '@app/core/enum/user-network-relationship.enum';

export class UserWithRelationshipModel extends BaseEditorModel implements UserWithRelationshipPersist {
	relationship: UserNetworkRelationship;

	public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();
	protected formBuilder: FormBuilder = new FormBuilder();

	constructor() { super(); }

	public fromPair(item: UserWithRelationship): UserWithRelationshipModel {
		if (item) {
			this.id = item.id;
			this.relationship = item.relationship;
		}
		return this;
	}

	buildForm(context: ValidationContext = null, isNew: boolean = true , disabled: boolean = false): FormGroup {
		if (context == null) { context = this.createValidationContext(); }

		return this.formBuilder.group({
			id: [{ value: this.id, disabled: disabled || !isNew }, context.getValidation('id').validators],
			relationship: [{ value: this.relationship, disabled: disabled }, context.getValidation('relationship').validators],
		});
	}

	createValidationContext(): ValidationContext {
		const baseContext: ValidationContext = new ValidationContext();
		const baseValidationArray: Validation[] = new Array<Validation>();
		baseValidationArray.push({ key: 'id', validators: [BackendErrorValidator(this.validationErrorModel, 'Id')] });
		baseValidationArray.push({ key: 'relationship', validators: [] }); //TODO:

		baseContext.validation = baseValidationArray;
		return baseContext;
	}
}
