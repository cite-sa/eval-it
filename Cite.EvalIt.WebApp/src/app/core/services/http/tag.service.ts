import { Injectable } from '@angular/core';
import { Tag, TagPersist } from '@app/core/model/tag/tag.model';
import { TagLookup } from '@app/core/query/tag.lookup';
import { BaseHttpService } from '@common/base/base-http.service';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { QueryResult } from '@common/model/query-result';
import { Guid } from '@common/types/guid';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TagService {

	private get apiBase(): string { return `${this.installationConfiguration.appServiceAddress}api/app/tag`; }

	constructor(
		private installationConfiguration: InstallationConfigurationService,
		private http: BaseHttpService
	) { }

  public query( q: TagLookup): Observable<QueryResult<Tag>> {
	const url = `${this.apiBase}/query`;
	return this.http.post<QueryResult<Tag>>(url, q).pipe(
		catchError((error: any) => throwError(error)));
  }

  public getSingle(id: Guid, reqFields: string[] = []): Observable<Tag> {
	const url = `${this.apiBase}/${id}`;
	const options = { params: { f: reqFields } };

	return this.http.get<Tag>(url, options).pipe(
		catchError((error: any) => throwError(error)));
}

  public persist( item: TagPersist): Observable<Tag> {
	const url = `${this.apiBase}/persist`;
	return this.http.post<Tag>(url, item).pipe(
		catchError((error: any) => throwError(error)));
  }

  public delete( id: Guid): Observable<any> {
	const url = `${this.apiBase}/${id}`;
	return this.http.delete(url).pipe(
		catchError((error: any) => throwError(error)));
  }
}
