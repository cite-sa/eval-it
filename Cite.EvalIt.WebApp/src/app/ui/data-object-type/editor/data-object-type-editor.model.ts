import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BackendErrorValidator, DuplicateValidator, IntegerValidator } from '@common/forms/validation/custom-validator';
import { ValidationErrorModel } from '@common/forms/validation/error-model/validation-error-model';
import { Validation, ValidationContext } from '@common/forms/validation/validation-context';
import { BaseEditorModel } from '@common/base/base-editor.model';
import { DataObjectType, DataObjectTypePersist, EvaluationScaleValueData, EvaluationSelectionOptionsData, InputScaleValueData, InputSelectionOptionsData } from '@app/core/model/data-object-type/data-object-type.model';
import { AbsoluteDecimalInputOption, AbsoluteDecimalInputOptionPersist, AbsoluteIntegerInputOption, AbsoluteIntegerInputOptionPersist, PercentageInputOption, PercentageInputOptionPersist, RegistrationInformation, RegistrationInformationInputOption, RegistrationInformationInputOptionPersist, RegistrationInformationPersist, ScaleInputOption, ScaleInputOptionPersist, SelectionInputOption, SelectionInputOptionPersist, TextInputOption, TextInputOptionPersist } from '@app/core/model/data-object-type/registration-information.model';
import { AbsoluteDecimalEvaluationOption, AbsoluteDecimalEvaluationOptionPersist, AbsoluteIntegerEvaluationOption, AbsoluteIntegerEvaluationOptionPersist, BaseEvaluationOption, BaseEvaluationOptionPersist, EvaluationConfiguration, EvaluationConfigurationPersist, PercentageEvaluationOption, PercentageEvaluationOptionPersist, ScaleEvaluationOption, ScaleEvaluationOptionPersist, SelectionEvaluationOption, SelectionEvaluationOptionPersist, TextEvaluationOption, TextEvaluationOptionPersist } from '@app/core/model/data-object-type/evaluation-configuration.model';
import { RegistrationInformationType } from '@app/core/enum/registration-information-type.enum';
import { Guid } from '@common/types/guid';
import { IsActive } from '@idp-service/core/enum/is-active.enum';
import { EvaluationConfigurationType } from '@app/core/enum/evaluation-configuration-type.enum';
import { ScaleDisplayOption } from '@app/core/enum/scale-display-option.enum';
import { ObjectRankRecalculationStrategyConfigurationModel } from '@app/ui/data-object-type/editor/object-rank-recalculation-strategy-editor.model';
import { BoundedType } from '@app/core/model/data-object-type/ranking-methodology.model';

export class BaseEvaluationOptionModel implements BaseEvaluationOptionPersist {
	optionId?: Guid;
	label: string;
	isMandatory: boolean;
	optionType: EvaluationConfigurationType;
	isActive: IsActive;

	public validationErrorModel : ValidationErrorModel = new ValidationErrorModel();
	protected formBuilder: FormBuilder = new FormBuilder();

	constructor() { }

	public fromModel(item: BaseEvaluationOption): BaseEvaluationOptionModel {
		if (item) {
			this.optionId = item.optionId;
			this.label = item.label;
			this.isMandatory = item.isMandatory;
			this.optionType = item.optionType;
			this.isActive = item.isActive;
		}
		return this;
	}

	buildForm(context: ValidationContext = null, baseProperty: string = null, disabled: boolean = false, validationErrorModel: ValidationErrorModel): FormGroup {
		this.validationErrorModel = validationErrorModel;
		if (context == null) { context = this.createValidationContext(baseProperty); }

		return this.formBuilder.group({
			optionId: [{ value: this.optionId, disabled: disabled }, context.getValidation('optionId').validators],
			label: [{ value: this.label, disabled: disabled }, context.getValidation('label').validators],
			isMandatory: [{ value: this.isMandatory, disabled: disabled }, context.getValidation('isMandatory').validators],
			optionType: [{ value: this.optionType, disabled: disabled }, context.getValidation('optionType').validators],
			isActive: [{ value: this.isActive, disabled: disabled }, context.getValidation('isActive').validators],
		});
	}

	getGroup(context: ValidationContext = null, baseProperty: string = null, disabled: boolean = false, validationErrorModel: ValidationErrorModel): any {
		this.validationErrorModel = validationErrorModel;
		if (context == null) { context = this.createValidationContext(baseProperty); }

		return {
			optionId: [{ value: this.optionId, disabled: disabled }, context.getValidation('optionId').validators],
			label: [{ value: this.label, disabled: disabled }, context.getValidation('label').validators],
			isMandatory: [{ value: this.isMandatory, disabled: disabled }, context.getValidation('isMandatory').validators],
			optionType: [{ value: this.optionType, disabled: disabled }, context.getValidation('optionType').validators],
			isActive: [{ value: this.isActive, disabled: disabled }, context.getValidation('isActive').validators],
		};
	}

	createValidationContext(baseProperty?: string): ValidationContext {
		const baseContext: ValidationContext = new ValidationContext();
		const baseValidationArray: Validation[] = new Array<Validation>();
		baseValidationArray.push({ key: 'optionId', validators: [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'OptionId'))] });
		baseValidationArray.push({ key: 'label', validators: [Validators.required, Validators.maxLength(250), BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Label'))] });
		baseValidationArray.push({ key: 'isMandatory', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'IsMandatory'))] });
		baseValidationArray.push({ key: 'optionType', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'OptionType'))] });
		baseValidationArray.push({ key: 'isActive', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'IsActive'))] });

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

