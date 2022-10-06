import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { IsActive } from "@app/core/enum/is-active.enum";
import { RankingProfileType } from "@app/core/enum/ranking-profile-type.enum";
import { AbsoluteDecimalRankingProfile, AbsoluteDecimalRankingProfilePersist, AbsoluteIntegerRankingProfile, AbsoluteIntegerRankingProfilePersist, BaseRankingProfile, BaseRankingProfilePersist, BoundedType, DataObjectTypeRankingMethodology, DataObjectTypeRankingMethodologyPersist, PercentageRankingProfile, PercentageRankingProfilePersist, RankingConfiguration, RankingConfigurationPersist, ScaleRankingProfile, ScaleRankingProfilePersist, SelectionRankingProfile, SelectionRankingProfilePersist } from "@app/core/model/data-object-type/ranking-methodology.model";
import { BaseEditorModel } from "@common/base/base-editor.model";
import { BackendErrorValidator, BoundedIncreasingValidator } from "@common/forms/validation/custom-validator";
import { ValidationErrorModel } from "@common/forms/validation/error-model/validation-error-model";
import { Validation, ValidationContext } from "@common/forms/validation/validation-context";
import { Guid } from "@common/types/guid";

export class BaseRankingProfileModel implements BaseRankingProfilePersist {
    optionId?: Guid;
    optionWeight: number;
    mappedUserValues: number[];
    profileType: RankingProfileType;
    isActive: IsActive;
    
    public validationErrorModel : ValidationErrorModel = new ValidationErrorModel();
    protected formBuilder: FormBuilder = new FormBuilder();

    constructor() { }

    public fromModel(item: BaseRankingProfile): BaseRankingProfileModel {
        if (item) {
            this.optionId = item.optionId;
            this.optionWeight = item.optionWeight;
            this.profileType = item.profileType;
            this.mappedUserValues = item.mappedUserValues;
            this.isActive = item.isActive;
        }
        return this;
    }

    buildForm(context: ValidationContext = null, baseProperty: string = null, disabled: boolean = false, validationErrorModel: ValidationErrorModel): FormGroup {
        return this.formBuilder.group(this.getGroup(context, baseProperty, disabled, validationErrorModel));
    }

    getGroup(context: ValidationContext = null, baseProperty: string = null, disabled: boolean = false, validationErrorModel: ValidationErrorModel): any {
        this.validationErrorModel = validationErrorModel;
        if (context == null) { context = this.createValidationContext(baseProperty); }

		const mappedUserValueArray = new FormArray([], context.getValidation('mappedUserValue').validators );

        if(this.mappedUserValues) {
            this.mappedUserValues.forEach((element,index) => {
                mappedUserValueArray.push(this.formBuilder.control({value: element, disabled: disabled}, context.getValidation('mappedUserValue').validators))
            })
        }

        return {
            optionId: [{ value: this.optionId, disabled: disabled }, context.getValidation('optionId').validators],
            optionWeight: [{ value: this.optionWeight, disabled: disabled }, context.getValidation('optionWeight').validators],
            profileType: [{ value: this.profileType, disabled: disabled }, context.getValidation('profileType').validators],
            isActive: [{ value: this.isActive, disabled: disabled }, context.getValidation('isActive').validators],
            mappedUserValues: mappedUserValueArray
        };
    }

    createValidationContext(baseProperty?: string): ValidationContext {
        const baseContext: ValidationContext = new ValidationContext();
        const baseValidationArray: Validation[] = new Array<Validation>();
		baseValidationArray.push({ key: 'optionId', validators: [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'OptionId'))] });
        baseValidationArray.push({ key: 'optionWeight', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'OptionWeight'))] });
		baseValidationArray.push({ key: 'profileType', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'ProfileType'))] });
		baseValidationArray.push({ key: 'isActive', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'IsActive'))] });
		baseValidationArray.push({ key: 'mappedUserValue', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'MappedUserValues'))] });

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

export class AbsoluteDecimalRankingProfileModel extends BaseRankingProfileModel implements AbsoluteDecimalRankingProfilePersist {
    mappedRangeBounds: BoundedType<number>[];

    public fromModel(item: AbsoluteDecimalRankingProfile): AbsoluteDecimalRankingProfileModel {
        super.fromModel(item as BaseRankingProfile);
        this.mappedRangeBounds = item.mappedRangeBounds;

        return this;
    }

