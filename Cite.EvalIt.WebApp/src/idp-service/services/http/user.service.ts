import { Injectable } from '@angular/core';
import { BaseHttpService } from '@common/base/base-http.service';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { QueryResult } from '@common/model/query-result';
import { Guid } from '@common/types/guid';
import { CredentialProvider } from '@idp-service/core/enum/credential-provider.enum';
import { UserClaimPersist } from '@idp-service/core/model/user-claim.model';
import { IdpServiceUser } from '@idp-service/core/model/user.model';
import { UserLookup } from '@user-service/core/query/user.lookup';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class UserService {

	private get apiBase(): string { return `${this.installationConfiguration.idpServiceAddress}api/idp/user`; }

	constructor(
		private installationConfiguration: InstallationConfigurationService,
		private http: BaseHttpService) { }

	public query(q: UserLookup): Observable<QueryResult<IdpServiceUser>> {
		const url = `${this.apiBase}/query`;
		return this.http
			.post<QueryResult<IdpServiceUser>>(url, q).pipe(
				catchError((error: any) => throwError(error)));
	}

	getSingle(id: Guid, reqFields: string[] = []): Observable<IdpServiceUser> {
		const url = `${this.apiBase}/${id}`;
		const options = { params: { f: reqFields } };

		return this.http
			.get<IdpServiceUser>(url, options).pipe(
				catchError((error: any) => throwError(error)));
	}

	updateUserClaims(id: Guid, items: UserClaimPersist[]): Observable<IdpServiceUser[]> {
		const url = `${this.apiBase}/${id}/claims`;
		return this.http
			.post<IdpServiceUser[]>(url, items).pipe(
				catchError((error: any) => throwError(error)));
	}

	updateUserCredentials(id: Guid, items: CredentialProvider[]): Observable<IdpServiceUser[]> {

		const url = `${this.apiBase}/${id}/credentials`;
		return this.http
			.post<IdpServiceUser[]>(url, items).pipe(
				catchError((error: any) => throwError(error)));
	}
}