export class AbsoluteDecimalEvaluationOptionModel extends BaseEvaluationOptionModel implements AbsoluteDecimalEvaluationOptionPersist
{
	upperBound: BoundedType<number>;
    lowerBound: BoundedType<number>;
	measurementUnit: string;

	public fromModel(item: AbsoluteDecimalEvaluationOption): AbsoluteDecimalEvaluationOptionModel {
		super.fromModel(item as BaseEvaluationOption);
		this.upperBound = item.upperBound;
		this.lowerBound = item.lowerBound;
		this.measurementUnit = item.measurementUnit;

		return this;
	}

	override buildForm(context: ValidationContext, baseProperty: string, disabled: boolean, validationErrorModel: ValidationErrorModel): FormGroup {
		if (context == null) { context = this.createValidationContext(baseProperty); }

		var group = this.getGroup(context, baseProperty, disabled, validationErrorModel);
		group['measurementUnit'] = [{ value: this.measurementUnit, disabled: disabled }, context.getValidation('measurementUnit').validators];
		group['upperBound'] = this.formBuilder.group({
			upperBoundType: [{value: this.upperBound?.upperBoundType, disabled: disabled}, context.getValidation('upperBoundType').validators ],
			value: [{value: this.upperBound?.value, disabled: disabled}, context.getValidation('upperBoundValue').validators ]
		});
		group['lowerBound'] = this.formBuilder.group({
			upperBoundType: [{value: this.lowerBound?.upperBoundType, disabled: disabled}, context.getValidation('lowerBoundType').validators ],
			value: [{value: this.lowerBound?.value, disabled: disabled}, context.getValidation('lowerBoundValue').validators ]
		});

		return this.formBuilder.group(group);
	}