    override buildForm(context: ValidationContext, baseProperty: string, disabled: boolean, validationErrorModel: ValidationErrorModel): FormGroup {
        if (context == null) { context = this.createValidationContext(baseProperty); }

		const boundsFormArray = new FormArray([], context.getValidation('mappedRangeBounds').validators );
        var group = this.getGroup(context, baseProperty, disabled, validationErrorModel);

        if(this.mappedRangeBounds) {
            this.mappedRangeBounds.forEach((element, index) => {
                boundsFormArray.push(this.formBuilder.group({
                    upperBoundType: [{value: element.upperBoundType, disabled: disabled}, context.getValidation('mappedRangeBoundsType').validators ],
					value: [{value: element.value, disabled: disabled}, context.getValidation('mappedRangeBoundsValue').validators ]
                }))
            })
        }
        
        if(disabled) boundsFormArray.disable();
        group['mappedRangeBounds'] = boundsFormArray;

        return this.formBuilder.group(group);
    }

    override createValidationContext(baseProperty?: string): ValidationContext {
        const baseContext: ValidationContext = super.createValidationContext(baseProperty);

        baseContext.validation.push({ key: 'mappedRangeBounds', validators: [BoundedIncreasingValidator()]});
		baseContext.validation.push({ key: 'mappedRangeBoundsType', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'UpperBoundType'))] });
		baseContext.validation.push({ key: 'mappedRangeBoundsValue', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Value'))] });
		return baseContext;
    }
}

export class AbsoluteIntegerRankingProfileModel extends BaseRankingProfileModel implements AbsoluteIntegerRankingProfilePersist {
    mappedRangeBounds: BoundedType<number>[];

    public fromModel(item: AbsoluteIntegerRankingProfile): AbsoluteIntegerRankingProfileModel {
        super.fromModel(item as BaseRankingProfile);
        this.mappedRangeBounds = item.mappedRangeBounds;

        return this;
    }

    override buildForm(context: ValidationContext, baseProperty: string, disabled: boolean, validationErrorModel: ValidationErrorModel): FormGroup {
        if (context == null) { context = this.createValidationContext(baseProperty); }

		const boundsFormArray = new FormArray([], context.getValidation('mappedRangeBounds').validators );
        var group = this.getGroup(context, baseProperty, disabled, validationErrorModel);

        if(this.mappedRangeBounds) {
            this.mappedRangeBounds.forEach((element, index) => {
                boundsFormArray.push(this.formBuilder.group({
                    upperBoundType: [{value: element.upperBoundType, disabled: disabled}, context.getValidation('mappedRangeBoundsType').validators ],
					value: [{value: element.value, disabled: disabled}, context.getValidation('mappedRangeBoundsValue').validators ]
                }))
            })
        }

        if(disabled) boundsFormArray.disable();
        group['mappedRangeBounds'] = boundsFormArray;

        return this.formBuilder.group(group);
    }

    override createValidationContext(baseProperty?: string): ValidationContext {
        const baseContext: ValidationContext = super.createValidationContext(baseProperty);

        baseContext.validation.push({ key: 'mappedRangeBounds', validators: [BoundedIncreasingValidator()]});
		baseContext.validation.push({ key: 'mappedRangeBoundsType', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'UpperBoundType'))] });
		baseContext.validation.push({ key: 'mappedRangeBoundsValue', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Value'))] });
		return baseContext;
    }
}

export class PercentageRankingProfileModel extends BaseRankingProfileModel implements PercentageRankingProfilePersist {
    mappedRangeBounds: BoundedType<number>[];

    public fromModel(item: PercentageRankingProfile): PercentageRankingProfileModel {
        super.fromModel(item as BaseRankingProfile);
        this.mappedRangeBounds = item.mappedRangeBounds;

        return this;
    }

    override buildForm(context: ValidationContext, baseProperty: string, disabled: boolean, validationErrorModel: ValidationErrorModel): FormGroup {
        if (context == null) { context = this.createValidationContext(baseProperty); }

		const boundsFormArray = new FormArray([], context.getValidation('mappedRangeBounds').validators );
        var group = this.getGroup(context, baseProperty, disabled, validationErrorModel);

        if(this.mappedRangeBounds) {
            this.mappedRangeBounds.forEach((element, index) => {
                boundsFormArray.push(this.formBuilder.group({
                    upperBoundType: [{value: element.upperBoundType, disabled: disabled}, context.getValidation('mappedRangeBoundsType').validators ],
					value: [{value: element.value, disabled: disabled}, context.getValidation('mappedRangeBoundsValue').validators ]
                }))
            })
        }

        if(disabled) boundsFormArray.disable();
        group['mappedRangeBounds'] = boundsFormArray;

        return this.formBuilder.group(group);
    }

    override createValidationContext(baseProperty?: string): ValidationContext {
        const baseContext: ValidationContext = super.createValidationContext(baseProperty);

        baseContext.validation.push({ key: 'mappedRangeBounds', validators: [BoundedIncreasingValidator()]});
		baseContext.validation.push({ key: 'mappedRangeBoundsType', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'UpperBoundType'))] });
		baseContext.validation.push({ key: 'mappedRangeBoundsValue', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Value'))] });
		return baseContext;
    }
}

