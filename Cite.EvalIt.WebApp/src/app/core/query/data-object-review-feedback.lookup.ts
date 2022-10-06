import { IsActive } from "@app/core/enum/is-active.enum";
import { Lookup } from "@common/model/lookup";
import { Guid } from "@common/types/guid";

export class DataObjectReviewFeedbackLookup extends Lookup implements DataObjectReviewFilter {
	ids: Guid[];
	excludedIds: Guid[];
	reviewIds: Guid[];
	objectIds: Guid[];
	userIds: Guid[];
	isActive: IsActive[];

	constructor() {
		super();
	}
}

export interface DataObjectReviewFilter {
	ids: Guid[];
	excludedIds: Guid[];
	reviewIds: Guid[];
	objectIds: Guid[];
	userIds: Guid[];
	isActive: IsActive[];
}