	override createValidationContext(baseProperty?: string): ValidationContext {
		const baseContext: ValidationContext = super.createValidationContext(baseProperty);

		baseContext.validation.push({ key: 'measurementUnit', validators: [Validators.required, Validators.maxLength(250), BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'MeasurementUnit'))] });
		baseContext.validation.push({ key: 'upperBoundType', validators: [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'UpperBoundType'))] });
		baseContext.validation.push({ key: 'upperBoundValue', validators: [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Value'))] });
		baseContext.validation.push({ key: 'lowerBoundType', validators: [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'UpperBoundType'))] });
		baseContext.validation.push({ key: 'lowerBoundValue', validators: [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Value'))] });
		return baseContext;
	}
}

export class AbsoluteIntegerEvaluationOptionModel extends BaseEvaluationOptionModel implements AbsoluteIntegerEvaluationOptionPersist
{
	upperBound: BoundedType<number>;
    lowerBound: BoundedType<number>;
	measurementUnit: string;

	public fromModel(item: AbsoluteIntegerEvaluationOption): AbsoluteIntegerEvaluationOptionModel {
		super.fromModel(item as BaseEvaluationOption);
		this.upperBound = item.upperBound;
		this.lowerBound = item.lowerBound;
		this.measurementUnit = item.measurementUnit;

		return this;
	}

	override buildForm(context: ValidationContext, baseProperty: string, disabled: boolean, validationErrorModel: ValidationErrorModel): FormGroup {
		if (context == null) { context = this.createValidationContext(baseProperty); }

		var group = this.getGroup(context, baseProperty, disabled, validationErrorModel);
		group['measurementUnit'] = [{ value: this.measurementUnit, disabled: disabled }, context.getValidation('measurementUnit').validators];
		group['upperBound'] = this.formBuilder.group({
			upperBoundType: [{value: this.upperBound?.upperBoundType, disabled: disabled}, context.getValidation('upperBoundType').validators ],
			value: [{value: this.upperBound?.value, disabled: disabled}, context.getValidation('upperBoundValue').validators ]
		});
		group['lowerBound'] = this.formBuilder.group({
			upperBoundType: [{value: this.lowerBound?.upperBoundType, disabled: disabled}, context.getValidation('lowerBoundType').validators ],
			value: [{value: this.lowerBound?.value, disabled: disabled}, context.getValidation('lowerBoundValue').validators ]
		});

		return this.formBuilder.group(group);
	}

	override createValidationContext(baseProperty?: string): ValidationContext {
		const baseContext: ValidationContext = super.createValidationContext(baseProperty);

		baseContext.validation.push({ key: 'measurementUnit', validators: [Validators.required, Validators.maxLength(250), BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'MeasurementUnit'))] });
		baseContext.validation.push({ key: 'upperBoundType', validators: [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'UpperBoundType'))] });
		baseContext.validation.push({ key: 'upperBoundValue', validators: [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Value'))] });
		baseContext.validation.push({ key: 'lowerBoundType', validators: [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'UpperBoundType'))] });
		baseContext.validation.push({ key: 'lowerBoundValue', validators: [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Value'))] });
		return baseContext;
	}
}

export class PercentageEvaluationOptionModel extends BaseEvaluationOptionModel implements PercentageEvaluationOptionPersist
{
	upperBound: BoundedType<number>;
    lowerBound: BoundedType<number>;

	public fromModel(item: PercentageEvaluationOption): PercentageEvaluationOptionModel {
		super.fromModel(item as BaseEvaluationOption);
		this.upperBound = item.upperBound;
		this.lowerBound = item.lowerBound;
		return this;
	}

	override buildForm(context: ValidationContext, baseProperty: string, disabled: boolean, validationErrorModel: ValidationErrorModel): FormGroup {
		if (context == null) { context = this.createValidationContext(baseProperty); }

		var group = this.getGroup(context, baseProperty, disabled, validationErrorModel);
		group['upperBound'] = this.formBuilder.group({
			upperBoundType: [{value: this.upperBound?.upperBoundType, disabled: disabled}, context.getValidation('upperBoundType').validators ],
			value: [{value: this.upperBound?.value, disabled: disabled}, context.getValidation('upperBoundValue').validators ]
		});
		group['lowerBound'] = this.formBuilder.group({
			upperBoundType: [{value: this.lowerBound?.upperBoundType, disabled: disabled}, context.getValidation('lowerBoundType').validators ],
			value: [{value: this.lowerBound?.value, disabled: disabled}, context.getValidation('lowerBoundValue').validators ]
		});

		return this.formBuilder.group(group);
	}

	override createValidationContext(baseProperty?: string): ValidationContext {
		const baseContext: ValidationContext = super.createValidationContext(baseProperty);
		
		baseContext.validation.push({ key: 'upperBoundType', validators: [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'UpperBoundType'))] });
		baseContext.validation.push({ key: 'upperBoundValue', validators: [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Value'))] });
		baseContext.validation.push({ key: 'lowerBoundType', validators: [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'UpperBoundType'))] });
		baseContext.validation.push({ key: 'lowerBoundValue', validators: [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Value'))] });

		return baseContext;
	}
}

export class TextEvaluationOptionModel extends BaseEvaluationOptionModel implements TextEvaluationOptionPersist
{
	public fromModel(item: TextEvaluationOption): TextEvaluationOptionModel {
		super.fromModel(item as BaseEvaluationOption);
		return this;
	}

	override buildForm(context: ValidationContext, baseProperty: string, disabled: boolean, validationErrorModel: ValidationErrorModel): FormGroup {
		if (context == null) { context = this.createValidationContext(baseProperty); }

		var group = this.getGroup(context, baseProperty, disabled, validationErrorModel);

		return this.formBuilder.group(group);
	}

	override createValidationContext(baseProperty?: string): ValidationContext {
		const baseContext: ValidationContext = super.createValidationContext(baseProperty);
		return baseContext;
	}
}

export class ScaleEvaluationOptionModel extends BaseEvaluationOptionModel implements ScaleEvaluationOptionPersist
{
	evaluationScale: EvaluationScaleValueData[];
	scaleDisplayOption: ScaleDisplayOption;

	public fromModel(item: ScaleEvaluationOption): ScaleEvaluationOptionModel {
		super.fromModel(item as BaseEvaluationOption);
		this.evaluationScale = item.evaluationScale;
		this.scaleDisplayOption = item.scaleDisplayOption;

		return this;
	}

	override buildForm(context: ValidationContext, baseProperty: string, disabled: boolean, validationErrorModel: ValidationErrorModel): FormGroup {
		if (context == null) { context = this.createValidationContext(baseProperty); }

		const optionsFormArray = new FormArray([]);
		var group = this.getGroup(context, baseProperty, disabled, validationErrorModel);

		if(this.evaluationScale)
		{
			this.evaluationScale.sort((a,b) => a.value - b.value).forEach((element, index) => {
				optionsFormArray.push(this.formBuilder.group({
					label: [{value: element.label, disabled: disabled}, context.getValidation('evaluationScaleLabel').validators ],
					iconIdentifier: [{value: element.iconIdentifier, disabled: disabled}, context.getValidation('iconIdentifier').validators ],
					idType: [{value: element.idType, disabled: disabled}, context.getValidation('idType').validators ],
					value: [{value: element.value, disabled: disabled}, context.getValidation('evaluationScaleValue').validators ]
				}));
			})
		}

		group['evaluationScale'] = optionsFormArray;
		group['scaleDisplayOption'] = [{ value: this.scaleDisplayOption, disabled: disabled }, context.getValidation('scaleDisplayOption').validators];
		return this.formBuilder.group(group);
	}

	override createValidationContext(baseProperty?: string): ValidationContext {
		const baseContext: ValidationContext = super.createValidationContext(baseProperty);

		baseContext.validation.push({ key: 'scaleDisplayOption', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'ScaleDisplayOption'))] });
		baseContext.validation.push({ key: 'evaluationScaleLabel', validators: [Validators.required, Validators.maxLength(250), BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'InputScale'))] });
		baseContext.validation.push({ key: 'iconIdentifier', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'IconIdentifier'))] });
		baseContext.validation.push({ key: 'idType', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'IdType'))] });
		baseContext.validation.push({ key: 'evaluationScaleValue', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Value'))] });
		return baseContext;
	}
}

export class SelectionEvaluationOptionModel extends BaseEvaluationOptionModel implements SelectionEvaluationOptionPersist
{
	evaluationSelectionOptions: EvaluationSelectionOptionsData[];

