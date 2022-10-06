import { IsActive } from '@app/core/enum/is-active.enum';
import { RankRecalculationTaskStatus } from '@app/core/enum/rank-recalculation-task-status.enum';
import { Lookup } from '@common/model/lookup';
import { Guid } from '@common/types/guid';

export class RankRecalculationTaskLookup extends Lookup implements RankRecalculationTaskFilter {
	ids: Guid[];
	excludedIds: Guid[];
	requestingUserIds: Guid[];
	taskStatuses: RankRecalculationTaskStatus[];
	isActive: IsActive[];
	createdAfter?: Date;

	constructor() {
		super();
	}
}

export interface RankRecalculationTaskFilter {
	ids: Guid[];
	excludedIds: Guid[];
	requestingUserIds: Guid[];
	taskStatuses: RankRecalculationTaskStatus[];
	isActive: IsActive[];
	createdAfter?: Date;
}
