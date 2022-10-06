import { FormArray, FormBuilder, FormGroup, ValidatorFn, Validators } from "@angular/forms";
import { ActivityTimeUnit } from "@app/core/enum/activity-time-unit.enum";
import { IsActive } from "@app/core/enum/is-active.enum";
import { ObjectRankRecalculationStrategyType } from "@app/core/enum/object-rank-recalculation-strategy-type.enum";
import { StrategyRangeInterpretation } from "@app/core/enum/strategy-range-interpretation.enum";
import { AllEqualObjectRankRecalculationStrategy, AllEqualObjectRankRecalculationStrategyPersist, AuthorActivityObjectRankRecalculationStrategy, AuthorActivityObjectRankRecalculationStrategyPersist, AuthorDisciplineVisibilityObjectRankRecalculationStrategy, AuthorDisciplineVisibilityObjectRankRecalculationStrategyPersist, BaseObjectRankRecalculationStrategy, LikedObjectRankRecalculationStrategy, LikedObjectRankRecalculationStrategyPersist, NetworkPopularityObjectRankRecalculationStrategy, NetworkPopularityObjectRankRecalculationStrategyPersist, NetworkTrustObjectRankRecalculationStrategy, NetworkTrustObjectRankRecalculationStrategyPersist, ObjectRankRecalculationStrategyConfiguration, ObjectRankRecalculationStrategyConfigurationPersist, RangePartition, ReviewDisciplineVisibilityObjectRankRecalculationStrategy, ReviewDisciplineVisibilityObjectRankRecalculationStrategyPersist } from "@app/core/model/data-object-type/object-rank-recalculation-strategy.model";
import { BoundedType } from "@app/core/model/data-object-type/ranking-methodology.model";
import { BackendErrorValidator, BoundedIncreasingValidator, IntegerValidator, NonZeroWeightSumValidator, PercentageLimitValidator, SignValidator } from "@common/forms/validation/custom-validator";
import { ValidationErrorModel } from "@common/forms/validation/error-model/validation-error-model";
import { Validation, ValidationContext } from "@common/forms/validation/validation-context";
import { Guid } from "@common/types/guid";

export class BaseObjectRankRecalculationStrategyModel {
    id?: Guid;
    strategyType: ObjectRankRecalculationStrategyType;
    strategyWeight: number;
    isActive: IsActive;
    
    public validationErrorModel : ValidationErrorModel = new ValidationErrorModel();
    protected formBuilder: FormBuilder = new FormBuilder();

    constructor() { }

    public fromModel(item: BaseObjectRankRecalculationStrategy): BaseObjectRankRecalculationStrategyModel {
        if (item) {
            this.id = item.id;
            this.strategyType = item.strategyType;
            this.strategyWeight = item.strategyWeight;
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

        return {
            id: [{ value: this.id, disabled: disabled }, context.getValidation('id').validators],
            strategyType: [{ value: this.strategyType, disabled: disabled }, context.getValidation('strategyType').validators],
            strategyWeight: [{ value: this.strategyWeight, disabled: disabled }, context.getValidation('strategyWeight').validators],
            isActive: [{ value: this.isActive, disabled: disabled }, context.getValidation('isActive').validators]
        };
    }

    createValidationContext(baseProperty?: string): ValidationContext {
        const baseContext: ValidationContext = new ValidationContext();
        const baseValidationArray: Validation[] = new Array<Validation>();
		baseValidationArray.push({ key: 'id', validators: [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Id'))] });
        baseValidationArray.push({ key: 'strategyType', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'StrategyType'))] });
		baseValidationArray.push({ key: 'strategyWeight', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'StrategyWeight'))] });
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

export class AllEqualObjectRankRecalculationStrategyModel extends BaseObjectRankRecalculationStrategyModel implements AllEqualObjectRankRecalculationStrategyPersist {