	public fromModel(item: SelectionEvaluationOption): SelectionEvaluationOptionModel {
		super.fromModel(item as BaseEvaluationOption);
		this.evaluationSelectionOptions = item.evaluationSelectionOptions;

		return this;
	}

	override buildForm(context: ValidationContext, baseProperty: string, disabled: boolean, validationErrorModel: ValidationErrorModel): FormGroup {
		if (context == null) { context = this.createValidationContext(baseProperty); }

		const optionsFormArray = new FormArray([], context.getValidation('evaluationSelectionArray').validators );
		var group = this.getGroup(context, baseProperty, disabled, validationErrorModel);

		if(this.evaluationSelectionOptions)
		{
			this.evaluationSelectionOptions.forEach((element, index) => {
				optionsFormArray.push(this.formBuilder.group({
					key: [{value: element.key, disabled: disabled}, context.getValidation('evaluationSelectionKey').validators ],
					value: [{value: element.value, disabled: disabled}, context.getValidation('evaluationSelectionValue').validators ]
				}));
			})
		}

		group['evaluationSelectionOptions'] = optionsFormArray;

		return this.formBuilder.group(group); 
	}

	override createValidationContext(baseProperty?: string): ValidationContext {
		const baseContext: ValidationContext = super.createValidationContext(baseProperty);

		baseContext.validation.push({ key: 'evaluationSelectionArray', validators: [Validators.required, DuplicateValidator((item) => item.key)] });
		baseContext.validation.push({ key: 'evaluationSelectionKey', validators: [Validators.required, Validators.maxLength(250), BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Key'))] });
		baseContext.validation.push({ key: 'evaluationSelectionValue', validators: [Validators.required, Validators.maxLength(250), BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Value'))] });
		return baseContext;
	}
}

export class EvaluationConfigurationModel implements EvaluationConfigurationPersist {
	evalOptions: BaseEvaluationOptionModel[];

	public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();
	protected formBuilder: FormBuilder = new FormBuilder();

	constructor() { }

	public fromModel(item: EvaluationConfiguration): EvaluationConfigurationModel {
		if (item && item.evalOptions) {
				this.evalOptions = item.evalOptions.map(x => {
					switch (x.optionType) {
						case EvaluationConfigurationType.AbsoluteDecimalEvaluationOption:
							return new AbsoluteDecimalEvaluationOptionModel().fromModel(x as AbsoluteDecimalEvaluationOption);
						case EvaluationConfigurationType.AbsoluteIntegerEvaluationOption:
							return new AbsoluteIntegerEvaluationOptionModel().fromModel(x as AbsoluteIntegerEvaluationOption);
						case EvaluationConfigurationType.PercentageEvaluationOption:
							return new PercentageEvaluationOptionModel().fromModel(x as PercentageEvaluationOption);
						case EvaluationConfigurationType.TextEvaluationOption:
							return new TextEvaluationOptionModel().fromModel(x as TextEvaluationOption);
						case EvaluationConfigurationType.ScaleEvaluationOption:
							return new ScaleEvaluationOptionModel().fromModel(x as ScaleEvaluationOption);
						case EvaluationConfigurationType.SelectionEvaluationOption:
							return new SelectionEvaluationOptionModel().fromModel(x as SelectionEvaluationOption);
						default:
							return new BaseEvaluationOptionModel().fromModel(x);
					}
				});
		}
		return this;
	}

	buildForm(context: ValidationContext = null, disabled: boolean = false): FormGroup {
		if (context == null) { context = this.createValidationContext(); }

		const detailsFormArray = new Array<FormGroup>();

		if(this.evalOptions)
		{
			this.evalOptions.forEach((element, index) => {
				detailsFormArray.push(this.buildOptionForm(element, disabled));
			})
		}

		return this.formBuilder.group({
			evalOptions: this.formBuilder.array(detailsFormArray),
		});
	}	

	createValidationContext(): ValidationContext {
		const baseContext: ValidationContext = new ValidationContext();

		return baseContext;
	}

	buildOptionForm(detail: BaseEvaluationOptionModel, disabled: boolean = false): FormGroup {
		return detail.buildForm(null, `EvaluationConfiguration`, disabled , this.validationErrorModel);
	}
}


export class RegistrationInformationInputOptionModel implements RegistrationInformationInputOptionPersist {
	optionId?: Guid;
	label: string;
	isMandatory: boolean;
	multiValue: boolean;
	optionType: RegistrationInformationType;
	isActive: IsActive;

	public validationErrorModel : ValidationErrorModel = new ValidationErrorModel();
	protected formBuilder: FormBuilder = new FormBuilder();

	constructor() { }

	public fromModel(item: RegistrationInformationInputOption): RegistrationInformationInputOptionModel {
		if (item) {
			this.optionId = item.optionId;
			this.label = item.label;
			this.isMandatory = item.isMandatory;
			this.multiValue = item.multiValue;
			this.optionType = item.optionType;
			this.isActive = item.isActive;
		}
		return this;
	}

	buildForm(context: ValidationContext = null, baseProperty: string = null, disabled: boolean = false, validationErrorModel: ValidationErrorModel): FormGroup {
		this.validationErrorModel = validationErrorModel;
		if (context == null) { context = this.createValidationContext(baseProperty); }

		return this.formBuilder.group({
			optionId: [{ value: this.optionId, disabled: disabled }, context.getValidation('optionId').validators],
			label: [{ value: this.label, disabled: disabled }, context.getValidation('label').validators],
			isMandatory: [{ value: this.isMandatory, disabled: disabled }, context.getValidation('isMandatory').validators],
			multiValue: [{ value: this.multiValue, disabled: disabled }, context.getValidation('multiValue').validators],
			optionType: [{ value: this.optionType, disabled: disabled }, context.getValidation('optionType').validators],
			isActive: [{ value: this.isActive, disabled: disabled }, context.getValidation('isActive').validators],
		});
	}

	getGroup(context: ValidationContext = null, baseProperty: string = null, disabled: boolean = false, validationErrorModel: ValidationErrorModel): any {
		this.validationErrorModel = validationErrorModel;
		if (context == null) { context = this.createValidationContext(baseProperty); }

		return {
			optionId: [{ value: this.optionId, disabled: disabled }, context.getValidation('optionId').validators],
			label: [{ value: this.label, disabled: disabled }, context.getValidation('label').validators],
			isMandatory: [{ value: this.isMandatory, disabled: disabled }, context.getValidation('isMandatory').validators],
			multiValue: [{ value: this.multiValue, disabled: disabled }, context.getValidation('multiValue').validators],
			optionType: [{ value: this.optionType, disabled: disabled }, context.getValidation('optionType').validators],
			isActive: [{ value: this.isActive, disabled: disabled }, context.getValidation('isActive').validators],
		};
	}

	createValidationContext(baseProperty?: string): ValidationContext {
		const baseContext: ValidationContext = new ValidationContext();
		const baseValidationArray: Validation[] = new Array<Validation>();
		baseValidationArray.push({ key: 'optionId', validators: [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'OptionId'))] });
		baseValidationArray.push({ key: 'label', validators: [Validators.required, Validators.maxLength(250), BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Label'))] });
		baseValidationArray.push({ key: 'isMandatory', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'IsMandatory'))] });
		baseValidationArray.push({ key: 'multiValue', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'MultiValue'))] });
		baseValidationArray.push({ key: 'optionType', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'OptionType'))] });
		baseValidationArray.push({ key: 'isActive', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'IsActive'))] });

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

