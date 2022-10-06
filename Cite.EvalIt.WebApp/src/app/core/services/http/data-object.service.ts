import { Injectable } from '@angular/core';
import { TagSetPersist } from '@app/core/model/app-user/app-user.model';
import { DataObject, DataObjectPersist } from '@app/core/model/data-object/data-object.model';
import { DataObjectLookup } from '@app/core/query/data-object.lookup';
import { BaseHttpService } from '@common/base/base-http.service';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { QueryResult } from '@common/model/query-result';
import { Guid } from '@common/types/guid';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
  })
export class DataObjectService {
    private get apiBase(): string { return `${this.installationConfiguration.appServiceAddress}api/app/dataobject`; }
    
    constructor(
		private installationConfiguration: InstallationConfigurationService,
		private http: BaseHttpService
	) { }

    public query( q: DataObjectLookup): Observable<QueryResult<DataObject>> {
		const url = `${this.apiBase}/query`;

        return this.http.post<QueryResult<DataObject>>(url, q).pipe(
			catchError((error: any) => throwError(error)));
    }

	public getSingle(id: Guid, reqFields: string[] = []): Observable<DataObject> {
		const url = `${this.apiBase}/${id}`;
		const options = { params: { f: reqFields } };

		return this.http.get<DataObject>(url, options).pipe(
			catchError((error: any) => throwError(error)));
	}
          
    public persist( item: DataObjectPersist): Observable<DataObject> {
        const url = `${this.apiBase}/persist`;

        return this.http.post<DataObject>(url, item).pipe(
            catchError((error: any) => throwError(error)));
      }
    
    public delete( id: Guid): Observable<any> {
        const url = `${this.apiBase}/${id}`;
        
        return this.http.delete(url).pipe(
            catchError((error: any) => throwError(error)));
      }

	public setTags( objectId: Guid, tags: TagSetPersist, reqFields: string[] = [] ): Observable<DataObject> {
		const url = `${this.apiBase}/settags/${objectId}`;
		const options = { params: { f: reqFields } };

		return this.http.post<DataObject>(url, tags, options).pipe(
			catchError((error: any) => throwError(error)));
	}
}