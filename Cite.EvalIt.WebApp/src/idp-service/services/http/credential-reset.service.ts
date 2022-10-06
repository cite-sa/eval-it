
import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseHttpService } from '@common/base/base-http.service';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { Guid } from '@common/types/guid';
import { OverrideUserPassCredential, ResetUserCredential, ResetUserCredentialDecline } from '@idp-service/core/model/user-credential.model';
import { CredentialResetRequest } from '@idp-service/core/model/user-recovery-info.model';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class CredentialResetService {

	private get apiBase(): string { return `${this.installationConfiguration.idpServiceAddress}api/idp/credential-reset`; }

	constructor(
		private installationConfiguration: InstallationConfigurationService,
		private http: BaseHttpService) { }

	request(item: CredentialResetRequest, tenantId: Guid): Observable<number> {
		const url = `${this.apiBase}/request`;

		let headers = new HttpHeaders();
		if (this.installationConfiguration.isMultitenant) {
			headers = headers.set(this.installationConfiguration.authTenantHeader, tenantId.toString());
		}

		return this.http
			.post<number>(url, item, { headers: headers }).pipe(
				catchError((error: any) => throwError(error)));
	}

	userPassOverride(item: OverrideUserPassCredential, totp?: string): Observable<void> {
		const url = `${this.apiBase}/user-pass/override`;

		let headers = new HttpHeaders();
		if (totp) { headers = headers.set(this.installationConfiguration.authTotpHeader, totp); }

		return this.http
			.post<void>(url, item, headers ? { headers: headers } : undefined).pipe(
				catchError((error: any) => throwError(error)));
	}

	resetProvider(item: ResetUserCredential, tenantId: Guid): Observable<void> {
		const url = `${this.apiBase}/provider/reset`;

		let headers = new HttpHeaders();
		if (this.installationConfiguration.isMultitenant) {
			headers = headers.set(this.installationConfiguration.authTenantHeader, tenantId.toString());
		}
		
		return this.http
			.post<void>(url, item, { headers: headers }).pipe(
				catchError((error: any) => throwError(error)));
	}

	decline(item: ResetUserCredentialDecline, tenantId: Guid): Observable<void> {
		const url = `${this.apiBase}/provider/decline`;

		let headers = new HttpHeaders();
		if (this.installationConfiguration.isMultitenant) {
			headers = headers.set(this.installationConfiguration.authTenantHeader, tenantId.toString());
		}

		return this.http
			.post<void>(url, item, { headers: headers }).pipe(
				catchError((error: any) => throwError(error)));
	}
}
