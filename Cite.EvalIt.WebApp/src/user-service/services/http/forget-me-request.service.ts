import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseHttpService } from '@common/base/base-http.service';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { QueryResult } from '@common/model/query-result';
import { Guid } from '@common/types/guid';
import { ForgetMeDecline, ForgetMeRequest, ForgetMeStamp, ForgetMeValidate } from '@user-service/core/model/forget-me.model';
import { ForgetMeRequestLookup } from '@user-service/core/query/forget-me-request.lookup';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ForgetMeRequestService {

	private get apiBase(): string { return `${this.installationConfiguration.userServiceAddress}api/user/forget-me/request`; }

	constructor(
		private installationConfiguration: InstallationConfigurationService,
		private http: BaseHttpService
	) { }

	query(q: ForgetMeRequestLookup): Observable<QueryResult<ForgetMeRequest>> {
		const url = `${this.apiBase}/query`;
		return this.http
			.post<QueryResult<ForgetMeRequest>>(url, q).pipe(
				catchError((error: any) => throwError(error)));
	}

	queryMine(q: ForgetMeRequestLookup): Observable<QueryResult<ForgetMeRequest>> {
		const url = `${this.apiBase}/query/mine`;
		return this.http
			.post<QueryResult<ForgetMeRequest>>(url, q).pipe(
				catchError((error: any) => throwError(error)));
	}

	request(): Observable<number> {
		const url = `${this.apiBase}/request`;

		return this.http
			.post<number>(url, {}).pipe(
				catchError((error: any) => throwError(error)));
	}

	validate(item: ForgetMeValidate, totp?: string): Observable<void> {
		const url = `${this.apiBase}/validate`;

		let headers = new HttpHeaders();
		if (totp) { headers = headers.set(this.installationConfiguration.authTotpHeader, totp); }

		return this.http
			.post<void>(url, item, headers ? { headers: headers } : undefined).pipe(
				catchError((error: any) => throwError(error)));
	}

	decline(item: ForgetMeDecline): Observable<void> {
		const url = `${this.apiBase}/decline`;

		return this.http
			.post<void>(url, item).pipe(
				catchError((error: any) => throwError(error)));
	}

	stamp(item: ForgetMeStamp, totp?: string): Observable<void> {
		const url = `${this.apiBase}/stamp`;

		let headers = new HttpHeaders();
		if (totp) { headers = headers.set(this.installationConfiguration.authTotpHeader, totp); }

		return this.http
			.post<void>(url, item, headers ? { headers: headers } : undefined).pipe(
				catchError((error: any) => throwError(error)));
	}

	delete(id: Guid): Observable<ForgetMeRequest> {
		const url = `${this.apiBase}/${id}`;
		return this.http
			.delete<ForgetMeRequest>(url).pipe(
				catchError((error: any) => throwError(error)));
	}

	next(): Observable<Date> {
		const url = `${this.apiBase}/next`;

		return this.http
			.get<Date>(url).pipe(
				catchError((error: any) => throwError(error)));
	}
}
