import { Lookup } from '@common/model/lookup';
import { Guid } from '@common/types/guid';
import { TenantConfigurationType } from '@user-service/core/enum/tenant-configuration-type.enum';

export class TenantConfigurationLookup extends Lookup implements TenantConfigurationFilter {
	ids?: Guid[];
	excludedIds?: Guid[];
	type?: TenantConfigurationType[];

	constructor() {
		super();
	}
}

export interface TenantConfigurationFilter {
	ids?: Guid[];
	excludedIds?: Guid[];
	type?: TenantConfigurationType[];
}
