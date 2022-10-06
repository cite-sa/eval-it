import { TagType } from "@app/core/enum/tag-type.enum";

export class AppUserTagClientLookup implements AppUserTagFilter {
	pageOffset: number;
	pageSize: number;
	like: string;
	tagType: TagType[];
}

export interface AppUserTagFilter {
	like: string;
	tagType: TagType[];
}
