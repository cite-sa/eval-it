import { Injectable } from '@angular/core';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { BaseHttpService } from '@common/base/base-http.service';
import { Guid } from '@common/types/guid';
import { ConsentQueryResult, UserConsent, UserConsentHistory, UserConsentPersist } from '@idp-service/core/model/consent.model';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpHeaders } from '@angular/common/http';

@Injectable()
export class ConsentService {

	private get apiBase(): string { return `${this.installationConfiguration.idpServiceAddress}api/idp/consent`; }

	constructor(
		private installationConfiguration: InstallationConfigurationService,
		private http: BaseHttpService
	) { }

	query(reqFields: string[] = []): Observable<ConsentQueryResult> {
		const url = `${this.apiBase}/query`;
		const options = { params: { f: reqFields } };
		return this.http
			.get<ConsentQueryResult>(url, options).pipe(
				catchError((error: any) => throwError(error)));
	}

	getCurrent(userId: Guid, reqFields: string[] = []): Observable<UserConsent[]> {
		const url = `${this.apiBase}/user/${userId}/current`;
		const options = { params: { f: reqFields } };
		return this.http
			.get<UserConsent[]>(url, options).pipe(
				catchError((error: any) => throwError(error)));
	}

	getHistory(userId: Guid, reqFields: string[] = []): Observable<UserConsentHistory[]> {
		const url = `${this.apiBase}/user/${userId}/history`;
		const options = { params: { f: reqFields } };
		return this.http
			.post<UserConsentHistory[]>(url, options).pipe(
				catchError((error: any) => throwError(error)));
	}

	persist(items: UserConsentPersist[], totp?: string, reqFields: string[] = []): Observable<UserConsent[]> {
		const url = `${this.apiBase}/user/persist`;
		const options: any = { params: { f: reqFields } };

		let headers = new HttpHeaders();
		if (totp) {
			headers = headers.set(this.installationConfiguration.authTotpHeader, totp);
			options.headers = headers;
		}

		return this.http
			.post<UserConsent[]>(url, items, options).pipe(
				catchError((error: any) => throwError(error)));
	}
}
