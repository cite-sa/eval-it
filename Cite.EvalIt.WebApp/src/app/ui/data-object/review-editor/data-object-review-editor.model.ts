import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BackendErrorValidator, IntegerValidator, NumberValidator, RegexpValidator, ValueWithinBoundsValidator } from '@common/forms/validation/custom-validator';
import { ValidationErrorModel } from '@common/forms/validation/error-model/validation-error-model';
import { Validation, ValidationContext } from '@common/forms/validation/validation-context';
import { BaseEditorModel } from '@common/base/base-editor.model';
import { Guid } from '@common/types/guid';
import { AbsoluteDecimalEvaluation, AbsoluteDecimalEvaluationPersist, AbsoluteIntegerEvaluation, AbsoluteIntegerEvaluationPersist, DataObjectReview, DataObjectReviewPersist, PercentageEvaluation, PercentageEvaluationPersist, ReviewEvaluation, ReviewEvaluationData, ReviewEvaluationDataPersist, ReviewEvaluationPersist, ScaleEvaluation, ScaleEvaluationPersist, SelectionEvaluation, SelectionEvaluationPersist, TextEvaluation, TextEvaluationPersist } from '@app/core/model/data-object/data-object-review.model';
import { ReviewAnonymity } from '@app/core/enum/review-anonymity.enum';
import { ReviewVisibility } from '@app/core/enum/review-visibility.enum';
import { ReviewEvaluationType } from '@app/core/enum/review-evaluation-type.enum';
import { DataObjectTypeEditorModel } from '@app/ui/data-object-type/editor/data-object-type-editor.model';
import { AbsoluteDecimalEvaluationOption, AbsoluteIntegerEvaluationOption, BaseEvaluationOption, PercentageEvaluationOption, ScaleEvaluationOption, SelectionEvaluationOption, TextEvaluationOption } from '@app/core/model/data-object-type/evaluation-configuration.model';

export class ReviewEvaluationModel implements ReviewEvaluationPersist {
    optionId: Guid;
    evaluationType: ReviewEvaluationType;

	public validationErrorModel : ValidationErrorModel = new ValidationErrorModel();
	protected formBuilder: FormBuilder = new FormBuilder();

	constructor() { }

	public fromModel(item: ReviewEvaluation): ReviewEvaluationModel {
		if (item) {
			this.optionId = item.optionId;
			this.evaluationType = item.evaluationType;
		}
		return this;
	}

	buildForm(context: ValidationContext = null, baseProperty: string = null, disabled: boolean = false, evalConfigOption: BaseEvaluationOption = null, validationErrorModel: ValidationErrorModel): FormGroup {
		this.validationErrorModel = validationErrorModel;
		if (context == null) { context = this.createValidationContext(baseProperty); }

		return this.formBuilder.group({
			optionId: [{ value: this.optionId, disabled: disabled }, context.getValidation('optionId').validators],
			evaluationType: [{ value: this.evaluationType, disabled: disabled }, context.getValidation('evaluationType').validators],
		});
	}

	buildValueControl(context: ValidationContext = null, baseProperty: string = null, disabled: boolean = false, evalConfigOption: BaseEvaluationOption = null, validationErrorModel: ValidationErrorModel) { }

	getGroup(context: ValidationContext = null, baseProperty: string = null, disabled: boolean = false, validationErrorModel: ValidationErrorModel): any {
		this.validationErrorModel = validationErrorModel;
		if (context == null) { context = this.createValidationContext(baseProperty); }

		return {
			optionId: [{ value: this.optionId, disabled: disabled }, context.getValidation('optionId').validators],
			evaluationType: [{ value: this.evaluationType, disabled: disabled }, context.getValidation('evaluationType').validators],
		};
	}

	createValidationContext(baseProperty?: string): ValidationContext {
		const baseContext: ValidationContext = new ValidationContext();
		const baseValidationArray: Validation[] = new Array<Validation>();
		baseValidationArray.push({ key: 'optionId', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'OptionId'))] });
		baseValidationArray.push({ key: 'evaluationType', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'EvaluationType'))] });

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

export class AbsoluteDecimalEvaluationModel extends ReviewEvaluationModel implements AbsoluteDecimalEvaluationPersist
{
	values: number[];

	public fromModel(item: AbsoluteDecimalEvaluation): AbsoluteDecimalEvaluationModel {
		super.fromModel(item as ReviewEvaluation);
		this.values = item.values;

		return this;
	}

