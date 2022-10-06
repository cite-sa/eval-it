import { RegistrationInformationType } from "@app/core/enum/registration-information-type.enum";
import { ScaleDisplayOption } from "@app/core/enum/scale-display-option.enum";
import { InputScaleValueData, InputSelectionOptionsData } from "@app/core/model/data-object-type/data-object-type.model";
import { BoundedType } from "@app/core/model/data-object-type/ranking-methodology.model";
import { Guid } from "@common/types/guid";
import { IsActive } from "@idp-service/core/enum/is-active.enum";


export interface RegistrationInformation {
	inputOptions: RegistrationInformationInputOption[];
}

export interface RegistrationInformationInputOption {
	optionId?: Guid;
	label: string;
	isMandatory: boolean;
	multiValue: boolean;
    optionType: RegistrationInformationType;
    isActive: IsActive;
}

export interface AbsoluteIntegerInputOption extends RegistrationInformationInputOption {
    upperBound: BoundedType<number>;
    lowerBound: BoundedType<number>;
    measurementUnit: string;
    validationRegexp: string;
}

export interface AbsoluteDecimalInputOption extends RegistrationInformationInputOption {
    upperBound: BoundedType<number>;
    lowerBound: BoundedType<number>;
    measurementUnit: string;
    validationRegexp: string;
}

export interface PercentageInputOption extends RegistrationInformationInputOption {
    upperBound: BoundedType<number>;
    lowerBound: BoundedType<number>;
	validationRegexp: string;
}

export interface TextInputOption extends RegistrationInformationInputOption {
	validationRegexp: string;
}

export interface ScaleInputOption extends RegistrationInformationInputOption {
    scaleDisplayOption: ScaleDisplayOption;
    inputScale: InputScaleValueData[];
}

export interface SelectionInputOption extends RegistrationInformationInputOption {
    inputSelectionOptions: InputSelectionOptionsData[];
}



export interface RegistrationInformationPersist {
    inputOptions: RegistrationInformationInputOptionPersist[];
}

export interface RegistrationInformationInputOptionPersist {
    optionId?: Guid;
	label: string;
	isMandatory: boolean;
	multiValue: boolean;
    optionType: RegistrationInformationType;
    isActive: IsActive;
}

export interface AbsoluteIntegerInputOptionPersist extends RegistrationInformationInputOptionPersist {
    upperBound: BoundedType<number>;
    lowerBound: BoundedType<number>;
    measurementUnit: string;
    validationRegexp: string;
}

export interface AbsoluteDecimalInputOptionPersist extends RegistrationInformationInputOptionPersist {
    upperBound: BoundedType<number>;
    lowerBound: BoundedType<number>;
    measurementUnit: string;
    validationRegexp: string;
}

export interface PercentageInputOptionPersist extends RegistrationInformationInputOptionPersist {
    upperBound: BoundedType<number>;
    lowerBound: BoundedType<number>;
	validationRegexp: string;
}

export interface TextInputOptionPersist extends RegistrationInformationInputOptionPersist {
	validationRegexp: string;
}

export interface ScaleInputOptionPersist extends RegistrationInformationInputOptionPersist {
    scaleDisplayOption: ScaleDisplayOption;
    inputScale: InputScaleValueData[];
}

export interface SelectionInputOptionPersist extends RegistrationInformationInputOptionPersist {
    inputSelectionOptions: InputSelectionOptionsData[];
}