    public fromModel(item: AllEqualObjectRankRecalculationStrategy): AllEqualObjectRankRecalculationStrategyModel {
        super.fromModel(item as BaseObjectRankRecalculationStrategy);

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

export class LikedObjectRankRecalculationStrategyModel extends BaseObjectRankRecalculationStrategyModel implements LikedObjectRankRecalculationStrategyPersist {
    likePartition: RangePartition<number>;
    
    public fromModel(item: LikedObjectRankRecalculationStrategy): LikedObjectRankRecalculationStrategyModel {
        super.fromModel(item as BaseObjectRankRecalculationStrategy);
        this.likePartition = item.likePartition;

        return this;
    }

    override buildForm(context: ValidationContext, baseProperty: string, disabled: boolean, validationErrorModel: ValidationErrorModel): FormGroup {
        if (context == null) { context = this.createValidationContext(baseProperty); }

		const boundsFormArray = new FormArray([], context.getValidation('rangeBounds').validators );
        const likeUserValueArray = new FormArray([], context.getValidation('rangeValues').validators );

        var group = this.getGroup(context, baseProperty, disabled, validationErrorModel);

        if(this.likePartition?.rangeBounds) {
            this.likePartition.rangeBounds.forEach((element, index) => {
                boundsFormArray.push(this.formBuilder.group({
                    upperBoundType: [{value: element.upperBoundType, disabled: disabled}, context.getValidation('rangeBoundsType').validators ],
					value: [{value: element.value, disabled: disabled}, context.getValidation('rangeValue').validators ]
                }))
            })
        }

        if(this.likePartition?.rangeValues) {
            this.likePartition.rangeValues.forEach((element,index) => {
                likeUserValueArray.push(this.formBuilder.control({value: element, disabled: disabled}, context.getValidation('rangeValue').validators))
            })
        }

        if(likeUserValueArray.controls.length == 0) {
            likeUserValueArray.push(this.formBuilder.control({value: undefined, disabled: disabled}, context.getValidation('rangeValue').validators))
        }
        if(disabled) {
            boundsFormArray.disable();
        }

        var partitionGroup = { };

        partitionGroup['rangeBounds'] = boundsFormArray;
        partitionGroup['rangeInterpretation'] = [{ value: this.likePartition?.rangeInterpretation, disabled: disabled }, context.getValidation('rangeInterpretation').validators];
        partitionGroup['rangeValues'] = likeUserValueArray;

        group['likePartition'] = this.formBuilder.group(partitionGroup, {validators: context.getValidation('strategyGroup').validators });

        return this.formBuilder.group(group);
    }

    override createValidationContext(baseProperty?: string): ValidationContext {
        const baseContext: ValidationContext = super.createValidationContext(baseProperty);

        baseContext.validation.push({ key: 'rangeBounds', validators: [BoundedIncreasingValidator()]});
		baseContext.validation.push({ key: 'rangeBoundsType', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'UpperBoundType'))] });
		baseContext.validation.push({ key: 'rangeBoundsValue', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Value'))] });
		baseContext.validation.push({ key: 'rangeValue', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'RangeValue'))] });
		baseContext.validation.push({ key: 'rangeValues', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'RangeValues'))] });
        baseContext.validation.push({ key: 'rangeInterpretation', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'RangeInterpretation'))] });
        baseContext.validation.push({ key: 'strategyGroup', validators: [PercentageLimitValidator(StrategyRangeInterpretation.Percentage, 'rangeInterpretation', 'rangeBounds')]});

        return baseContext;
    }
}

export class NetworkPopularityObjectRankRecalculationStrategyModel extends BaseObjectRankRecalculationStrategyModel implements NetworkPopularityObjectRankRecalculationStrategyPersist {
    networkPopularityPartition: RangePartition<number>;
    
    public fromModel(item: NetworkPopularityObjectRankRecalculationStrategy): NetworkPopularityObjectRankRecalculationStrategyModel {
        super.fromModel(item as BaseObjectRankRecalculationStrategy);
        this.networkPopularityPartition = item.networkPopularityPartition;

        return this;
    }