export class AbsoluteDecimalInputOptionModel extends RegistrationInformationInputOptionModel implements AbsoluteDecimalInputOptionPersist
{
	upperBound: BoundedType<number>;
    lowerBound: BoundedType<number>;
	measurementUnit: string;
	validationRegexp: string;

	public fromModel(item: AbsoluteDecimalInputOption): AbsoluteDecimalInputOptionModel {
		super.fromModel(item as RegistrationInformationInputOption);
		this.upperBound = item.upperBound;
		this.lowerBound = item.lowerBound;
		this.measurementUnit = item.measurementUnit;
		this.validationRegexp = item.validationRegexp;

		return this;
	}

	override buildForm(context: ValidationContext, baseProperty: string, disabled: boolean, validationErrorModel: ValidationErrorModel): FormGroup {
		if (context == null) { context = this.createValidationContext(baseProperty); }

		var group = this.getGroup(context, baseProperty, disabled, validationErrorModel);
		group['measurementUnit'] = [{ value: this.measurementUnit, disabled: disabled }, context.getValidation('measurementUnit').validators];
		group['validationRegexp'] = [{ value: this.validationRegexp, disabled: disabled }, context.getValidation('validationRegexp').validators];
		group['upperBound'] = this.formBuilder.group({
			upperBoundType: [{value: this.upperBound?.upperBoundType, disabled: disabled}, context.getValidation('upperBoundType').validators ],
			value: [{value: this.upperBound?.value, disabled: disabled}, context.getValidation('upperBoundValue').validators ]
		});
		group['lowerBound'] = this.formBuilder.group({
			upperBoundType: [{value: this.lowerBound?.upperBoundType, disabled: disabled}, context.getValidation('lowerBoundType').validators ],
			value: [{value: this.lowerBound?.value, disabled: disabled}, context.getValidation('lowerBoundValue').validators ]
		});

		return this.formBuilder.group(group);
	}

