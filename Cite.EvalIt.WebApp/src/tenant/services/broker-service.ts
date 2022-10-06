import { Injectable } from '@angular/core';
import { BaseHttpService } from '@common/base/base-http.service';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TenantLocator } from 'tenant/core/model/tenant-locator';

@Injectable()
export class BrokerService {

	private get apiBase(): string { return `${this.installationConfiguration.adminServiceAddress}api/admin/broker`; }

	constructor(
		private installationConfiguration: InstallationConfigurationService,
		private http: BaseHttpService) { }

	get(code: string): Observable<TenantLocator> {
		const url = `${this.apiBase}/${code}`;
		const options = { params: {} };

		return this.http
			.get<TenantLocator>(url, options).pipe(
				catchError((error: any) => throwError(error)));
	}
}