    override buildForm(context: ValidationContext, baseProperty: string, disabled: boolean, validationErrorModel: ValidationErrorModel): FormGroup {
        if (context == null) { context = this.createValidationContext(baseProperty); }

		const boundsFormArray = new FormArray([], context.getValidation('rangeBounds').validators );
        const likeUserValueArray = new FormArray([], context.getValidation('rangeValues').validators );

        var group = this.getGroup(context, baseProperty, disabled, validationErrorModel);

        if(this.networkPopularityPartition?.rangeBounds) {
            this.networkPopularityPartition.rangeBounds.forEach((element, index) => {
                boundsFormArray.push(this.formBuilder.group({
                    upperBoundType: [{value: element.upperBoundType, disabled: disabled}, context.getValidation('rangeBoundsType').validators ],
					value: [{value: element.value, disabled: disabled}, context.getValidation('rangeValue').validators ]
                }))
            })
        }

        if(this.networkPopularityPartition?.rangeValues) {
            this.networkPopularityPartition.rangeValues.forEach((element,index) => {
                likeUserValueArray.push(this.formBuilder.control({value: element, disabled: disabled}, context.getValidation('rangeValue').validators))
            })
        }

        if(likeUserValueArray.controls.length == 0) {
            likeUserValueArray.push(this.formBuilder.control({value: undefined, disabled: disabled}, context.getValidation('rangeValue').validators))
        }
        if(disabled) {
            boundsFormArray.disable();
        }

        var partitionGroup = { };

        partitionGroup['rangeBounds'] = boundsFormArray;
        partitionGroup['rangeInterpretation'] = [{ value: this.networkPopularityPartition?.rangeInterpretation, disabled: disabled }, context.getValidation('rangeInterpretation').validators];
        partitionGroup['rangeValues'] = likeUserValueArray;

        group['networkPopularityPartition'] = this.formBuilder.group(partitionGroup, {validators: context.getValidation('strategyGroup').validators });

        return this.formBuilder.group(group);
    }

    override createValidationContext(baseProperty?: string): ValidationContext {
        const baseContext: ValidationContext = super.createValidationContext(baseProperty);

        baseContext.validation.push({ key: 'rangeBounds', validators: [BoundedIncreasingValidator()]});
		baseContext.validation.push({ key: 'rangeBoundsType', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'UpperBoundType'))] });
		baseContext.validation.push({ key: 'rangeBoundsValue', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Value'))] });
		baseContext.validation.push({ key: 'rangeValue', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'RangeValue'))] });
		baseContext.validation.push({ key: 'rangeValues', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'RangeValues'))] });
        baseContext.validation.push({ key: 'rangeInterpretation', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'RangeInterpretation'))] });
        baseContext.validation.push({ key: 'strategyGroup', validators: [PercentageLimitValidator(StrategyRangeInterpretation.Percentage, 'rangeInterpretation', 'rangeBounds')]});

        return baseContext;
    }
}

export class NetworkTrustObjectRankRecalculationStrategyModel extends BaseObjectRankRecalculationStrategyModel implements NetworkTrustObjectRankRecalculationStrategyPersist {
    networkTrustPartition: RangePartition<number>;
    
    public fromModel(item: NetworkTrustObjectRankRecalculationStrategy): NetworkTrustObjectRankRecalculationStrategyModel {
        super.fromModel(item as BaseObjectRankRecalculationStrategy);
        this.networkTrustPartition = item.networkTrustPartition;

        return this;
    }

    override buildForm(context: ValidationContext, baseProperty: string, disabled: boolean, validationErrorModel: ValidationErrorModel): FormGroup {
        if (context == null) { context = this.createValidationContext(baseProperty); }

		const boundsFormArray = new FormArray([], context.getValidation('rangeBounds').validators );
        const likeUserValueArray = new FormArray([], context.getValidation('rangeValues').validators );

        var group = this.getGroup(context, baseProperty, disabled, validationErrorModel);

        if(this.networkTrustPartition?.rangeBounds) {
            this.networkTrustPartition.rangeBounds.forEach((element, index) => {
                boundsFormArray.push(this.formBuilder.group({
                    upperBoundType: [{value: element.upperBoundType, disabled: disabled}, context.getValidation('rangeBoundsType').validators ],
					value: [{value: element.value, disabled: disabled}, context.getValidation('rangeValue').validators ]
                }))
            })
        }

        if(this.networkTrustPartition?.rangeValues) {
            this.networkTrustPartition.rangeValues.forEach((element,index) => {
                likeUserValueArray.push(this.formBuilder.control({value: element, disabled: disabled}, context.getValidation('rangeValue').validators))
            })
        }

        if(likeUserValueArray.controls.length == 0) {
            likeUserValueArray.push(this.formBuilder.control({value: undefined, disabled: disabled}, context.getValidation('rangeValue').validators))
        }
        if(disabled) {
            boundsFormArray.disable();
        }

        var partitionGroup = { };

        partitionGroup['rangeBounds'] = boundsFormArray;
        partitionGroup['rangeInterpretation'] = [{ value: this.networkTrustPartition?.rangeInterpretation, disabled: disabled }, context.getValidation('rangeInterpretation').validators];
        partitionGroup['rangeValues'] = likeUserValueArray;

        group['networkTrustPartition'] = this.formBuilder.group(partitionGroup, {validators: context.getValidation('strategyGroup').validators });

        return this.formBuilder.group(group);
    }