export class ScaleRankingProfileModel extends BaseRankingProfileModel implements ScaleRankingProfilePersist {
    public fromModel(item: ScaleRankingProfile): ScaleRankingProfileModel {
        super.fromModel(item as BaseRankingProfile);

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

export class SelectionRankingProfileModel extends BaseRankingProfileModel implements SelectionRankingProfilePersist {
    public fromModel(item: SelectionRankingProfile): SelectionRankingProfileModel {
        super.fromModel(item as BaseRankingProfile);

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

export class RankingConfigurationModel implements RankingConfigurationPersist {
    rankingProfiles: BaseRankingProfileModel[];

    public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();
    protected formBuilder: FormBuilder = new FormBuilder();

    constructor() { }

    public fromModel(item: RankingConfiguration): RankingConfigurationModel {
        if (item && item.rankingProfiles) {
            this.rankingProfiles = item.rankingProfiles.map(x => {
                switch(x.profileType) {
                    case RankingProfileType.AbsoluteDecimalRankingProfile:
                        return new AbsoluteDecimalRankingProfileModel().fromModel(x as AbsoluteDecimalRankingProfile);
                    case RankingProfileType.AbsoluteIntegerRankingProfile:
                        return new AbsoluteIntegerRankingProfileModel().fromModel(x as AbsoluteIntegerRankingProfile);
                    case RankingProfileType.PercentageRankingProfile:
                        return new PercentageRankingProfileModel().fromModel(x as PercentageRankingProfile);
                    case RankingProfileType.ScaleRankingProfile:
                        return new ScaleRankingProfileModel().fromModel(x as ScaleRankingProfile);
                    case RankingProfileType.SelectionRankingProfile:
                        return new SelectionRankingProfileModel().fromModel(x as SelectionRankingProfile);
                }
            })
        }
        return this;
    }

    buildForm(context: ValidationContext = null, disabled: boolean = false): FormGroup {
        if (context == null) { context = this.createValidationContext(); }

        const detailsFormArray = new Array<FormGroup>();

        if (this.rankingProfiles) {
            this.rankingProfiles.forEach((element, index) => {
                detailsFormArray.push(this.buildProfileForm(element, disabled));
            })
        }

        return this.formBuilder.group({
            rankingProfiles: this.formBuilder.array(detailsFormArray),
        })
    }

    createValidationContext(): ValidationContext {
        const baseContext: ValidationContext = new ValidationContext();
        
        return baseContext;
    }

    buildProfileForm(detail: BaseRankingProfileModel, disabled: boolean = false): FormGroup {
        return detail.buildForm(null, `BaseRankingProfile`, disabled, this.validationErrorModel);
    }
}

export class DataObjectTypeRankingMethodologyEditorModel extends BaseEditorModel implements DataObjectTypeRankingMethodologyPersist
{
    name: string;
    dataObjectTypeId: Guid;
    config: RankingConfigurationModel;

    public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();
    protected formBuilder: FormBuilder = new FormBuilder();

    constructor() {
        super();
    }

    public fromModel(item: DataObjectTypeRankingMethodology): DataObjectTypeRankingMethodologyEditorModel {
        if (item) {
            super.fromModel(item);
            this.name = item.name;
            if(item.config) this.config = new RankingConfigurationModel().fromModel(item.config);
        }
        return this;
    }

    buildForm(context: ValidationContext = null, disabled: boolean = false): FormGroup {
        if (context == null) { context = this.createValidationContext(); }

        var form = this.formBuilder.group({
            id: [{ value: this.id, disabled: disabled }, context.getValidation('id').validators],
			name: [{ value: this.name, disabled: disabled }, context.getValidation('name').validators],
            dataObjectTypeId: [{ value: this.dataObjectTypeId, disabled: disabled }, context.getValidation('dataObjectTypeId').validators],
			config: this.buildRankingConfigurationForm(this.config ? this.config : new RankingConfigurationModel(), disabled),
			hash: [{ value: this.hash, disabled: disabled }, context.getValidation('hash').validators],
        });
        return form;
    }

    createValidationContext(): ValidationContext {
        const baseContext: ValidationContext = new ValidationContext();
        const baseValidationArray: Validation[] = new Array<Validation>();
        baseValidationArray.push({ key: 'id', validators: [BackendErrorValidator(this.validationErrorModel, 'Id')] });
        baseValidationArray.push({ key: 'name', validators: [Validators.required, Validators.maxLength(250), BackendErrorValidator(this.validationErrorModel, 'Name')] });
        baseValidationArray.push({ key: 'dataObjectTypeId', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'DataObjectTypeId')] });
        baseValidationArray.push({ key: 'hash', validators: [BackendErrorValidator(this.validationErrorModel, 'Hash')] });

        baseContext.validation = baseValidationArray;
        return baseContext;
    }

    buildRankingConfigurationForm(config: RankingConfigurationModel, disabled: boolean = false): FormGroup {
        return config.buildForm(null, disabled);
    }
}