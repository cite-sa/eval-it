import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BackendErrorValidator, IntegerValidator, NumberValidator, RegexpValidator, ValueWithinBoundsValidator } from '@common/forms/validation/custom-validator';
import { ValidationErrorModel } from '@common/forms/validation/error-model/validation-error-model';
import { Validation, ValidationContext } from '@common/forms/validation/validation-context';
import { BaseEditorModel } from '@common/base/base-editor.model';
import { Guid } from '@common/types/guid';
import { AbsoluteDecimalAttribute, AbsoluteDecimalAttributePersist, AbsoluteIntegerAttribute, AbsoluteIntegerAttributePersist, DataObjectAttribute, DataObjectAttributeData, DataObjectAttributeDataPersist, DataObjectAttributePersist, PercentageAttribute, PercentageAttributePersist, ScaleAttribute, ScaleAttributePersist, SelectionAttribute, SelectionAttributePersist, TextAttribute, TextAttributePersist } from '@app/core/model/data-object/data-object-attribute.model';
import { DataObjectAttributeType } from '@app/core/enum/data-object-attribute-type.enum';
import { DataObject, DataObjectPersist, PersistentID } from '@app/core/model/data-object/data-object.model';
import { DataObjectTypeEditorModel } from '@app/ui/data-object-type/editor/data-object-type-editor.model';
import { AbsoluteDecimalInputOption, AbsoluteIntegerInputOption, PercentageInputOption, RegistrationInformationInputOption, ScaleInputOption, SelectionInputOption, TextInputOption } from '@app/core/model/data-object-type/registration-information.model';

export class DataObjectAttributeModel implements DataObjectAttributePersist {
    optionId: Guid;
    attributeType: DataObjectAttributeType;

	public validationErrorModel : ValidationErrorModel = new ValidationErrorModel();
	protected formBuilder: FormBuilder = new FormBuilder();

	constructor() { }

	public fromModel(item: DataObjectAttribute): DataObjectAttributeModel {
		if (item) {
			this.optionId = item.optionId;
			this.attributeType = item.attributeType;
		}
		return this;
	}

	buildForm(context: ValidationContext = null, baseProperty: string = null, disabled: boolean = false, regInfoOption: RegistrationInformationInputOption = null, validationErrorModel: ValidationErrorModel): FormGroup {
		this.validationErrorModel = validationErrorModel;
		if (context == null) { context = this.createValidationContext(baseProperty); }

		return this.formBuilder.group({
			optionId: [{ value: this.optionId, disabled: disabled }, context.getValidation('optionId').validators],
			attributeType: [{ value: this.attributeType, disabled: disabled }, context.getValidation('attributeType').validators],
		});
	}

	buildValueControl(context: ValidationContext = null, baseProperty: string = null, disabled: boolean = false, regInfoOption: RegistrationInformationInputOption = null, validationErrorModel: ValidationErrorModel) { }

	getGroup(context: ValidationContext = null, baseProperty: string = null, disabled: boolean = false, validationErrorModel: ValidationErrorModel): any {
		this.validationErrorModel = validationErrorModel;
		if (context == null) { context = this.createValidationContext(baseProperty); }

		return {
			optionId: [{ value: this.optionId, disabled: disabled }, context.getValidation('optionId').validators],
			attributeType: [{ value: this.attributeType, disabled: disabled }, context.getValidation('attributeType').validators],
		};
	}

	createValidationContext(baseProperty?: string): ValidationContext {
		const baseContext: ValidationContext = new ValidationContext();
		const baseValidationArray: Validation[] = new Array<Validation>();
		baseValidationArray.push({ key: 'optionId', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'OptionId'))] });
		baseValidationArray.push({ key: 'attributeType', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'AttributeType'))] });

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

export class AbsoluteDecimalAttributeModel extends DataObjectAttributeModel implements AbsoluteDecimalAttributePersist
{
	values: number[];

	public fromModel(item: AbsoluteDecimalAttribute): AbsoluteDecimalAttributeModel {
		super.fromModel(item as DataObjectAttribute);
		this.values = item.values;

		return this;
	}