    override createValidationContext(baseProperty?: string): ValidationContext {
        const baseContext: ValidationContext = super.createValidationContext(baseProperty);

        baseContext.validation.push({ key: 'rangeBounds', validators: [BoundedIncreasingValidator()]});
		baseContext.validation.push({ key: 'rangeBoundsType', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'UpperBoundType'))] });
		baseContext.validation.push({ key: 'rangeBoundsValue', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Value'))] });
		baseContext.validation.push({ key: 'rangeValue', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'RangeValue'))] });
		baseContext.validation.push({ key: 'rangeValues', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'RangeValues'))] });
        baseContext.validation.push({ key: 'rangeInterpretation', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'RangeInterpretation'))] });
        baseContext.validation.push({ key: 'strategyGroup', validators: [PercentageLimitValidator(StrategyRangeInterpretation.Percentage, 'rangeInterpretation', 'rangeBounds')]});

        return baseContext;
    }
}

export class ReviewDisciplineVisibilityObjectRankRecalculationStrategyModel extends BaseObjectRankRecalculationStrategyModel implements ReviewDisciplineVisibilityObjectRankRecalculationStrategyPersist {
    reviewDisciplinePartition: RangePartition<number>;
    
    public fromModel(item: ReviewDisciplineVisibilityObjectRankRecalculationStrategy): ReviewDisciplineVisibilityObjectRankRecalculationStrategyModel {
        super.fromModel(item as BaseObjectRankRecalculationStrategy);
        this.reviewDisciplinePartition = item.reviewDisciplinePartition;

        return this;
    }

    override buildForm(context: ValidationContext, baseProperty: string, disabled: boolean, validationErrorModel: ValidationErrorModel): FormGroup {
        if (context == null) { context = this.createValidationContext(baseProperty); }

		const boundsFormArray = new FormArray([], context.getValidation('rangeBounds').validators );
        const likeUserValueArray = new FormArray([], context.getValidation('rangeValues').validators );

        var group = this.getGroup(context, baseProperty, disabled, validationErrorModel);

        if(this.reviewDisciplinePartition?.rangeBounds) {
            this.reviewDisciplinePartition.rangeBounds.forEach((element, index) => {
                boundsFormArray.push(this.formBuilder.group({
                    upperBoundType: [{value: element.upperBoundType, disabled: disabled}, context.getValidation('rangeBoundsType').validators ],
					value: [{value: element.value, disabled: disabled}, context.getValidation('rangeValue').validators ]
                }))
            })
        }

        if(this.reviewDisciplinePartition?.rangeValues) {
            this.reviewDisciplinePartition.rangeValues.forEach((element,index) => {
                likeUserValueArray.push(this.formBuilder.control({value: element, disabled: disabled}, context.getValidation('rangeValue').validators))
            })
        }

        if(likeUserValueArray.controls.length == 0) {
            likeUserValueArray.push(this.formBuilder.control({value: undefined, disabled: disabled}, context.getValidation('rangeValue').validators))
        }
        if(disabled) {
            boundsFormArray.disable();
        }

        var partitionGroup = { };

        partitionGroup['rangeBounds'] = boundsFormArray;
        partitionGroup['rangeInterpretation'] = [{ value: this.reviewDisciplinePartition?.rangeInterpretation, disabled: disabled }, context.getValidation('rangeInterpretation').validators];
        partitionGroup['rangeValues'] = likeUserValueArray;

        group['reviewDisciplinePartition'] = this.formBuilder.group(partitionGroup, {validators: context.getValidation('strategyGroup').validators });

        return this.formBuilder.group(group);
    }

    override createValidationContext(baseProperty?: string): ValidationContext {
        const baseContext: ValidationContext = super.createValidationContext(baseProperty);

        baseContext.validation.push({ key: 'rangeBounds', validators: [BoundedIncreasingValidator()]});
		baseContext.validation.push({ key: 'rangeBoundsType', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'UpperBoundType'))] });
		baseContext.validation.push({ key: 'rangeBoundsValue', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Value'))] });
		baseContext.validation.push({ key: 'rangeValue', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'RangeValue'))] });
		baseContext.validation.push({ key: 'rangeValues', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'RangeValues'))] });
        baseContext.validation.push({ key: 'rangeInterpretation', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'RangeInterpretation'))] });
        baseContext.validation.push({ key: 'strategyGroup', validators: [PercentageLimitValidator(StrategyRangeInterpretation.Percentage, 'rangeInterpretation', 'rangeBounds')]});

        return baseContext;
    }
}

