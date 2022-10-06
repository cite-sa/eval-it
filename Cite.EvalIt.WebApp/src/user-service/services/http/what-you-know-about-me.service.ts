import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseHttpService } from '@common/base/base-http.service';
import { BaseHttpParams } from '@common/http/base-http-params';
import { InterceptorType } from '@common/http/interceptors/interceptor-type';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { QueryResult } from '@common/model/query-result';
import { Guid } from '@common/types/guid';
import { WhatYouKnowAboutMeDecline, WhatYouKnowAboutMeRequest, WhatYouKnowAboutMeStamp, WhatYouKnowAboutMeValidate } from '@user-service/core/model/what-you-know-about-me.model';
import { WhatYouKnowAboutMeRequestLookup } from '@user-service/core/query/what-you-know-about-me-request.lookup';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class WhatYouKnowAboutMeService {

	private get apiBase(): string { return `${this.installationConfiguration.userServiceAddress}api/user/what-you-know-about-me/request`; }

	constructor(
		private installationConfiguration: InstallationConfigurationService,
		private http: BaseHttpService
	) { }

	query(q: WhatYouKnowAboutMeRequestLookup): Observable<QueryResult<WhatYouKnowAboutMeRequest>> {
		const url = `${this.apiBase}/query`;
		return this.http
			.post<QueryResult<WhatYouKnowAboutMeRequest>>(url, q).pipe(
				catchError((error: any) => throwError(error)));
	}

	queryMine(q: WhatYouKnowAboutMeRequestLookup): Observable<QueryResult<WhatYouKnowAboutMeRequest>> {
		const url = `${this.apiBase}/query/mine`;
		return this.http
			.post<QueryResult<WhatYouKnowAboutMeRequest>>(url, q).pipe(
				catchError((error: any) => throwError(error)));
	}

	request(totp?: string): Observable<number> {
		const url = `${this.apiBase}/request`;

		let headers = new HttpHeaders();
		if (totp) { headers = headers.set(this.installationConfiguration.authTotpHeader, totp); }


		return this.http
			.post<number>(url, {}, headers ? { headers: headers } : undefined).pipe(
				catchError((error: any) => throwError(error)));
	}

	validate(item: WhatYouKnowAboutMeValidate): Observable<void> {
		const url = `${this.apiBase}/validate`;

		return this.http
			.post<void>(url, item).pipe(
				catchError((error: any) => throwError(error)));
	}

	decline(item: WhatYouKnowAboutMeDecline): Observable<void> {
		const url = `${this.apiBase}/decline`;

		return this.http
			.post<void>(url, item).pipe(
				catchError((error: any) => throwError(error)));
	}

	stamp(item: WhatYouKnowAboutMeStamp, totp?: string): Observable<void> {
		const url = `${this.apiBase}/stamp`;

		let headers = new HttpHeaders();
		if (totp) { headers = headers.set(this.installationConfiguration.authTotpHeader, totp); }

		return this.http
			.post<void>(url, item, headers ? { headers: headers } : undefined).pipe(
				catchError((error: any) => throwError(error)));
	}

	delete(id: Guid): Observable<WhatYouKnowAboutMeRequest> {
		const url = `${this.apiBase}/${id}`;
		return this.http
			.delete<WhatYouKnowAboutMeRequest>(url).pipe(
				catchError((error: any) => throwError(error)));
	}

	download(id: Guid, totp?: string): Observable<Blob> {
		const url = `${this.apiBase}/download/${id}`;

		let headers = new HttpHeaders();
		headers = headers.set('Content-Type', 'application/zip');
		headers = headers.set('Accept', 'application/zip');

		const params = new BaseHttpParams();
		params.interceptorContext = {
			excludedInterceptors: [
				InterceptorType.JSONContentType,
				InterceptorType.Locale,
				InterceptorType.ProgressIndication]
		};

		if (totp) { headers = headers.set(this.installationConfiguration.authTotpHeader, totp); }

		return this.http
			.get<Blob>(url, { params: params, headers: headers, responseType: 'blob' }).pipe(
				catchError((error: any) => throwError(error)));
	}

	next(): Observable<Date> {
		const url = `${this.apiBase}/next`;

		return this.http
			.get<Date>(url).pipe(
				catchError((error: any) => throwError(error)));
	}
}
