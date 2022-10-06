import { TagType } from "@app/core/enum/tag-type.enum";

export class DataObjectTagClientLookup implements DataObjectTagFilter {
	pageOffset: number;
	pageSize: number;
	like: string;
	tagType: TagType[];
}

export interface DataObjectTagFilter {
	like: string; 
	tagType: TagType[];
}
