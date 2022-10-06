import { EvaluationConfigurationType } from "@app/core/enum/evaluation-configuration-type.enum";
import { IsActive } from "@app/core/enum/is-active.enum";
import { ScaleDisplayOption } from "@app/core/enum/scale-display-option.enum";
import { EvaluationScaleValueData, EvaluationSelectionOptionsData } from "@app/core/model/data-object-type/data-object-type.model";
import { BoundedType } from "@app/core/model/data-object-type/ranking-methodology.model";
import { Guid } from "@common/types/guid";


export interface EvaluationConfiguration {
	evalOptions: BaseEvaluationOption[];
}

export interface BaseEvaluationOption {
	optionId?: Guid;
	label: string;
	isMandatory: boolean;
    optionType: EvaluationConfigurationType;
    isActive: IsActive;
}



export interface AbsoluteIntegerEvaluationOption extends BaseEvaluationOption {
    upperBound: BoundedType<number>;
    lowerBound: BoundedType<number>;
    measurementUnit: string;
}

export interface AbsoluteDecimalEvaluationOption extends BaseEvaluationOption {
    upperBound: BoundedType<number>;
    lowerBound: BoundedType<number>;
    measurementUnit: string;
}

export interface PercentageEvaluationOption extends BaseEvaluationOption {
    upperBound: BoundedType<number>;
    lowerBound: BoundedType<number>;
}

export interface TextEvaluationOption extends BaseEvaluationOption {
}

export interface ScaleEvaluationOption extends BaseEvaluationOption {
    scaleDisplayOption: ScaleDisplayOption;
    evaluationScale: EvaluationScaleValueData[];
}

export interface SelectionEvaluationOption extends BaseEvaluationOption {
    evaluationSelectionOptions: EvaluationSelectionOptionsData[];
}



export interface EvaluationConfigurationPersist {
	evalOptions: BaseEvaluationOptionPersist[];
}

export interface BaseEvaluationOptionPersist {
	optionId?: Guid;
	label: string;
	isMandatory: boolean;
    optionType: EvaluationConfigurationType;
    isActive: IsActive;
}



export interface AbsoluteIntegerEvaluationOptionPersist extends BaseEvaluationOptionPersist {
    upperBound: BoundedType<number>;
    lowerBound: BoundedType<number>;
    measurementUnit: string;
}

export interface AbsoluteDecimalEvaluationOptionPersist extends BaseEvaluationOptionPersist {
    upperBound: BoundedType<number>;
    lowerBound: BoundedType<number>;
    measurementUnit: string;
}

export interface PercentageEvaluationOptionPersist extends BaseEvaluationOptionPersist {
    upperBound: BoundedType<number>;
    lowerBound: BoundedType<number>;
}

export interface TextEvaluationOptionPersist extends BaseEvaluationOptionPersist {
}

export interface ScaleEvaluationOptionPersist extends BaseEvaluationOptionPersist {
    scaleDisplayOption: ScaleDisplayOption;
    evaluationScale: EvaluationScaleValueData[];
}

export interface SelectionEvaluationOptionPersist extends BaseEvaluationOptionPersist {
    evaluationSelectionOptions: EvaluationSelectionOptionsData[];
}