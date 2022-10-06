
import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { BaseHttpService } from '@common/base/base-http.service';
import { Guid } from '@common/types/guid';
import { RegistrationInvitationDecline, RegistrationInvitationPersist } from '@idp-service/core/model/registration-invitation.model';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class InvitationService {

	private get apiBase(): string { return `${this.installationConfiguration.idpServiceAddress}api/idp/invitation`; }

	constructor(
		private installationConfiguration: InstallationConfigurationService,
		private http: BaseHttpService
	) { }

	submit(item: RegistrationInvitationPersist): Observable<number> {
		const url = `${this.apiBase}/submit`;

		return this.http
			.post<number>(url, item).pipe(
				catchError((error: any) => throwError(error)));
	}

	submitAll(item: RegistrationInvitationPersist[]): Observable<number> {
		const url = `${this.apiBase}/submit-all`;

		return this.http
			.post<number>(url, item).pipe(
				catchError((error: any) => throwError(error)));
	}

	decline(item: RegistrationInvitationDecline, tenantId: Guid): Observable<any> {
		const url = `${this.apiBase}/decline`;

		let headers = new HttpHeaders();
		if (this.installationConfiguration.isMultitenant) {
			headers = headers.set(this.installationConfiguration.authTenantHeader, tenantId.toString());
		}

		return this.http
			.post<any>(url, item, { headers: headers }).pipe(
				catchError((error: any) => throwError(error)));
	}
}
