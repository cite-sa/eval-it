import { IsActive } from "@app/core/enum/is-active.enum";
import { ReviewAnonymity } from "@app/core/enum/review-anonymity.enum";
import { Lookup } from "@common/model/lookup";
import { Guid } from "@common/types/guid";

export class DataObjectReviewLookup extends Lookup implements DataObjectReviewFilter {
	ids: Guid[];
	excludedIds: Guid[];
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
	objectIds: Guid[];
	userIds: Guid[];
	isActive: IsActive[];
}
