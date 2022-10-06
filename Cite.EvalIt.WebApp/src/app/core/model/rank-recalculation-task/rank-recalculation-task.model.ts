import { RankRecalculationTaskStatus } from '@app/core/enum/rank-recalculation-task-status.enum';
import { AppUser } from '@app/core/model/app-user/app-user.model';
import { BaseEntity } from '@common/base/base-entity.model';
import { Guid } from '@common/types/guid';

export interface RankRecalculationTask extends BaseEntity  {
	reviewRankingsToCalculate: number;
	successfulReviewRankings: number;
	failedReviewRankings: number;
	objectRankingsToCalculate: number;
	successfulObjectRankings: number;
	failedObjectRankings: number;
	requestingUserId: Guid;
	user: AppUser;
	taskStatus: RankRecalculationTaskStatus;
	finishedAt?: Date;
}