import { Injectable } from '@angular/core';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { BaseHttpService } from '@common/base/base-http.service';
import { IdpServiceAccount } from '@idp-service/core/model/principal.model';
import { Observable } from 'rxjs';

@Injectable()
export class PrincipalService {

	private get apiBase(): string { return `${this.installationConfiguration.idpServiceAddress}api/idp/principal`; }

	constructor(
		private installationConfiguration: InstallationConfigurationService,
		private http: BaseHttpService
	) { }

	public me(options?: Object): Observable<IdpServiceAccount> {
		const url = `${this.apiBase}/me`;
		return this.http.get<IdpServiceAccount>(url, options);
	}
}