	override createValidationContext(baseProperty?: string): ValidationContext {
		const baseContext: ValidationContext = super.createValidationContext(baseProperty);

		baseContext.validation.push({ key: 'measurementUnit', validators: [Validators.required, Validators.maxLength(250), BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'MeasurementUnit'))] });
		baseContext.validation.push({ key: 'validationRegexp', validators: [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'ValidationRegexp'))] });
		baseContext.validation.push({ key: 'upperBoundType', validators: [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'UpperBoundType'))] });
		baseContext.validation.push({ key: 'upperBoundValue', validators: [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Value'))] });
		baseContext.validation.push({ key: 'lowerBoundType', validators: [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'UpperBoundType'))] });
		baseContext.validation.push({ key: 'lowerBoundValue', validators: [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Value'))] });

		return baseContext;
	}
}

export class AbsoluteIntegerInputOptionModel extends RegistrationInformationInputOptionModel implements AbsoluteIntegerInputOptionPersist
{
	upperBound: BoundedType<number>;
    lowerBound: BoundedType<number>;
	measurementUnit: string;
	validationRegexp: string;

	public fromModel(item: AbsoluteIntegerInputOption): AbsoluteIntegerInputOptionModel {
		super.fromModel(item as RegistrationInformationInputOption);
		this.upperBound = item.upperBound;
		this.lowerBound = item.lowerBound;
		this.measurementUnit = item.measurementUnit;
		this.validationRegexp = item.validationRegexp;

		return this;
	}

	override buildForm(context: ValidationContext, baseProperty: string, disabled: boolean, validationErrorModel: ValidationErrorModel): FormGroup {
		if (context == null) { context = this.createValidationContext(baseProperty); }

		var group = this.getGroup(context, baseProperty, disabled, validationErrorModel);
		group['measurementUnit'] = [{ value: this.measurementUnit, disabled: disabled }, context.getValidation('measurementUnit').validators];
		group['validationRegexp'] = [{ value: this.validationRegexp, disabled: disabled }, context.getValidation('validationRegexp').validators];
		group['upperBound'] = this.formBuilder.group({
			upperBoundType: [{value: this.upperBound?.upperBoundType, disabled: disabled}, context.getValidation('upperBoundType').validators ],
			value: [{value: this.upperBound?.value, disabled: disabled}, context.getValidation('upperBoundValue').validators ]
		});
		group['lowerBound'] = this.formBuilder.group({
			upperBoundType: [{value: this.lowerBound?.upperBoundType, disabled: disabled}, context.getValidation('lowerBoundType').validators ],
			value: [{value: this.lowerBound?.value, disabled: disabled}, context.getValidation('lowerBoundValue').validators ]
		});

		return this.formBuilder.group(group);
	}

	override createValidationContext(baseProperty?: string): ValidationContext {
		const baseContext: ValidationContext = super.createValidationContext(baseProperty);

		baseContext.validation.push({ key: 'measurementUnit', validators: [Validators.required, Validators.maxLength(250), BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'MeasurementUnit'))] });
		baseContext.validation.push({ key: 'validationRegexp', validators: [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'ValidationRegexp'))] });
		baseContext.validation.push({ key: 'upperBoundType', validators: [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'UpperBoundType'))] });
		baseContext.validation.push({ key: 'upperBoundValue', validators: [IntegerValidator(), BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Value'))] });
		baseContext.validation.push({ key: 'lowerBoundType', validators: [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'UpperBoundType'))] });
		baseContext.validation.push({ key: 'lowerBoundValue', validators: [IntegerValidator(), BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Value'))] });

		return baseContext;
	}
}

export class PercentageInputOptionModel extends RegistrationInformationInputOptionModel implements PercentageInputOptionPersist
{
	upperBound: BoundedType<number>;
    lowerBound: BoundedType<number>;
	validationRegexp: string;

	public fromModel(item: PercentageInputOption): PercentageInputOptionModel {
		super.fromModel(item as RegistrationInformationInputOption);
		this.upperBound = item.upperBound;
		this.lowerBound = item.lowerBound;
		this.validationRegexp = item.validationRegexp;

		return this;
	}

	override buildForm(context: ValidationContext, baseProperty: string, disabled: boolean, validationErrorModel: ValidationErrorModel): FormGroup {
		if (context == null) { context = this.createValidationContext(baseProperty); }

		var group = this.getGroup(context, baseProperty, disabled, validationErrorModel);
		group['validationRegexp'] = [{ value: this.validationRegexp, disabled: disabled }, context.getValidation('validationRegexp').validators];
		group['upperBound'] = this.formBuilder.group({
			upperBoundType: [{value: this.upperBound?.upperBoundType, disabled: disabled}, context.getValidation('upperBoundType').validators ],
			value: [{value: this.upperBound?.value, disabled: disabled}, context.getValidation('upperBoundValue').validators ]
		});
		group['lowerBound'] = this.formBuilder.group({
			upperBoundType: [{value: this.lowerBound?.upperBoundType, disabled: disabled}, context.getValidation('lowerBoundType').validators ],
			value: [{value: this.lowerBound?.value, disabled: disabled}, context.getValidation('lowerBoundValue').validators ]
		});

		return this.formBuilder.group(group);
	}

	override createValidationContext(baseProperty?: string): ValidationContext {
		const baseContext: ValidationContext = super.createValidationContext(baseProperty);
		baseContext.validation.push({ key: 'validationRegexp', validators: [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'ValidationRegexp'))] });
		baseContext.validation.push({ key: 'upperBoundType', validators: [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'UpperBoundType'))] });
		baseContext.validation.push({ key: 'upperBoundValue', validators: [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Value'))] });
		baseContext.validation.push({ key: 'lowerBoundType', validators: [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'UpperBoundType'))] });
		baseContext.validation.push({ key: 'lowerBoundValue', validators: [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Value'))] });

		return baseContext;
	}
}

export class TextInputOptionModel extends RegistrationInformationInputOptionModel implements TextInputOptionPersist
{
	validationRegexp: string;

	public fromModel(item: TextInputOption): TextInputOptionModel {
		super.fromModel(item as RegistrationInformationInputOption);
		this.validationRegexp = item.validationRegexp;

		return this;
	}

	override buildForm(context: ValidationContext, baseProperty: string, disabled: boolean, validationErrorModel: ValidationErrorModel): FormGroup {
		if (context == null) { context = this.createValidationContext(baseProperty); }

		var group = this.getGroup(context, baseProperty, disabled, validationErrorModel);
		group['validationRegexp'] = [{ value: this.validationRegexp, disabled: disabled }, context.getValidation('validationRegexp').validators];

		return this.formBuilder.group(group);
	}

	override createValidationContext(baseProperty?: string): ValidationContext {
		const baseContext: ValidationContext = super.createValidationContext(baseProperty);
		baseContext.validation.push({ key: 'validationRegexp', validators: [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'ValidationRegexp'))] });
		return baseContext;
	}
}

