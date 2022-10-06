import { DataObjectAttributeType } from "@app/core/enum/data-object-attribute-type.enum";
import { Guid } from "@common/types/guid";

export interface DataObjectAttributeData {
    attributes: DataObjectAttribute[];
}

export interface DataObjectAttribute {
    optionId: Guid;
    attributeType: DataObjectAttributeType;
}



export interface AbsoluteIntegerAttribute extends DataObjectAttribute {
    values: number[];
}

export interface AbsoluteDecimalAttribute extends DataObjectAttribute {
    values: number[];
}

export interface PercentageAttribute extends DataObjectAttribute {
    values: number[];
}

export interface TextAttribute extends DataObjectAttribute {
    values: string[];
}

export interface ScaleAttribute extends DataObjectAttribute {
    values: number[];
}

export interface SelectionAttribute extends DataObjectAttribute {
    values: number[];
}



export interface DataObjectAttributeDataPersist {
    attributes: DataObjectAttributePersist[];
}

export interface DataObjectAttributePersist {
    optionId: Guid;
    attributeType: DataObjectAttributeType;
}



export interface AbsoluteIntegerAttributePersist extends DataObjectAttributePersist {
    values: number[];
}

export interface AbsoluteDecimalAttributePersist extends DataObjectAttributePersist {
    values: number[];
}

export interface PercentageAttributePersist extends DataObjectAttributePersist {
    values: number[];
}

export interface TextAttributePersist extends DataObjectAttributePersist {
    values: string[];
}

export interface ScaleAttributePersist extends DataObjectAttributePersist {
    values: number[];
}

export interface SelectionAttributePersist extends DataObjectAttributePersist {
    values: number[];
}