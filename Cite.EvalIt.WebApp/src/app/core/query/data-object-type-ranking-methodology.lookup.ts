import { IsActive } from "@app/core/enum/is-active.enum";

export class DataObjectTypeRankingMethodologyClientLookup implements DataObjectTypeRankingMethodologyFilter {
	pageOffset: number;
	pageSize: number;
	like: string;
	isActive: IsActive[];
}

export interface DataObjectTypeRankingMethodologyFilter {
	like: string;
	isActive: IsActive[];
}