export class AuthorDisciplineVisibilityObjectRankRecalculationStrategyModel extends BaseObjectRankRecalculationStrategyModel implements AuthorDisciplineVisibilityObjectRankRecalculationStrategyPersist {
    authorTrustDisciplinePartition: RangePartition<number>;
    authorFollowDisciplinePartition: RangePartition<number>;

    public fromModel(item: AuthorDisciplineVisibilityObjectRankRecalculationStrategy): AuthorDisciplineVisibilityObjectRankRecalculationStrategyModel {
        super.fromModel(item as BaseObjectRankRecalculationStrategy);
        this.authorTrustDisciplinePartition = item.authorTrustDisciplinePartition;
        this.authorFollowDisciplinePartition = item.authorFollowDisciplinePartition;

        return this;
    }

    override buildForm(context: ValidationContext, baseProperty: string, disabled: boolean, validationErrorModel: ValidationErrorModel): FormGroup {
        if (context == null) { context = this.createValidationContext(baseProperty); }

        const trustBoundsFormArray = new FormArray([], context.getValidation('trustRangeBounds').validators );
        const trustReviewLikeValueArray = new FormArray([], context.getValidation('trustRangeValues').validators );
        const followBoundsFormArray = new FormArray([], context.getValidation('followRangeBounds').validators );
        const followReviewLikeValueArray = new FormArray([], context.getValidation('followRangeValues').validators );

        var group = this.getGroup(context, baseProperty, disabled, validationErrorModel);

        
        if(this.authorTrustDisciplinePartition?.rangeBounds) {
            this.authorTrustDisciplinePartition.rangeBounds.forEach((element, index) => {
                trustBoundsFormArray.push(this.formBuilder.group({
                    upperBoundType: [{value: element.upperBoundType, disabled: disabled}, context.getValidation('trustRangeBoundsType').validators ],
					value: [{value: element.value, disabled: disabled}, context.getValidation('trustRangeValue').validators ]
                }))
            })
        }

        if(this.authorTrustDisciplinePartition?.rangeValues) {
            this.authorTrustDisciplinePartition.rangeValues.forEach((element,index) => {
                trustReviewLikeValueArray.push(this.formBuilder.control({value: element, disabled: disabled}, context.getValidation('trustRangeValue').validators))
            })
        }

        if(this.authorFollowDisciplinePartition?.rangeBounds) {
            this.authorFollowDisciplinePartition.rangeBounds.forEach((element, index) => {
                followBoundsFormArray.push(this.formBuilder.group({
                    upperBoundType: [{value: element.upperBoundType, disabled: disabled}, context.getValidation('followRangeBoundsType').validators ],
					value: [{value: element.value, disabled: disabled}, context.getValidation('followRangeValue').validators ]
                }))
            })
        }

        if(this.authorFollowDisciplinePartition?.rangeValues) {
            this.authorFollowDisciplinePartition.rangeValues.forEach((element,index) => {
                followReviewLikeValueArray.push(this.formBuilder.control({value: element, disabled: disabled}, context.getValidation('followRangeValue').validators))
            })
        }

        if(trustReviewLikeValueArray.controls.length == 0) {
            trustReviewLikeValueArray.push(this.formBuilder.control({value: undefined, disabled: disabled}, context.getValidation('trustRangeValue').validators))
        }
        if(disabled) {
            trustBoundsFormArray.disable();
        }

        if(followReviewLikeValueArray.controls.length == 0) {
            followReviewLikeValueArray.push(this.formBuilder.control({value: undefined, disabled: disabled}, context.getValidation('followRangeValue').validators))
        }
        if(disabled) {
            followBoundsFormArray.disable();
        } 

        var followPartitionGroup = { };

        followPartitionGroup['rangeBounds'] = followBoundsFormArray;
        followPartitionGroup['rangeInterpretation'] = [{ value: this.authorFollowDisciplinePartition?.rangeInterpretation, disabled: disabled }, context.getValidation('followRangeInterpretation').validators];
        followPartitionGroup['rangeValues'] = followReviewLikeValueArray;


        var trustPartitionGroup = { };

        trustPartitionGroup['rangeBounds'] = trustBoundsFormArray;
        trustPartitionGroup['rangeInterpretation'] = [{ value: this.authorTrustDisciplinePartition?.rangeInterpretation, disabled: disabled }, context.getValidation('trustRangeInterpretation').validators];
        trustPartitionGroup['rangeValues'] = trustReviewLikeValueArray;

        
        group['authorFollowDisciplinePartition'] = this.formBuilder.group(followPartitionGroup, {validators: context.getValidation('followStrategyGroup').validators });
        group['authorTrustDisciplinePartition'] = this.formBuilder.group(trustPartitionGroup, {validators: context.getValidation('trustStrategyGroup').validators });

        return this.formBuilder.group(group);
    }