	override buildForm(context: ValidationContext, baseProperty: string, disabled: boolean, regInfoOption: AbsoluteDecimalInputOption = null, validationErrorModel: ValidationErrorModel): FormGroup {
		if (context == null) { context = this.createValidationContext(baseProperty); }

		var group = this.getGroup(context, baseProperty, disabled, validationErrorModel);
		group['values'] = this.formBuilder.array(this.values ? this.values.map(x =>{
			let validators =  context.getValidation('values').validators;
			if(regInfoOption != null)
			{
				if(regInfoOption.validationRegexp != null) validators.push(RegexpValidator(regInfoOption.validationRegexp));
				if(regInfoOption.upperBound != null && regInfoOption.upperBound.value != null) validators.push(ValueWithinBoundsValidator(regInfoOption.upperBound, true));
				if(regInfoOption.lowerBound != null && regInfoOption.lowerBound.value != null) validators.push(ValueWithinBoundsValidator(regInfoOption.lowerBound, false));
			}
			return [{ value: x, disabled: disabled }, validators]
		}) : []);

		return this.formBuilder.group(group);
	}

	buildValueControl(context: ValidationContext = null, baseProperty: string = null, disabled: boolean = false, regInfoOption: AbsoluteDecimalInputOption = null) : FormControl {
		if (context == null) { context = this.createValidationContext(baseProperty); }

		let validators =  context.getValidation('values').validators;
		if(regInfoOption != null)
		{
			if(regInfoOption.validationRegexp != null) validators.push(RegexpValidator(regInfoOption.validationRegexp));
			if(regInfoOption.upperBound != null && regInfoOption.upperBound.value != null) validators.push(ValueWithinBoundsValidator(regInfoOption.upperBound, true));
			if(regInfoOption.lowerBound != null && regInfoOption.lowerBound.value != null) validators.push(ValueWithinBoundsValidator(regInfoOption.lowerBound, false));
		}

		return this.formBuilder.control({ value: null, disabled: disabled}, validators);
	}

