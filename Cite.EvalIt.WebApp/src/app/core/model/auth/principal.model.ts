import { AppPermission } from '@app/core/enum/permission.enum';

export interface AppAccount {
	isAuthenticated: boolean;
	permissions: AppPermission[];
}

