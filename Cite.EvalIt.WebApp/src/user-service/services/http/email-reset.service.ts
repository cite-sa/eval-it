import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseHttpService } from '@common/base/base-http.service';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { Guid } from '@common/types/guid';
import { EmailResetRequest, ResetUserEmail, UserEmailResetDecline } from '@user-service/core/model/email-reset.model';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class EmailResetService {

	private get apiBase(): string { return `${this.installationConfiguration.userServiceAddress}api/user/email-reset`; }

	constructor(
		private installationConfiguration: InstallationConfigurationService,
		private http: BaseHttpService
	) { }

	emailResetRequest(item: EmailResetRequest, totp?: string): Observable<number> {
		const url = `${this.apiBase}/request`;

		let headers = new HttpHeaders();
		if (totp) { headers = headers.set(this.installationConfiguration.authTotpHeader, totp); }

		return this.http
			.post<number>(url, item, headers ? { headers: headers } : undefined).pipe(
				catchError((error: any) => throwError(error)));
	}

	resetEmail(item: ResetUserEmail): Observable<void> {
		const url = `${this.apiBase}/reset`;

		return this.http
			.post<void>(url, item).pipe(
				catchError((error: any) => throwError(error)));
	}

	decline(item: UserEmailResetDecline, tenantId: Guid): Observable<void> {
		const url = `${this.apiBase}/decline`;

		let headers = new HttpHeaders();
		if (this.installationConfiguration.isMultitenant) {
			headers = headers.set(this.installationConfiguration.authTenantHeader, tenantId.toString());
		}

		return this.http
			.post<void>(url, item, { headers: headers }).pipe(
				catchError((error: any) => throwError(error)));
	}
}
