import { ReviewAnonymity } from "@app/core/enum/review-anonymity.enum";
import { ReviewVisibility } from "@app/core/enum/review-visibility.enum";
import { AppUser } from "@app/core/model/app-user/app-user.model";
import { DataObjectReview } from "@app/core/model/data-object/data-object-review.model";
import { BaseEntity, BaseEntityPersist } from "@common/base/base-entity.model";
import { Guid } from "@common/types/guid";

export interface DataObjectReviewFeedback extends BaseEntity  {
    anonymity: ReviewAnonymity;
    visibility: ReviewVisibility;
    userIdHash?: string;
    userId?: Guid;
    user: AppUser;
    dataObjectReviewId?: Guid;
    dataObjectReview: DataObjectReview;
    feedbackData: FeedbackData;
    canEdit: boolean;
    isMine: boolean;
}

export interface DataObjectReviewFeedbackPersist extends BaseEntityPersist {
    anonymity: ReviewAnonymity;
    visibility: ReviewVisibility;
    dataObjectId: Guid;
    dataObjectReviewId: Guid;
    userIdHash?: string;
    userId?: Guid;
    feedbackData: FeedbackData;
}

export interface FeedbackData {
    like: Boolean;
}

export interface FeedbackDataPersist {
    like: Boolean;
}