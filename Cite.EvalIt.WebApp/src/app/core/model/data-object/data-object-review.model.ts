import { ReviewAnonymity } from "@app/core/enum/review-anonymity.enum";
import { ReviewEvaluationType } from "@app/core/enum/review-evaluation-type.enum";
import { ReviewVisibility } from "@app/core/enum/review-visibility.enum";
import { AppUser } from "@app/core/model/app-user/app-user.model";
import { DataObjectType, DataObjectTypePersist } from "@app/core/model/data-object-type/data-object-type.model";
import { DataObject } from "@app/core/model/data-object/data-object.model";
import { BaseEntity, BaseEntityPersist } from "@common/base/base-entity.model";
import { Guid } from "@common/types/guid";

export interface DataObjectReview extends BaseEntity  {
    anonymity: ReviewAnonymity;
    visibility: ReviewVisibility;
    userIdHash?: string;
    userId?: Guid;
    user: AppUser;
    dataObjectId?: Guid;
    dataObject: DataObject;
    dataObjectType: DataObjectType;
    rankScore?: number;
    evaluationData: ReviewEvaluationData;
    canEdit: boolean;
    isMine: boolean;
}

export interface DataObjectReviewPersist extends BaseEntityPersist {
    anonymity: ReviewAnonymity;
    visibility: ReviewVisibility;
    dataObjectId: Guid;
    userIdHash?: string;
    userId?: Guid;
    dataObjectType: DataObjectTypePersist;
    evaluationData: ReviewEvaluationDataPersist;
}

export interface ReviewEvaluationData {
    evaluations: ReviewEvaluation[];
}

export interface ReviewEvaluation {
    optionId: Guid;
    evaluationType: ReviewEvaluationType;
}



export interface AbsoluteIntegerEvaluation extends ReviewEvaluation {
    values: number[];
}

export interface AbsoluteDecimalEvaluation extends ReviewEvaluation {
    values: number[];
}

export interface PercentageEvaluation extends ReviewEvaluation {
    values: number[];
}

export interface TextEvaluation extends ReviewEvaluation {
    values: string[];
}

export interface ScaleEvaluation extends ReviewEvaluation {
    values: number[];
}

export interface SelectionEvaluation extends ReviewEvaluation {
    values: number[];
}



export interface ReviewEvaluationDataPersist {
    evaluations: ReviewEvaluationPersist[];
}

export interface ReviewEvaluationPersist {
    optionId: Guid;
    evaluationType: ReviewEvaluationType;
}



export interface AbsoluteIntegerEvaluationPersist extends ReviewEvaluationPersist {
    values: number[];
}

export interface AbsoluteDecimalEvaluationPersist extends ReviewEvaluationPersist {
    values: number[];
}

export interface PercentageEvaluationPersist extends ReviewEvaluationPersist {
    values: number[];
}

export interface TextEvaluationPersist extends ReviewEvaluationPersist {
    values: string[];
}

export interface ScaleEvaluationPersist extends ReviewEvaluationPersist {
    values: number[];
}

export interface SelectionEvaluationPersist extends ReviewEvaluationPersist {
    values: number[];
}