    override createValidationContext(baseProperty?: string): ValidationContext {
        const baseContext: ValidationContext = super.createValidationContext(baseProperty);

        baseContext.validation.push({ key: 'followRangeBounds', validators: [BoundedIncreasingValidator()]});
		baseContext.validation.push({ key: 'followRangeBoundsType', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'UpperBoundType'))] });
		baseContext.validation.push({ key: 'followRangeBoundsValue', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Value'))] });
		baseContext.validation.push({ key: 'followRangeValue', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'RangeValue'))] });
		baseContext.validation.push({ key: 'followRangeValues', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'RangeValues'))] });
        baseContext.validation.push({ key: 'followRangeInterpretation', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'RangeInterpretation'))] });
        baseContext.validation.push({ key: 'followStrategyGroup', validators: [PercentageLimitValidator(StrategyRangeInterpretation.Percentage, 'rangeInterpretation', 'rangeBounds')]});

        baseContext.validation.push({ key: 'trustRangeBounds', validators: [BoundedIncreasingValidator()]});
		baseContext.validation.push({ key: 'trustRangeBoundsType', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'UpperBoundType'))] });
		baseContext.validation.push({ key: 'trustRangeBoundsValue', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Value'))] });
		baseContext.validation.push({ key: 'trustRangeValue', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'RangeValue'))] });
		baseContext.validation.push({ key: 'trustRangeValues', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'RangeValues'))] });
        baseContext.validation.push({ key: 'trustRangeInterpretation', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'RangeInterpretation'))] });
        baseContext.validation.push({ key: 'trustStrategyGroup', validators: [PercentageLimitValidator(StrategyRangeInterpretation.Percentage, 'rangeInterpretation', 'rangeBounds')]});

        return baseContext;
    }
}

export class AuthorActivityObjectRankRecalculationStrategyModel extends BaseObjectRankRecalculationStrategyModel implements AuthorActivityObjectRankRecalculationStrategyPersist {

    timeUnitCount: number;
    timeUnit: ActivityTimeUnit;

    authorObjectActivityPartition: RangePartition<number>;
    authorReviewActivityPartition: RangePartition<number>;

    public fromModel(item: AuthorActivityObjectRankRecalculationStrategy): AuthorActivityObjectRankRecalculationStrategyModel {
        super.fromModel(item as BaseObjectRankRecalculationStrategy);

        this.timeUnitCount = item.timeUnitCount;
        this.timeUnit = item.timeUnit;

        this.authorObjectActivityPartition = item.authorObjectActivityPartition;
        this.authorReviewActivityPartition = item.authorReviewActivityPartition;

        return this;
    }