	override createValidationContext(baseProperty?: string): ValidationContext {
		const baseContext: ValidationContext = super.createValidationContext(baseProperty);

		baseContext.validation.push({ key: 'values', validators: [Validators.required, NumberValidator(), BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Values'))] });
		return baseContext;
	}
}

export class AbsoluteIntegerAttributeModel extends DataObjectAttributeModel implements AbsoluteIntegerAttributePersist
{
	values: number[];

	public fromModel(item: AbsoluteIntegerAttribute): AbsoluteIntegerAttributeModel {
		super.fromModel(item as DataObjectAttribute);
		this.values = item.values;

		return this;
	}

	override buildForm(context: ValidationContext, baseProperty: string, disabled: boolean, regInfoOption: AbsoluteIntegerInputOption = null, validationErrorModel: ValidationErrorModel): FormGroup {
		if (context == null) { context = this.createValidationContext(baseProperty); }

		var group = this.getGroup(context, baseProperty, disabled, validationErrorModel);
		group['values'] = this.formBuilder.array(this.values ? this.values.map(x =>{
			let validators =  context.getValidation('values').validators;
			if(regInfoOption != null)
			{
				if(regInfoOption.validationRegexp != null) validators.push(RegexpValidator(regInfoOption.validationRegexp));
				if(regInfoOption.upperBound != null && regInfoOption.upperBound.value != null) validators.push(ValueWithinBoundsValidator(regInfoOption.upperBound, true));
				if(regInfoOption.lowerBound != null && regInfoOption.lowerBound.value != null) validators.push(ValueWithinBoundsValidator(regInfoOption.lowerBound, false));
			}
			return [{ value: x, disabled: disabled }, validators]
		}) : []);

		return this.formBuilder.group(group);
	}

	buildValueControl(context: ValidationContext = null, baseProperty: string = null, disabled: boolean = false, regInfoOption: AbsoluteIntegerInputOption = null) : FormControl {
		if (context == null) { context = this.createValidationContext(baseProperty); }

		let validators =  context.getValidation('values').validators;
		if(regInfoOption != null)
		{
			if(regInfoOption.validationRegexp != null) validators.push(RegexpValidator(regInfoOption.validationRegexp));
			if(regInfoOption.upperBound != null && regInfoOption.upperBound.value != null) validators.push(ValueWithinBoundsValidator(regInfoOption.upperBound, true));
			if(regInfoOption.lowerBound != null && regInfoOption.lowerBound.value != null) validators.push(ValueWithinBoundsValidator(regInfoOption.lowerBound, false));
		}

		return this.formBuilder.control({ value: null, disabled: disabled}, validators);
	}

	override createValidationContext(baseProperty?: string): ValidationContext {
		const baseContext: ValidationContext = super.createValidationContext(baseProperty);

		baseContext.validation.push({ key: 'values', validators: [Validators.required, IntegerValidator(), BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Values'))] });
		return baseContext;
	}
}

export class PercentageAttributeModel extends DataObjectAttributeModel implements PercentageAttributePersist
{
	values: number[];

	public fromModel(item: PercentageAttribute): PercentageAttributeModel {
		super.fromModel(item as DataObjectAttribute);
		this.values = item.values;

		return this;
	}

	override buildForm(context: ValidationContext, baseProperty: string, disabled: boolean, regInfoOption: PercentageInputOption = null, validationErrorModel: ValidationErrorModel): FormGroup {
		if (context == null) { context = this.createValidationContext(baseProperty); }

		var group = this.getGroup(context, baseProperty, disabled, validationErrorModel);
		group['values'] = this.formBuilder.array(this.values ? this.values.map(x =>{
			let validators =  context.getValidation('values').validators;
			if(regInfoOption != null)
			{
				if(regInfoOption.validationRegexp != null) validators.push(RegexpValidator(regInfoOption.validationRegexp));
				if(regInfoOption.upperBound != null && regInfoOption.upperBound.value != null) validators.push(ValueWithinBoundsValidator(regInfoOption.upperBound, true));
				if(regInfoOption.lowerBound != null && regInfoOption.lowerBound.value != null) validators.push(ValueWithinBoundsValidator(regInfoOption.lowerBound, false));
			}
			return [{ value: x, disabled: disabled }, validators]
		}) : []);

		return this.formBuilder.group(group);
	}

	buildValueControl(context: ValidationContext = null, baseProperty: string = null, disabled: boolean = false, regInfoOption: PercentageInputOption = null) : FormControl {
		if (context == null) { context = this.createValidationContext(baseProperty); }

		let validators =  context.getValidation('values').validators;
		if(regInfoOption != null)
		{
			if(regInfoOption.validationRegexp != null) validators.push(RegexpValidator(regInfoOption.validationRegexp));
			if(regInfoOption.upperBound != null && regInfoOption.upperBound.value != null) validators.push(ValueWithinBoundsValidator(regInfoOption.upperBound, true));
			if(regInfoOption.lowerBound != null && regInfoOption.lowerBound.value != null) validators.push(ValueWithinBoundsValidator(regInfoOption.lowerBound, false));
		}

		return this.formBuilder.control({ value: null, disabled: disabled}, validators);
	}

	override createValidationContext(baseProperty?: string): ValidationContext {
		const baseContext: ValidationContext = super.createValidationContext(baseProperty);

		baseContext.validation.push({ key: 'values', validators: [Validators.required, NumberValidator(), BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Values'))] });
		return baseContext;
	}
}

export class TextAttributeModel extends DataObjectAttributeModel implements TextAttributePersist
{
	values: string[];

	public fromModel(item: TextAttribute): TextAttributeModel {
		super.fromModel(item as DataObjectAttribute);
		this.values = item.values;

		return this;
	}

	override buildForm(context: ValidationContext, baseProperty: string, disabled: boolean, regInfoOption: TextInputOption = null, validationErrorModel: ValidationErrorModel): FormGroup {
		if (context == null) { context = this.createValidationContext(baseProperty); }

		var group = this.getGroup(context, baseProperty, disabled, validationErrorModel);
		group['values'] = this.formBuilder.array(this.values ? this.values.map(x =>{
			let validators =  context.getValidation('values').validators;
			if(regInfoOption != null && regInfoOption.validationRegexp != null) validators.push(RegexpValidator(regInfoOption.validationRegexp));
			return [{ value: x, disabled: disabled }, validators]
		}) : []);

		return this.formBuilder.group(group);
	}

	buildValueControl(context: ValidationContext = null, baseProperty: string = null, disabled: boolean = false, regInfoOption: TextInputOption = null) : FormControl {

		if (context == null) { context = this.createValidationContext(baseProperty); }

		let validators =  context.getValidation('values').validators;
		if(regInfoOption != null && regInfoOption.validationRegexp != null) validators.push(RegexpValidator(regInfoOption.validationRegexp));

		return this.formBuilder.control({ value: null, disabled: disabled}, validators);
	}

	override createValidationContext(baseProperty?: string): ValidationContext {
		const baseContext: ValidationContext = super.createValidationContext(baseProperty);

		baseContext.validation.push({ key: 'values', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Values'))] });
		return baseContext;
	}
}

export class ScaleAttributeModel extends DataObjectAttributeModel implements ScaleAttributePersist
{
	values: number[];

	public fromModel(item: ScaleAttribute): ScaleAttributeModel {
		super.fromModel(item as DataObjectAttribute);
		this.values = item.values;

		return this;
	}

	override buildForm(context: ValidationContext, baseProperty: string, disabled: boolean, regInfoOption: ScaleInputOption = null, validationErrorModel: ValidationErrorModel): FormGroup {
		if (context == null) { context = this.createValidationContext(baseProperty); }

		var group = this.getGroup(context, baseProperty, disabled, validationErrorModel);
		group['values'] = this.formBuilder.array(this.values ? this.values.map(x => [{ value: x, disabled: disabled }, context.getValidation('values').validators] ) : []);

		return this.formBuilder.group(group);
	}

	buildValueControl(context: ValidationContext = null, baseProperty: string = null, disabled: boolean = false, regInfoOption: ScaleInputOption = null) : FormControl {

		if (context == null) { context = this.createValidationContext(baseProperty); }

		return this.formBuilder.control({ value: null, disabled: disabled}, context.getValidation('values').validators);
	}

	override createValidationContext(baseProperty?: string): ValidationContext {
		const baseContext: ValidationContext = super.createValidationContext(baseProperty);

		baseContext.validation.push({ key: 'values', validators: [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Values'))] });
		return baseContext;
	}
}

export class SelectionAttributeModel extends DataObjectAttributeModel implements SelectionAttributePersist
{
	values: number[];

	public fromModel(item: SelectionAttribute): SelectionAttributeModel {
		super.fromModel(item as DataObjectAttribute);
		this.values = item.values;

		return this;
	}

	override buildForm(context: ValidationContext, baseProperty: string, disabled: boolean, regInfoOption: SelectionInputOption = null, validationErrorModel: ValidationErrorModel): FormGroup {
		if (context == null) { context = this.createValidationContext(baseProperty); }

		var group = this.getGroup(context, baseProperty, disabled, validationErrorModel);
		group['values'] = this.formBuilder.array(this.values ? this.values.map(x => [{ value: x, disabled: disabled }, context.getValidation('values').validators] ) : []);

		return this.formBuilder.group(group);
	}

	buildValueControl(context: ValidationContext = null, baseProperty: string = null, disabled: boolean = false, regInfoOption: SelectionInputOption = null) : FormControl {
		if (context == null) { context = this.createValidationContext(baseProperty); }

		return this.formBuilder.control({ value: null, disabled: disabled}, context.getValidation('values').validators);
	}
	
	override createValidationContext(baseProperty?: string): ValidationContext {
		const baseContext: ValidationContext = super.createValidationContext(baseProperty);

		baseContext.validation.push({ key: 'values', validators: [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Values'))] });
		return baseContext;
	}
}

export class DataObjectAttributeDataModel implements DataObjectAttributeDataPersist {
	attributes: DataObjectAttributeModel[];

	public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();
	protected formBuilder: FormBuilder = new FormBuilder();

	constructor() { }

	public fromModel(item: DataObjectAttributeData): DataObjectAttributeDataModel {
		if (item && item.attributes) {
				this.attributes = item.attributes.map(x => {
					switch (x.attributeType) {
						case DataObjectAttributeType.AbsoluteDecimalAttribute:
							return new AbsoluteDecimalAttributeModel().fromModel(x as AbsoluteDecimalAttribute);
						case DataObjectAttributeType.AbsoluteIntegerAttribute:
							return new AbsoluteIntegerAttributeModel().fromModel(x as AbsoluteIntegerAttribute);
						case DataObjectAttributeType.PercentageAttribute:
							return new PercentageAttributeModel().fromModel(x as PercentageAttribute);
						case DataObjectAttributeType.TextAttribute:
							return new TextAttributeModel().fromModel(x as TextAttribute);
						case DataObjectAttributeType.ScaleAttribute:
							return new ScaleAttributeModel().fromModel(x as ScaleAttribute);
						case DataObjectAttributeType.SelectionAttribute:
							return new SelectionAttributeModel().fromModel(x as SelectionAttribute);
						default:
							return new DataObjectAttributeModel().fromModel(x);
					}
				});
		}
		return this;
	}

	buildForm(context: ValidationContext = null, disabled: boolean = false, regInfoOptionMap : Map<Guid,RegistrationInformationInputOption> = null): FormGroup {
		if (context == null) { context = this.createValidationContext(); }

		const detailsFormArray = new Array<FormGroup>();

		if(this.attributes)
		{
			this.attributes.forEach((element, index) => {
				var regInfoOption : RegistrationInformationInputOption = null;
				if( regInfoOptionMap != null)
				{
					regInfoOption = regInfoOptionMap.has(element.optionId) ? regInfoOptionMap.get(element.optionId) : null;
				}
				detailsFormArray.push(this.buildOptionForm(element, disabled, regInfoOption));
			})
		}

		return this.formBuilder.group({
			attributes: this.formBuilder.array(detailsFormArray),
		});
	}	

	createValidationContext(): ValidationContext {
		const baseContext: ValidationContext = new ValidationContext();

		return baseContext;
	}

	buildOptionForm(detail: DataObjectAttributeModel, disabled: boolean = false, regInfoOption: RegistrationInformationInputOption = null): FormGroup {
		return detail.buildForm(null, `DataObjectAttributeData`, disabled , regInfoOption, this.validationErrorModel);
	}
}

export class DataObjectEditorModel extends BaseEditorModel implements DataObjectPersist {
	title: string;
	description: string;
	userDefinedIds: PersistentID[];
	userId: Guid;
	dataObjectType: DataObjectTypeEditorModel;
	dataObjectTypeId?: Guid;
	attributeData: DataObjectAttributeDataModel;

	public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();
	protected formBuilder: FormBuilder = new FormBuilder();

	constructor() { 
		super();
	}


	public fromModel(item: DataObject): DataObjectEditorModel {
		if (item) {
			super.fromModel(item);
			this.title = item.title;
			this.description = item.description;
			this.userDefinedIds = item.userDefinedIds;
			this.userId = item.userId;
			this.dataObjectTypeId = item.dataObjectTypeId;
			if(item.dataObjectType) this.dataObjectType = new DataObjectTypeEditorModel().fromModel(item.dataObjectType);
			if(item.attributeData) this.attributeData = new DataObjectAttributeDataModel().fromModel(item.attributeData);
		}
		return this;
	}

	buildForm(context: ValidationContext = null, disabled: boolean = false): FormGroup {
		if (context == null) { context = this.createValidationContext(); }

		let userDefinedIdForm = this.userDefinedIds ? this.userDefinedIds?.map(x => this.formBuilder.group(
			{
				type: [{ value: x.type, disabled: disabled }, []],
				key: [{ value: x.key, disabled: disabled }, []],
				value: [{ value: x.value, disabled: disabled }, []],
			})) : [];

		var form = this.formBuilder.group({
			id: [{ value: this.id, disabled: disabled }, context.getValidation('id').validators],			
			title: [{ value: this.title, disabled: disabled }, context.getValidation('title').validators],
			description: [{ value: this.description, disabled: disabled }, context.getValidation('description').validators],
			userDefinedIds: this.formBuilder.array(userDefinedIdForm),
			userId: [{value: this.userId, disabled: disabled}, context.getValidation('userId').validators],
			dataObjectTypeId: [{ value: this.dataObjectTypeId, disabled: disabled }, context.getValidation('dataObjectTypeId').validators],
			attributeData: this.buildRegistrationInformationForm(this.attributeData ? this.attributeData : new DataObjectAttributeDataModel(), disabled),
			hash: [{ value: this.hash, disabled: disabled }, context.getValidation('hash').validators],
		});
		return form;           
	}


	createValidationContext(): ValidationContext {
			const baseContext: ValidationContext = new ValidationContext();
			const baseValidationArray: Validation[] = new Array<Validation>();
			baseValidationArray.push({ key: 'id', validators: [BackendErrorValidator(this.validationErrorModel, 'Id')] });
			baseValidationArray.push({ key: 'title', validators: [Validators.required, Validators.maxLength(250), BackendErrorValidator(this.validationErrorModel, 'Title')] });
			baseValidationArray.push({ key: 'description', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'Description')] });
			baseValidationArray.push({ key: 'userDefinedIds', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'UserDefinedIds')] });
			baseValidationArray.push({ key: 'userId', validators: [BackendErrorValidator(this.validationErrorModel, 'UserId')] });
			baseValidationArray.push({ key: 'dataObjectTypeId', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'DataObjectTypeId')] });
			baseValidationArray.push({ key: 'hash', validators: [BackendErrorValidator(this.validationErrorModel, 'Hash')] });

			baseContext.validation = baseValidationArray;
			return baseContext;
		}

	buildRegistrationInformationForm(info: DataObjectAttributeDataModel, disabled: boolean = false): FormGroup {
		var map : Map<Guid,RegistrationInformationInputOption> = null;
		if( this.dataObjectType != null)
		{
			map = new Map<Guid, RegistrationInformationInputOption>();
			this.dataObjectType.info.inputOptions.forEach(o => {
				map.set(o.optionId,o);
			})
		}
		return info.buildForm(null, disabled, map);
	}
}
