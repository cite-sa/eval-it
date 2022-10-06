import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BackendErrorValidator } from '@common/forms/validation/custom-validator';
import { ValidationErrorModel } from '@common/forms/validation/error-model/validation-error-model';
import { Validation, ValidationContext } from '@common/forms/validation/validation-context';
import { Guid } from '@common/types/guid';
import { BaseEditorModel } from '@common/base/base-editor.model';
import { DataObjectReviewFeedback, DataObjectReviewFeedbackPersist, FeedbackData, FeedbackDataPersist } from '@app/core/model/data-object/data-object-review-feedback.model';
import { ReviewAnonymity } from '@app/core/enum/review-anonymity.enum';
import { ReviewVisibility } from '@app/core/enum/review-visibility.enum';

export class FeedbackDataModel implements FeedbackDataPersist {
	like: Boolean;

	public validationErrorModel : ValidationErrorModel = new ValidationErrorModel();
	protected formBuilder: FormBuilder = new FormBuilder();

	constructor() { }

	public fromModel(item: FeedbackData): FeedbackDataModel {
		if (item) {
			this.like = item.like;
		}
		return this;
	}

	buildForm(context: ValidationContext = null, baseProperty: string = null, disabled: boolean = false, validationErrorModel: ValidationErrorModel): FormGroup {
		this.validationErrorModel = validationErrorModel;
		if (context == null) { context = this.createValidationContext(baseProperty); }

		return this.formBuilder.group({
			like: [{ value: this.like, disabled: disabled }, context.getValidation('like').validators],
		});
	}

	buildValueControl(context: ValidationContext = null, baseProperty: string = null, disabled: boolean = false, validationErrorModel: ValidationErrorModel) { }

	getGroup(context: ValidationContext = null, baseProperty: string = null, disabled: boolean = false, validationErrorModel: ValidationErrorModel): any {
		this.validationErrorModel = validationErrorModel;
		if (context == null) { context = this.createValidationContext(baseProperty); }

		return {
			like: [{ value: this.like, disabled: disabled }, context.getValidation('like').validators],
		};
	}

	createValidationContext(baseProperty?: string): ValidationContext {
		const baseContext: ValidationContext = new ValidationContext();
		const baseValidationArray: Validation[] = new Array<Validation>();
		baseValidationArray.push({ key: 'like', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Like'))] });

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

export class DataObjectReviewFeedbackModel extends BaseEditorModel implements DataObjectReviewFeedbackPersist  {

	anonymity: ReviewAnonymity;
	visibility: ReviewVisibility;
	dataObjectId: Guid;
	dataObjectReviewId: Guid;
	userIdHash?: string;
	userId?: Guid;
	feedbackData: FeedbackDataModel;

	public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();
	protected formBuilder: FormBuilder = new FormBuilder();

	constructor() { super() }

	public fromModel(item: DataObjectReviewFeedback): DataObjectReviewFeedbackModel {
		if (item) {
			super.fromModel(item);
			this.anonymity = item.anonymity;
			this.visibility = item.visibility;
			this.userIdHash = item.userIdHash;
			this.userId = item.userId;
			this.dataObjectReviewId = item.dataObjectReviewId;
			if(item.feedbackData) this.feedbackData = new FeedbackDataModel().fromModel(item.feedbackData);
		}
		return this;
	}

	buildForm(context: ValidationContext = null, isNew: boolean = true , disabled: boolean = false): FormGroup {
		if (context == null) { context = this.createValidationContext(); }

		let x = this.feedbackData ? this.feedbackData.buildForm(null, "", isNew, new ValidationErrorModel()) : new FeedbackDataModel().buildForm(null, "", isNew, new ValidationErrorModel())
		return this.formBuilder.group({
			id: [{ value: this.id, disabled: disabled }, context.getValidation('id').validators],
			anonymity: [{ value: this.anonymity, disabled: disabled }, context.getValidation('anonymity').validators],
			visibility: [{ value: this.visibility, disabled: disabled }, context.getValidation('visibility').validators],
			dataObjectId: [{ value: this.dataObjectId, disabled: disabled }, context.getValidation('dataObjectId').validators],
			dataObjectReviewId: [{ value: this.dataObjectReviewId, disabled: disabled }, context.getValidation('dataObjectReviewId').validators],
			userId: [{ value: this.userId, disabled: disabled }, context.getValidation('userId').validators],
			userIdHash: [{ value: this.userIdHash, disabled: disabled }, context.getValidation('userIdHash').validators],
			feedbackData:  x,
			hash: [{ value: this.hash, disabled: disabled }, context.getValidation('hash').validators],
		});
	}

	createValidationContext(): ValidationContext {
		const baseContext: ValidationContext = new ValidationContext();
		const baseValidationArray: Validation[] = new Array<Validation>();
		baseValidationArray.push({ key: 'id', validators: [BackendErrorValidator(this.validationErrorModel, 'Id')] });
		baseValidationArray.push({ key: 'anonymity', validators: [BackendErrorValidator(this.validationErrorModel, 'Anonymity')] });
		baseValidationArray.push({ key: 'visibility', validators: [BackendErrorValidator(this.validationErrorModel, 'Visibility')] });
		baseValidationArray.push({ key: 'userId', validators: [BackendErrorValidator(this.validationErrorModel, 'UserId')] });
		baseValidationArray.push({ key: 'userIdHash', validators: [BackendErrorValidator(this.validationErrorModel, 'UserIdHash')] });
		baseValidationArray.push({ key: 'dataObjectId', validators: [BackendErrorValidator(this.validationErrorModel, 'DataObjectId')] });
		baseValidationArray.push({ key: 'dataObjectReviewId', validators: [BackendErrorValidator(this.validationErrorModel, 'DataObjectReviewId')] });
		baseValidationArray.push({ key: 'hash', validators: [BackendErrorValidator(this.validationErrorModel, 'Hash')] });

		baseContext.validation = baseValidationArray;
		return baseContext;
	}
}