export class ScaleInputOptionModel extends RegistrationInformationInputOptionModel implements ScaleInputOptionPersist
{
	scaleDisplayOption: ScaleDisplayOption;
	inputScale: InputScaleValueData[];

	public fromModel(item: ScaleInputOption): ScaleInputOptionModel {
		super.fromModel(item as RegistrationInformationInputOption);
		this.scaleDisplayOption = item.scaleDisplayOption;
		this.inputScale = item.inputScale;

		return this;
	}

	override buildForm(context: ValidationContext, baseProperty: string, disabled: boolean, validationErrorModel: ValidationErrorModel): FormGroup {
		if (context == null) { context = this.createValidationContext(baseProperty); }

		const optionsFormArray = new FormArray([]);
		var group = this.getGroup(context, baseProperty, disabled, validationErrorModel);

		if(this.inputScale)
		{
			this.inputScale.sort((a,b) => a.value - b.value).forEach((element, index) => {
				optionsFormArray.push(this.formBuilder.group({
					label: [{value: element.label, disabled: disabled}, context.getValidation('inputScaleLabel').validators ],
					iconIdentifier: [{value: element.iconIdentifier, disabled: disabled}, context.getValidation('iconIdentifier').validators ],
					idType: [{value: element.idType, disabled: disabled}, context.getValidation('idType').validators ],
					value: [{value: element.value, disabled: disabled}, context.getValidation('inputScaleValue').validators ]
				}));
			})
		}

		group['inputScale'] = optionsFormArray;
		group['scaleDisplayOption'] = [{ value: this.scaleDisplayOption, disabled: disabled }, context.getValidation('scaleDisplayOption').validators];
		return this.formBuilder.group(group);
	}

	override createValidationContext(baseProperty?: string): ValidationContext {
		const baseContext: ValidationContext = super.createValidationContext(baseProperty);

		baseContext.validation.push({ key: 'scaleDisplayOption', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'ScaleDisplayOption'))] });
		baseContext.validation.push({ key: 'inputScaleLabel', validators: [Validators.required, Validators.maxLength(250), BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'InputScale'))] });
		baseContext.validation.push({ key: 'iconIdentifier', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'IconIdentifier'))] });
		baseContext.validation.push({ key: 'idType', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'IdType'))] });
		baseContext.validation.push({ key: 'inputScaleValue', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Value'))] });
		return baseContext;
	}
}

export class SelectionInputOptionModel extends RegistrationInformationInputOptionModel implements SelectionInputOptionPersist
{
	inputSelectionOptions: InputSelectionOptionsData[];

	public fromModel(item: SelectionInputOption): SelectionInputOptionModel {
		super.fromModel(item as RegistrationInformationInputOption);
		this.inputSelectionOptions = item.inputSelectionOptions;

		return this;
	}

	override buildForm(context: ValidationContext, baseProperty: string, disabled: boolean, validationErrorModel: ValidationErrorModel): FormGroup {
		if (context == null) { context = this.createValidationContext(baseProperty); }

		const optionsFormArray = new FormArray([], context.getValidation('inputSelectionArray').validators );
		var group = this.getGroup(context, baseProperty, disabled, validationErrorModel);

		if(this.inputSelectionOptions)
		{
			this.inputSelectionOptions.forEach((element, index) => {
				optionsFormArray.push(this.formBuilder.group({
					key: [{value: element.key, disabled: disabled}, context.getValidation('inputSelectionKey').validators ],
					value: [{value: element.value, disabled: disabled}, context.getValidation('inputSelectionValue').validators ]
				}));
			})
		}

		group['inputSelectionOptions'] = optionsFormArray;

		return this.formBuilder.group(group); 
	}