	override buildForm(context: ValidationContext, baseProperty: string, disabled: boolean, evalConfigOption: AbsoluteDecimalEvaluationOption = null, validationErrorModel: ValidationErrorModel): FormGroup {
		if (context == null) { context = this.createValidationContext(baseProperty); }

		var group = this.getGroup(context, baseProperty, disabled, validationErrorModel);
		group['values'] = this.formBuilder.array(this.values ? this.values.map(x =>{
			let validators =  context.getValidation('values').validators;
			if(evalConfigOption != null)
			{
				if(evalConfigOption.upperBound != null && evalConfigOption.upperBound.value != null) validators.push(ValueWithinBoundsValidator(evalConfigOption.upperBound, true));
				if(evalConfigOption.lowerBound != null && evalConfigOption.lowerBound.value != null) validators.push(ValueWithinBoundsValidator(evalConfigOption.lowerBound, false));
			}
			return [{ value: x, disabled: disabled }, validators]
		}) : []);

		return this.formBuilder.group(group);
	}

	buildValueControl(context: ValidationContext = null, baseProperty: string = null, disabled: boolean = false, evalConfigOption: AbsoluteDecimalEvaluationOption = null) : FormControl {
		if (context == null) { context = this.createValidationContext(baseProperty); }

		let validators =  context.getValidation('values').validators;
		if(evalConfigOption != null)
		{
			if(evalConfigOption.upperBound != null && evalConfigOption.upperBound.value != null) validators.push(ValueWithinBoundsValidator(evalConfigOption.upperBound, true));
			if(evalConfigOption.lowerBound != null && evalConfigOption.lowerBound.value != null) validators.push(ValueWithinBoundsValidator(evalConfigOption.lowerBound, false));
		}

		return this.formBuilder.control({ value: null, disabled: disabled}, validators);
	}

