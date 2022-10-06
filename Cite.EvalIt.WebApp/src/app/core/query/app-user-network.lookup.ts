import { UserNetworkRelationship } from "@app/core/enum/user-network-relationship.enum";

export class AppUserNetworkClientLookup implements AppUserNetworkFilter {
	pageOffset: number;
	pageSize: number;
	like: string;
	relationship: UserNetworkRelationship[];
}

export interface AppUserNetworkFilter {
	like: string;
	relationship: UserNetworkRelationship[];
}