	override createValidationContext(baseProperty?: string): ValidationContext {
		const baseContext: ValidationContext = super.createValidationContext(baseProperty);

		baseContext.validation.push({ key: 'inputSelectionArray', validators: [Validators.required, DuplicateValidator((item) => item.key)] });
		baseContext.validation.push({ key: 'inputSelectionKey', validators: [Validators.required, Validators.maxLength(250), BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Key'))] });
		baseContext.validation.push({ key: 'inputSelectionValue', validators: [Validators.required, Validators.maxLength(250), BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Value'))] });
		return baseContext;
	}
}

export class RegistrationInformationModel implements RegistrationInformationPersist {
	inputOptions: RegistrationInformationInputOptionModel[];

	public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();
	protected formBuilder: FormBuilder = new FormBuilder();

	constructor() { }

	public fromModel(item: RegistrationInformation): RegistrationInformationModel {
		if (item && item.inputOptions) {
				this.inputOptions = item.inputOptions.map(x => {
					switch (x.optionType) {
						case RegistrationInformationType.AbsoluteDecimalInputOption:
							return new AbsoluteDecimalInputOptionModel().fromModel(x as AbsoluteDecimalInputOption);
						case RegistrationInformationType.AbsoluteIntegerInputOption:
							return new AbsoluteIntegerInputOptionModel().fromModel(x as AbsoluteIntegerInputOption);
						case RegistrationInformationType.PercentageInputOption:
							return new PercentageInputOptionModel().fromModel(x as PercentageInputOption);
						case RegistrationInformationType.TextInputOption:
							return new TextInputOptionModel().fromModel(x as TextInputOption);
						case RegistrationInformationType.ScaleInputOption:
							return new ScaleInputOptionModel().fromModel(x as ScaleInputOption);
						case RegistrationInformationType.SelectionInputOption:
							return new SelectionInputOptionModel().fromModel(x as SelectionInputOption);
						default:
							return new RegistrationInformationInputOptionModel().fromModel(x);
					}
				});
		}
		return this;
	}

	buildForm(context: ValidationContext = null, disabled: boolean = false): FormGroup {
		if (context == null) { context = this.createValidationContext(); }

		const detailsFormArray = new Array<FormGroup>();

		if(this.inputOptions)
		{
			this.inputOptions.forEach((element, index) => {
				detailsFormArray.push(this.buildOptionForm(element, disabled));
			})
		}

		return this.formBuilder.group({
			inputOptions: this.formBuilder.array(detailsFormArray),
		});
	}	

	createValidationContext(): ValidationContext {
		const baseContext: ValidationContext = new ValidationContext();

		return baseContext;
	}

	buildOptionForm(detail: RegistrationInformationInputOptionModel, disabled: boolean = false): FormGroup {
		return detail.buildForm(null, `RegistrationInformation`, disabled , this.validationErrorModel);
	}
}



export class DataObjectTypeEditorModel extends BaseEditorModel implements DataObjectTypePersist {
	name: string;
	info: RegistrationInformationModel;
	config: EvaluationConfigurationModel;
	strategyConfig: ObjectRankRecalculationStrategyConfigurationModel;
	selectedRankingMethodologyId?: Guid;
	multipleReviewOption: boolean;

	public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();
	protected formBuilder: FormBuilder = new FormBuilder();

	constructor() { 
		super();
	}

	public fromModel(item: DataObjectType): DataObjectTypeEditorModel {
		if (item) {
			super.fromModel(item);
			this.name = item.name;
			this.selectedRankingMethodologyId = item.selectedRankingMethodologyId;
			this.multipleReviewOption = item.multipleReviewOption;			
			if(item.info) this.info = new RegistrationInformationModel().fromModel(item.info);
			if(item.config) this.config = new EvaluationConfigurationModel().fromModel(item.config);
			if(item.strategyConfig) this.strategyConfig = new ObjectRankRecalculationStrategyConfigurationModel().fromModel(item.strategyConfig);
		}
		return this;
	}

	buildForm(context: ValidationContext = null, disabled: boolean = false): FormGroup {
		if (context == null) { context = this.createValidationContext(); }

		var form = this.formBuilder.group({
			id: [{ value: this.id, disabled: disabled }, context.getValidation('id').validators],
			name: [{ value: this.name, disabled: disabled }, context.getValidation('name').validators],
			info: this.buildRegistrationInformationForm(this.info ? this.info : new RegistrationInformationModel(), disabled),
			config: this.buildEvaluationConfigurationForm(this.config ? this.config : new EvaluationConfigurationModel(), disabled),
			selectedRankingMethodologyId: [{ value: this.selectedRankingMethodologyId, disabled: disabled }, context.getValidation('selectedRankingMethodologyId').validators],
			multipleReviewOption: [{ value: this.multipleReviewOption, disabled: disabled }, context.getValidation('multipleReviewOption').validators],
			hash: [{ value: this.hash, disabled: disabled }, context.getValidation('hash').validators],
		});
		return form;           
	}


	createValidationContext(): ValidationContext {
			const baseContext: ValidationContext = new ValidationContext();
			const baseValidationArray: Validation[] = new Array<Validation>();
			baseValidationArray.push({ key: 'id', validators: [BackendErrorValidator(this.validationErrorModel, 'Id')] });
			baseValidationArray.push({ key: 'name', validators: [Validators.required, Validators.maxLength(250), BackendErrorValidator(this.validationErrorModel, 'Name')] });
			baseValidationArray.push({ key: 'hash', validators: [BackendErrorValidator(this.validationErrorModel, 'Hash')] });
			baseValidationArray.push({ key: 'selectedRankingMethodologyId', validators: [BackendErrorValidator(this.validationErrorModel, 'SelectedRankingMethodologyId')] });
			baseValidationArray.push({ key: 'multipleReviewOption', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'multipleReviewOption')] });

			baseContext.validation = baseValidationArray;
			return baseContext;
		}

	buildRegistrationInformationForm(info: RegistrationInformationModel, disabled: boolean = false): FormGroup {
		return info.buildForm(null, disabled);
	}

	buildEvaluationConfigurationForm(config: EvaluationConfigurationModel, disabled: boolean = false): FormGroup {
		return config.buildForm(null, disabled);
	}

	buildStrategyConfigurationForm(strategyConfig: ObjectRankRecalculationStrategyConfigurationModel, disabled: boolean = false): FormGroup {
		return strategyConfig.buildForm(null, disabled);
	}
}