    override buildForm(context: ValidationContext, baseProperty: string, disabled: boolean, validationErrorModel: ValidationErrorModel): FormGroup {
        if (context == null) { context = this.createValidationContext(baseProperty); }

        const objectBoundsFormArray = new FormArray([], context.getValidation('objectRangeBounds').validators );
        const objectReviewLikeValueArray = new FormArray([], context.getValidation('objectRangeValues').validators );
        const reviewBoundsFormArray = new FormArray([], context.getValidation('reviewRangeBounds').validators );
        const reviewReviewLikeValueArray = new FormArray([], context.getValidation('reviewRangeValues').validators );

        var group = this.getGroup(context, baseProperty, disabled, validationErrorModel);
        
        if(this.authorObjectActivityPartition?.rangeBounds) {
            this.authorObjectActivityPartition.rangeBounds.forEach((element, index) => {
                objectBoundsFormArray.push(this.formBuilder.group({
                    upperBoundType: [{value: element.upperBoundType, disabled: disabled}, context.getValidation('objectRangeBoundsType').validators ],
					value: [{value: element.value, disabled: disabled}, context.getValidation('objectRangeValue').validators ]
                }))
            })
        }

        if(this.authorObjectActivityPartition?.rangeValues) {
            this.authorObjectActivityPartition.rangeValues.forEach((element,index) => {
                objectReviewLikeValueArray.push(this.formBuilder.control({value: element, disabled: disabled}, context.getValidation('objectRangeValue').validators))
            })
        }

        if(this.authorReviewActivityPartition?.rangeBounds) {
            this.authorReviewActivityPartition.rangeBounds.forEach((element, index) => {
                reviewBoundsFormArray.push(this.formBuilder.group({
                    upperBoundType: [{value: element.upperBoundType, disabled: disabled}, context.getValidation('reviewRangeBoundsType').validators ],
					value: [{value: element.value, disabled: disabled}, context.getValidation('reviewRangeValue').validators ]
                }))
            })
        }

        if(this.authorReviewActivityPartition?.rangeValues) {
            this.authorReviewActivityPartition.rangeValues.forEach((element,index) => {
                reviewReviewLikeValueArray.push(this.formBuilder.control({value: element, disabled: disabled}, context.getValidation('reviewRangeValue').validators))
            })
        }

        if(objectReviewLikeValueArray.controls.length == 0) {
            objectReviewLikeValueArray.push(this.formBuilder.control({value: undefined, disabled: disabled}, context.getValidation('objectRangeValue').validators))
        }
        if(disabled) {
            objectBoundsFormArray.disable();
        }

        if(reviewReviewLikeValueArray.controls.length == 0) {
            reviewReviewLikeValueArray.push(this.formBuilder.control({value: undefined, disabled: disabled}, context.getValidation('reviewRangeValue').validators))
        }
        if(disabled) {
            reviewBoundsFormArray.disable();
        } 

        var objectPartitionGroup = { };

        objectPartitionGroup['rangeBounds'] = objectBoundsFormArray;
        objectPartitionGroup['rangeInterpretation'] = [{ value: this.authorObjectActivityPartition?.rangeInterpretation, disabled: disabled }, context.getValidation('objectRangeInterpretation').validators];
        objectPartitionGroup['rangeValues'] = objectReviewLikeValueArray;


        var reviewPartitionGroup = { };

        reviewPartitionGroup['rangeBounds'] = reviewBoundsFormArray;
        reviewPartitionGroup['rangeInterpretation'] = [{ value: this.authorReviewActivityPartition?.rangeInterpretation, disabled: disabled }, context.getValidation('reviewRangeInterpretation').validators];
        reviewPartitionGroup['rangeValues'] = reviewReviewLikeValueArray;

        
        group['authorObjectActivityPartition'] = this.formBuilder.group(objectPartitionGroup, {validators: context.getValidation('objectStrategyGroup').validators });
        group['authorReviewActivityPartition'] = this.formBuilder.group(reviewPartitionGroup, {validators: context.getValidation('reviewStrategyGroup').validators });

        group['timeUnit'] = [{ value: this.timeUnit, disabled: disabled }, context.getValidation('timeUnit').validators];
        group['timeUnitCount'] = [{ value: this.timeUnitCount, disabled: disabled }, context.getValidation('timeUnitCount').validators];

        return this.formBuilder.group(group);
    }

    override createValidationContext(baseProperty?: string): ValidationContext {
        const baseContext: ValidationContext = super.createValidationContext(baseProperty);

        baseContext.validation.push({ key: 'objectRangeBounds', validators: [BoundedIncreasingValidator()]});
		baseContext.validation.push({ key: 'objectRangeBoundsType', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'UpperBoundType'))] });
		baseContext.validation.push({ key: 'objectRangeBoundsValue', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Value'))] });
		baseContext.validation.push({ key: 'objectRangeValue', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'RangeValue'))] });
		baseContext.validation.push({ key: 'objectRangeValues', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'RangeValues'))] });
        baseContext.validation.push({ key: 'objectRangeInterpretation', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'RangeInterpretation'))] });
        baseContext.validation.push({ key: 'objectStrategyGroup', validators: [PercentageLimitValidator(StrategyRangeInterpretation.Percentage, 'rangeInterpretation', 'rangeBounds')]});

        baseContext.validation.push({ key: 'reviewRangeBounds', validators: [BoundedIncreasingValidator()]});
		baseContext.validation.push({ key: 'reviewRangeBoundsType', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'UpperBoundType'))] });
		baseContext.validation.push({ key: 'reviewRangeBoundsValue', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Value'))] });
		baseContext.validation.push({ key: 'reviewRangeValue', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'RangeValue'))] });
		baseContext.validation.push({ key: 'reviewRangeValues', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'RangeValues'))] });
        baseContext.validation.push({ key: 'reviewRangeInterpretation', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'RangeInterpretation'))] });
        baseContext.validation.push({ key: 'reviewStrategyGroup', validators: [PercentageLimitValidator(StrategyRangeInterpretation.Percentage, 'rangeInterpretation', 'rangeBounds')]});

        baseContext.validation.push({ key: 'timeUnit', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'TimeUnit'))] });
        baseContext.validation.push({ key: 'timeUnitCount', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'TimeUnitCount'))] });

        return baseContext;
    }
}


