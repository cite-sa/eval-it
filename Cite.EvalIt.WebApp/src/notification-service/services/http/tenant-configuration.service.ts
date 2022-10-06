import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseHttpService } from '@common/base/base-http.service';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { QueryResult } from '@common/model/query-result';
import { Guid } from '@common/types/guid';
import { NotifierListConfigurationDataContainer, TenantConfiguration, TenantConfigurationEmailClientPersist, TenantConfigurationNotifierListPersist, TenantConfigurationSlackBroadcastPersist, TenantConfigurationSmsClientPersist } from '@notification-service/core/model/tenant-configuration.model';
import { NotifierListLookup } from '@notification-service/core/query/notifier-list.lookup';
import { TenantConfigurationLookup } from '@notification-service/core/query/tenant-configuration.lookup';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class TenantConfigurationService {

	private get apiBase(): string { return `${this.installationConfiguration.notificationServiceAddress}api/notification/tenant-configuration`; }

	constructor(
		private installationConfiguration: InstallationConfigurationService,
		private http: BaseHttpService
	) { }

	query(q: TenantConfigurationLookup): Observable<QueryResult<TenantConfiguration>> {
		const url = `${this.apiBase}/query`;
		return this.http
			.post<QueryResult<TenantConfiguration>>(url, q).pipe(
				catchError((error: any) => throwError(error)));
	}

	getSingle(id: Guid, reqFields: string[] = []): Observable<TenantConfiguration> {
		const url = `${this.apiBase}/${id}`;
		const options = { params: { f: reqFields } };

		return this.http
			.get<TenantConfiguration>(url, options).pipe(
				catchError((error: any) => throwError(error)));
	}

	persistSlackBroadcast(item: TenantConfigurationSlackBroadcastPersist, totp?: string): Observable<TenantConfiguration> {
		const url = `${this.apiBase}/persist/slack-broadcast`;

		let headers = new HttpHeaders();
		if (totp) { headers = headers.set(this.installationConfiguration.authTotpHeader, totp); }

		return this.http
			.post<TenantConfiguration>(url, item, headers ? { headers: headers } : undefined).pipe(
				catchError((error: any) => throwError(error)));
	}

	persistEmailClientConfiguration(item: TenantConfigurationEmailClientPersist, totp?: string): Observable<TenantConfiguration> {
		const url = `${this.apiBase}/persist/email-client`;

		let headers = new HttpHeaders();
		if (totp) { headers = headers.set(this.installationConfiguration.authTotpHeader, totp); }

		return this.http
			.post<TenantConfiguration>(url, item, headers ? { headers: headers } : undefined).pipe(
				catchError((error: any) => throwError(error)));
	}

	persistSmsClientConfiguration(item: TenantConfigurationSmsClientPersist, totp?: string): Observable<TenantConfiguration> {
		const url = `${this.apiBase}/persist/sms-client`;

		let headers = new HttpHeaders();
		if (totp) { headers = headers.set(this.installationConfiguration.authTotpHeader, totp); }

		return this.http
			.post<TenantConfiguration>(url, item, headers ? { headers: headers } : undefined).pipe(
				catchError((error: any) => throwError(error)));
	}

	getNotifierList(q: NotifierListLookup): Observable<NotifierListConfigurationDataContainer> {
		const url = `${this.apiBase}/notifier-list/available`;
		return this.http
			.post<NotifierListConfigurationDataContainer>(url, q).pipe(
				catchError((error: any) => throwError(error)));
	}

	persistNotifierListConfiguration(item: TenantConfigurationNotifierListPersist, totp?: string): Observable<TenantConfiguration> {
		const url = `${this.apiBase}/persist/notifier-list`;

		let headers = new HttpHeaders();
		if (totp) { headers = headers.set(this.installationConfiguration.authTotpHeader, totp); }

		return this.http
			.post<TenantConfiguration>(url, item, headers ? { headers: headers } : undefined).pipe(
				catchError((error: any) => throwError(error)));
	}

	delete(id: Guid, totp?: string): Observable<TenantConfiguration> {
		const url = `${this.apiBase}/${id}`;

		let headers = new HttpHeaders();
		if (totp) { headers = headers.set(this.installationConfiguration.authTotpHeader, totp); }

		return this.http
			.delete<TenantConfiguration>(url, headers ? { headers: headers } : undefined).pipe(
				catchError((error: any) => throwError(error)));
	}
}
