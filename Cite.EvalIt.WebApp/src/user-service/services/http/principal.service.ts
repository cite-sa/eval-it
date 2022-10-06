import { Injectable } from '@angular/core';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { BaseHttpService } from '@common/base/base-http.service';
import { UserServiceAccount } from '@user-service/core/model/principal.model';
import { Observable } from 'rxjs';

@Injectable()
export class PrincipalService {

	private get apiBase(): string { return `${this.installationConfiguration.userServiceAddress}api/user/principal`; }

	constructor(
		private installationConfiguration: InstallationConfigurationService,
		private http: BaseHttpService
	) { }

	public me(options?: Object): Observable<UserServiceAccount> {
		const url = `${this.apiBase}/me`;
		return this.http.get<UserServiceAccount>(url, options);
	}
}