	override createValidationContext(baseProperty?: string): ValidationContext {
		const baseContext: ValidationContext = super.createValidationContext(baseProperty);

		baseContext.validation.push({ key: 'values', validators: [Validators.required, NumberValidator(), BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Values'))] });
		return baseContext;
	}
}

export class AbsoluteIntegerEvaluationModel extends ReviewEvaluationModel implements AbsoluteIntegerEvaluationPersist
{
	values: number[];

	public fromModel(item: AbsoluteIntegerEvaluation): AbsoluteIntegerEvaluationModel {
		super.fromModel(item as ReviewEvaluation);
		this.values = item.values;

		return this;
	}

	override buildForm(context: ValidationContext, baseProperty: string, disabled: boolean, evalConfigOption: AbsoluteIntegerEvaluationOption = null, validationErrorModel: ValidationErrorModel): FormGroup {
		if (context == null) { context = this.createValidationContext(baseProperty); }

		var group = this.getGroup(context, baseProperty, disabled, validationErrorModel);
		group['values'] = this.formBuilder.array(this.values ? this.values.map(x =>{
			let validators =  context.getValidation('values').validators;
			if(evalConfigOption != null)
			{
				if(evalConfigOption.upperBound != null && evalConfigOption.upperBound.value != null) validators.push(ValueWithinBoundsValidator(evalConfigOption.upperBound, true));
				if(evalConfigOption.lowerBound != null && evalConfigOption.lowerBound.value != null) validators.push(ValueWithinBoundsValidator(evalConfigOption.lowerBound, false));
			}
			return [{ value: x, disabled: disabled }, validators]
		}) : []);

		return this.formBuilder.group(group);
	}

	buildValueControl(context: ValidationContext = null, baseProperty: string = null, disabled: boolean = false, evalConfigOption: AbsoluteIntegerEvaluationOption = null) : FormControl {
		if (context == null) { context = this.createValidationContext(baseProperty); }

		let validators =  context.getValidation('values').validators;
		if(evalConfigOption != null)
		{
			if(evalConfigOption.upperBound != null && evalConfigOption.upperBound.value != null) validators.push(ValueWithinBoundsValidator(evalConfigOption.upperBound, true));
			if(evalConfigOption.lowerBound != null && evalConfigOption.lowerBound.value != null) validators.push(ValueWithinBoundsValidator(evalConfigOption.lowerBound, false));
		}

		return this.formBuilder.control({ value: null, disabled: disabled}, validators);
	}

	override createValidationContext(baseProperty?: string): ValidationContext {
		const baseContext: ValidationContext = super.createValidationContext(baseProperty);

		baseContext.validation.push({ key: 'values', validators: [Validators.required, IntegerValidator(), BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Values'))] });
		return baseContext;
	}
}

export class PercentageEvaluationModel extends ReviewEvaluationModel implements PercentageEvaluationPersist
{
	values: number[];

	public fromModel(item: PercentageEvaluation): PercentageEvaluationModel {
		super.fromModel(item as ReviewEvaluation);
		this.values = item.values;

		return this;
	}

	override buildForm(context: ValidationContext, baseProperty: string, disabled: boolean, evalConfigOption: PercentageEvaluationOption = null, validationErrorModel: ValidationErrorModel): FormGroup {
		if (context == null) { context = this.createValidationContext(baseProperty); }

		var group = this.getGroup(context, baseProperty, disabled, validationErrorModel);
		group['values'] = this.formBuilder.array(this.values ? this.values.map(x =>{
			let validators =  context.getValidation('values').validators;
			if(evalConfigOption != null)
			{
				if(evalConfigOption.upperBound != null && evalConfigOption.upperBound.value != null) validators.push(ValueWithinBoundsValidator(evalConfigOption.upperBound, true));
				if(evalConfigOption.lowerBound != null && evalConfigOption.lowerBound.value != null) validators.push(ValueWithinBoundsValidator(evalConfigOption.lowerBound, false));
			}
			return [{ value: x, disabled: disabled }, validators]
		}) : []);

		return this.formBuilder.group(group);
	}

	buildValueControl(context: ValidationContext = null, baseProperty: string = null, disabled: boolean = false, evalConfigOption: PercentageEvaluationOption = null) : FormControl {
		if (context == null) { context = this.createValidationContext(baseProperty); }

		let validators =  context.getValidation('values').validators;
		if(evalConfigOption != null)
		{
			if(evalConfigOption.upperBound != null && evalConfigOption.upperBound.value != null) validators.push(ValueWithinBoundsValidator(evalConfigOption.upperBound, true));
			if(evalConfigOption.lowerBound != null && evalConfigOption.lowerBound.value != null) validators.push(ValueWithinBoundsValidator(evalConfigOption.lowerBound, false));
		}

		return this.formBuilder.control({ value: null, disabled: disabled}, validators);
	}

	override createValidationContext(baseProperty?: string): ValidationContext {
		const baseContext: ValidationContext = super.createValidationContext(baseProperty);

		baseContext.validation.push({ key: 'values', validators: [Validators.required, NumberValidator(), BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Values'))] });
		return baseContext;
	}
}

export class TextEvaluationModel extends ReviewEvaluationModel implements TextEvaluationPersist
{
	values: string[];

	public fromModel(item: TextEvaluation): TextEvaluationModel {
		super.fromModel(item as ReviewEvaluation);
		this.values = item.values;

		return this;
	}

	override buildForm(context: ValidationContext, baseProperty: string, disabled: boolean, evalConfigOption: TextEvaluationOption = null, validationErrorModel: ValidationErrorModel): FormGroup {
		if (context == null) { context = this.createValidationContext(baseProperty); }

		var group = this.getGroup(context, baseProperty, disabled, validationErrorModel);
		group['values'] = this.formBuilder.array(this.values ? this.values.map(x =>{
			let validators =  context.getValidation('values').validators;
			return [{ value: x, disabled: disabled }, validators]
		}) : []);

		return this.formBuilder.group(group);
	}

	buildValueControl(context: ValidationContext = null, baseProperty: string = null, disabled: boolean = false, evalConfigOption: TextEvaluationOption = null) : FormControl {
		if (context == null) { context = this.createValidationContext(baseProperty); }

		let validators =  context.getValidation('values').validators;

		return this.formBuilder.control({ value: null, disabled: disabled}, validators);
	}

	override createValidationContext(baseProperty?: string): ValidationContext {
		const baseContext: ValidationContext = super.createValidationContext(baseProperty);

		baseContext.validation.push({ key: 'values', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Values'))] });
		return baseContext;
	}
}

export class ScaleEvaluationModel extends ReviewEvaluationModel implements ScaleEvaluationPersist
{
	values: number[];

	public fromModel(item: ScaleEvaluation): ScaleEvaluationModel {
		super.fromModel(item as ReviewEvaluation);
		this.values = item.values;

		return this;
	}

	override buildForm(context: ValidationContext, baseProperty: string, disabled: boolean, evalConfigOption: ScaleEvaluationOption = null, validationErrorModel: ValidationErrorModel): FormGroup {
		if (context == null) { context = this.createValidationContext(baseProperty); }

		var group = this.getGroup(context, baseProperty, disabled, validationErrorModel);
		group['values'] = this.formBuilder.array(this.values ? this.values.map(x => [{ value: x, disabled: disabled }, context.getValidation('values').validators] ) : []);

		return this.formBuilder.group(group);
	}

	buildValueControl(context: ValidationContext = null, baseProperty: string = null, disabled: boolean = false, evalConfigOption: ScaleEvaluationOption = null) : FormControl {

		if (context == null) { context = this.createValidationContext(baseProperty); }

		return this.formBuilder.control({ value: null, disabled: disabled}, context.getValidation('values').validators);
	}

	override createValidationContext(baseProperty?: string): ValidationContext {
		const baseContext: ValidationContext = super.createValidationContext(baseProperty);

		baseContext.validation.push({ key: 'values', validators: [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Values'))] });
		return baseContext;
	}
}

export class SelectionEvaluationModel extends ReviewEvaluationModel implements SelectionEvaluationPersist
{
	values: number[];

	public fromModel(item: SelectionEvaluation): SelectionEvaluationModel {
		super.fromModel(item as ReviewEvaluation);
		this.values = item.values;

		return this;
	}

	override buildForm(context: ValidationContext, baseProperty: string, disabled: boolean, evalConfigOption: SelectionEvaluationOption = null, validationErrorModel: ValidationErrorModel): FormGroup {
		if (context == null) { context = this.createValidationContext(baseProperty); }

		var group = this.getGroup(context, baseProperty, disabled, validationErrorModel);
		group['values'] = this.formBuilder.array(this.values ? this.values.map(x => [{ value: x, disabled: disabled }, context.getValidation('values').validators] ) : []);

		return this.formBuilder.group(group);
	}

	buildValueControl(context: ValidationContext = null, baseProperty: string = null, disabled: boolean = false, evalConfigOption: SelectionEvaluationOption = null) : FormControl {

		if (context == null) { context = this.createValidationContext(baseProperty); }

		return this.formBuilder.control({ value: null, disabled: disabled}, context.getValidation('values').validators);
	}

	override createValidationContext(baseProperty?: string): ValidationContext {
		const baseContext: ValidationContext = super.createValidationContext(baseProperty);

		baseContext.validation.push({ key: 'values', validators: [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Values'))] });
		return baseContext;
	}
}

export class ReviewEvaluationDataModel implements ReviewEvaluationDataPersist {
	evaluations: ReviewEvaluationModel[];

	public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();
	protected formBuilder: FormBuilder = new FormBuilder();

	constructor() { }

	public fromModel(item: ReviewEvaluationData): ReviewEvaluationDataModel {
		if (item && item.evaluations) {
				this.evaluations = item.evaluations.map(x => {
					switch (x.evaluationType) {
						case ReviewEvaluationType.AbsoluteDecimalEvaluation:
							return new AbsoluteDecimalEvaluationModel().fromModel(x as AbsoluteDecimalEvaluation);
						case ReviewEvaluationType.AbsoluteIntegerEvaluation:
							return new AbsoluteIntegerEvaluationModel().fromModel(x as AbsoluteIntegerEvaluation);
						case ReviewEvaluationType.PercentageEvaluation:
							return new PercentageEvaluationModel().fromModel(x as PercentageEvaluation);
						case ReviewEvaluationType.TextEvaluation:
							return new TextEvaluationModel().fromModel(x as TextEvaluation);
						case ReviewEvaluationType.ScaleEvaluation:
							return new ScaleEvaluationModel().fromModel(x as ScaleEvaluation);
						case ReviewEvaluationType.SelectionEvaluation:
							return new SelectionEvaluationModel().fromModel(x as SelectionEvaluation);
						default:
							return new ReviewEvaluationModel().fromModel(x);
					}
				});
		}
		return this;
	}

	buildForm(context: ValidationContext = null, disabled: boolean = false, evalConfigOptionMap : Map<Guid,BaseEvaluationOption> = null): FormGroup {
		if (context == null) { context = this.createValidationContext(); }

		const detailsFormArray = new Array<FormGroup>();

		if(this.evaluations)
		{
			this.evaluations.forEach((element, index) => {
				var evalConfigOption : BaseEvaluationOption = null;
				if( evalConfigOptionMap != null)
				{
					evalConfigOption = evalConfigOptionMap.has(element.optionId) ? evalConfigOptionMap.get(element.optionId) : null;
				}
				detailsFormArray.push(this.buildEvaluationForm(element, disabled, evalConfigOption));

			})
		}

		return this.formBuilder.group({
			evaluations: this.formBuilder.array(detailsFormArray),
		});
	}	

	createValidationContext(): ValidationContext {
		const baseContext: ValidationContext = new ValidationContext();

		return baseContext;
	}

	buildEvaluationForm(detail: ReviewEvaluationModel, disabled: boolean = false, evalConfigOption: BaseEvaluationOption = null): FormGroup {
		return detail.buildForm(null, `DataObjectEvaluationData`, disabled , evalConfigOption, this.validationErrorModel);
	}
}

export class DataObjectReviewEditorModel extends BaseEditorModel implements DataObjectReviewPersist {
    anonymity: ReviewAnonymity;
    visibility: ReviewVisibility;
	dataObjectId: Guid;
    userIdHash?: string;
    userId?: Guid;
	dataObjectType: DataObjectTypeEditorModel;
    evaluationData: ReviewEvaluationDataModel;

	public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();
	protected formBuilder: FormBuilder = new FormBuilder();

	constructor() { 
		super();
	}


	public fromModel(item: DataObjectReview): DataObjectReviewEditorModel {
		if (item) {
			super.fromModel(item);
			this.anonymity = item.anonymity;
			this.visibility = item.visibility;
			this.userIdHash = item.userIdHash;
			this.userId = item.userId;
			if(item.dataObjectType) this.dataObjectType = new DataObjectTypeEditorModel().fromModel(item.dataObjectType);
			if(item.evaluationData) this.evaluationData = new ReviewEvaluationDataModel().fromModel(item.evaluationData);
		}
		return this;
	}

	public fromPair(item: DataObjectReview, objId: Guid): DataObjectReviewEditorModel {
		this.dataObjectId = objId.toString() as any;
		return this.fromModel(item);
	}

	buildForm(context: ValidationContext = null, disabled: boolean = false): FormGroup {
		if (context == null) { context = this.createValidationContext(); }

		var form = this.formBuilder.group({
			id: [{ value: this.id, disabled: disabled }, context.getValidation('id').validators],			
			anonymity: [{ value: this.anonymity, disabled: disabled }, context.getValidation('anonymity').validators],
			visibility: [{ value: this.visibility, disabled: disabled }, context.getValidation('visibility').validators],
			dataObjectId: [{ value: this.dataObjectId, disabled: disabled }, context.getValidation('dataObjectId').validators],
			userId: [{ value: this.userId, disabled: disabled }, context.getValidation('userId').validators],
			userIdHash: [{ value: this.userIdHash, disabled: disabled }, context.getValidation('userIdHash').validators],
			evaluationData: this.buildReviewEvaluationDataForm(this.evaluationData ? this.evaluationData : new ReviewEvaluationDataModel(), disabled),
			hash: [{ value: this.hash, disabled: disabled }, context.getValidation('hash').validators],
		});
		return form;           
	}


	createValidationContext(): ValidationContext {
			const baseContext: ValidationContext = new ValidationContext();
			const baseValidationArray: Validation[] = new Array<Validation>();
			baseValidationArray.push({ key: 'id', validators: [BackendErrorValidator(this.validationErrorModel, 'Id')] });
			baseValidationArray.push({ key: 'anonymity', validators: [BackendErrorValidator(this.validationErrorModel, 'Anonymity')] });
			baseValidationArray.push({ key: 'visibility', validators: [BackendErrorValidator(this.validationErrorModel, 'Visibility')] });
			baseValidationArray.push({ key: 'userId', validators: [BackendErrorValidator(this.validationErrorModel, 'UserId')] });
			baseValidationArray.push({ key: 'userIdHash', validators: [BackendErrorValidator(this.validationErrorModel, 'UserIdHash')] });
			baseValidationArray.push({ key: 'dataObjectId', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'DataObjectTypeId')] });
			baseValidationArray.push({ key: 'hash', validators: [BackendErrorValidator(this.validationErrorModel, 'Hash')] });

			baseContext.validation = baseValidationArray;
			return baseContext;
		}

	buildReviewEvaluationDataForm(evaluations: ReviewEvaluationDataModel, disabled: boolean = false): FormGroup {
		var map : Map<Guid,BaseEvaluationOption> = null;
		if( this.dataObjectType != null)
		{
			map = new Map<Guid, BaseEvaluationOption>();
			this.dataObjectType.config.evalOptions.forEach(o => {
				map.set(o.optionId,o);
			})
		}
		return evaluations.buildForm(null, disabled, map);
	}
}
