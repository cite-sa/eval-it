import { Injectable } from '@angular/core';
import { AppUser, TagSetPersist, UserWithRelationship, UserWithRelationshipPersist } from '@app/core/model/app-user/app-user.model';
import { AppUserLookup } from '@app/core/query/app-user.lookup';
import { BaseHttpService } from '@common/base/base-http.service';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { QueryResult } from '@common/model/query-result';
import { Guid } from '@common/types/guid';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AppUserService {

	private get apiBase(): string { return `${this.installationConfiguration.appServiceAddress}api/app/user`; }

	constructor(
		private installationConfiguration: InstallationConfigurationService,
		private http: BaseHttpService
	) { }

	public query( q: AppUserLookup): Observable<QueryResult<AppUser>> {
		const url = `${this.apiBase}/query`;
		return this.http.post<QueryResult<AppUser>>(url, q).pipe(
			catchError((error: any) => throwError(error)));
	}

	public getSingle(id: Guid, reqFields: string[] = []): Observable<AppUser> {
		const url = `${this.apiBase}/${id}`;
		const options = { params: { f: reqFields } };

		return this.http.get<AppUser>(url, options).pipe(
			catchError((error: any) => throwError(error)));
	}

	public setTags( userId: Guid, tags: TagSetPersist, reqFields: string[] = [] ): Observable<AppUser> {
		const url = `${this.apiBase}/settags/${userId}`;
		const options = { params: { f: reqFields } };

		return this.http.post<AppUser>(url, tags, options).pipe(
			catchError((error: any) => throwError(error)));
	}

	public userNetworkAdd( userId: Guid, userWithRelationship: UserWithRelationshipPersist, reqFields: string[] = [] ): Observable<AppUser> {
		const url = `${this.apiBase}/usernetworkadd/${userId}`;
		const options = { params: { f: reqFields } };

		return this.http.post<AppUser>(url, userWithRelationship, options).pipe(
			catchError((error: any) => throwError(error)));
	}

	public userNetworkRemove( userId: Guid, userWithRelationship: UserWithRelationshipPersist, reqFields: string[] = [] ): Observable<AppUser> {
		const url = `${this.apiBase}/usernetworkremove/${userId}`;
		const options = { params: { f: reqFields } };

		return this.http.post<AppUser>(url, userWithRelationship, options).pipe(
			catchError((error: any) => throwError(error)));
	}

	public getMyNetwork(reqFields: string[] = []): Observable<QueryResult<UserWithRelationship>> {
		const url = `${this.apiBase}/my-network`;
		const options = { params: { f: reqFields } };

		return this.http.get<QueryResult<UserWithRelationship>>(url, options).pipe(
			catchError((error: any) => throwError(error)));
	}

	public myNetworkAdd(userWithRelationship: UserWithRelationshipPersist, reqFields: string[] = [] ): Observable<AppUser> {
		const url = `${this.apiBase}/my-network-add`;
		const options = { params: { f: reqFields } };

		return this.http.post<AppUser>(url, userWithRelationship, options).pipe(
			catchError((error: any) => throwError(error)));
	}

	public myNetworkRemove(userWithRelationship: UserWithRelationshipPersist, reqFields: string[] = [] ): Observable<AppUser> {
		const url = `${this.apiBase}/my-network-remove`;
		const options = { params: { f: reqFields } };

		return this.http.post<AppUser>(url, userWithRelationship, options).pipe(
			catchError((error: any) => throwError(error)));
	}

}