export class ObjectRankRecalculationStrategyConfigurationModel implements ObjectRankRecalculationStrategyConfigurationPersist {
    dataObjectTypeId: Guid;
    strategies: BaseObjectRankRecalculationStrategyModel[];

    public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();
    protected formBuilder: FormBuilder = new FormBuilder();

    constructor() { 
    }

    public fromModel(item: ObjectRankRecalculationStrategyConfiguration): ObjectRankRecalculationStrategyConfigurationModel {
        if (item && item.strategies) {
            this.strategies = item.strategies.map(x => {
                switch(x.strategyType) {
                    case ObjectRankRecalculationStrategyType.AllEqual:
                        return new AllEqualObjectRankRecalculationStrategyModel().fromModel(x as AllEqualObjectRankRecalculationStrategy);
                    case ObjectRankRecalculationStrategyType.Liked:
                        return new LikedObjectRankRecalculationStrategyModel().fromModel(x as LikedObjectRankRecalculationStrategy);
                    case ObjectRankRecalculationStrategyType.NetworkPopularity:
                        return new NetworkPopularityObjectRankRecalculationStrategyModel().fromModel(x as NetworkPopularityObjectRankRecalculationStrategy);
                    case ObjectRankRecalculationStrategyType.NetworkTrust:
                        return new NetworkTrustObjectRankRecalculationStrategyModel().fromModel(x as NetworkTrustObjectRankRecalculationStrategy);
                    case ObjectRankRecalculationStrategyType.ReviewDisciplineVisibility:
                        return new ReviewDisciplineVisibilityObjectRankRecalculationStrategyModel().fromModel(x as ReviewDisciplineVisibilityObjectRankRecalculationStrategy);
                    case ObjectRankRecalculationStrategyType.AuthorDisciplineVisibility:
                        return new AuthorDisciplineVisibilityObjectRankRecalculationStrategyModel().fromModel(x as AuthorDisciplineVisibilityObjectRankRecalculationStrategy);
                    case ObjectRankRecalculationStrategyType.AuthorActivity:
                        return new AuthorActivityObjectRankRecalculationStrategyModel().fromModel(x as AuthorActivityObjectRankRecalculationStrategy);
    
                    }
            })
        }
        return this;
    }

    buildForm(context: ValidationContext = null, disabled: boolean = false): FormGroup {
        if (context == null) { context = this.createValidationContext(); }

        const detailsFormArray = new Array<FormGroup>();

        if (this.strategies) {
            this.strategies.forEach((element, index) => {
                detailsFormArray.push(this.buildStrategyForm(element, disabled));
            })
        }

        return this.formBuilder.group({
            strategies: this.formBuilder.array(detailsFormArray, { validators : NonZeroWeightSumValidator() }),
        })
    }

    createValidationContext(): ValidationContext {
        const baseContext: ValidationContext = new ValidationContext();
        const baseValidationArray: Validation[] = new Array<Validation>();
        baseValidationArray.push({ key: 'id', validators: [BackendErrorValidator(this.validationErrorModel, 'Id')] });
        baseValidationArray.push({ key: 'dataObjectTypeId', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'DataObjectTypeId')] });
        baseValidationArray.push({ key: 'hash', validators: [BackendErrorValidator(this.validationErrorModel, 'Hash')] });
        
        baseContext.validation = baseValidationArray;
        return baseContext;
    }

    buildStrategyForm(detail: BaseObjectRankRecalculationStrategyModel, disabled: boolean = false): FormGroup {
        return detail.buildForm(null, `BaseObjectRankRecalculationStrategy`, disabled, this.validationErrorModel);
    }
}
