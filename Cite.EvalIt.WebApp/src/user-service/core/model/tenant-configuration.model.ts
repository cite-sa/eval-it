import { Guid } from '@common/types/guid';
import { TenantConfigurationType } from '@user-service/core/enum/tenant-configuration-type.enum';

export interface TenantConfiguration {
	id?: Guid;
	type: TenantConfigurationType;
	value: string;
	defaultUserLocaleData: DefaultUserLocaleConfigurationDataContainer;
	createdAt?: Date;
	updatedAt?: Date;
	hash: string;
}

export interface DefaultUserLocaleConfigurationDataContainer {
	timezone: string;
	language: string;
	culture: string;
}


export interface TenantConfigurationUserLocalePersist {
	id?: Guid;
	hash: string;
	timezone: string;
	language: string;
	culture: string;
}

