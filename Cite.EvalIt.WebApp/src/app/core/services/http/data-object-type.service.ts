import { Injectable } from '@angular/core';
import { DataObjectType, DataObjectTypePersist } from '@app/core/model/data-object-type/data-object-type.model';
import { DataObjectTypeRankingMethodology } from '@app/core/model/data-object-type/ranking-methodology.model';
import { DataObjectTypeLookup } from '@app/core/query/data-object-type.lookup';
import { BaseHttpService } from '@common/base/base-http.service';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { QueryResult } from '@common/model/query-result';
import { Guid } from '@common/types/guid';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataObjectTypeService {
  private get apiBase(): string { return `${this.installationConfiguration.appServiceAddress}api/app/dataobjecttype`; }
    
  constructor(
		private installationConfiguration: InstallationConfigurationService,
		private http: BaseHttpService
	) { }

  public query( q: DataObjectTypeLookup): Observable<QueryResult<DataObjectType>> {
		const url = `${this.apiBase}/query`;

    return this.http.post<QueryResult<DataObjectType>>(url, q).pipe(
			catchError((error: any) => throwError(error)));
  }

	public getSingle(id: Guid, reqFields: string[] = []): Observable<DataObjectType> {
		const url = `${this.apiBase}/${id}`;
		const options = { params: { f: reqFields } };

		return this.http.get<DataObjectType>(url, options).pipe(
			catchError((error: any) => throwError(error)));
	}

  public persist( item: DataObjectTypePersist): Observable<DataObjectType> {
    const url = `${this.apiBase}/persist`;

    return this.http.post<DataObjectType>(url, item).pipe(
      catchError((error: any) => throwError(error)));
  }
    
  public delete( id: Guid): Observable<any> {
    const url = `${this.apiBase}/${id}`;
    
    return this.http.delete(url).pipe(
      catchError((error: any) => throwError(error)));
  }

  public persistRankingMethodology(dataObjectTypeId: Guid, item: DataObjectTypeRankingMethodology, reqFields: string[] = []): Observable<DataObjectTypeRankingMethodology> {
    const url = `${this.apiBase}/${dataObjectTypeId}/persistranking`;
    const options = { params: { f: reqFields } };

    return this.http.post<DataObjectTypeRankingMethodology>(url, item, options).pipe(
      catchError((error: any) => throwError(error)));
  }

  public deleteRankingMethodology(dataObjectTypeId: Guid, item: DataObjectTypeRankingMethodology, reqFields: string[] = []): Observable<DataObjectTypeRankingMethodology> {
    const url = `${this.apiBase}/${dataObjectTypeId}/deleteranking`;
    const options = { params: { f: reqFields } };

    return this.http.post<DataObjectTypeRankingMethodology>(url, item, options).pipe(
      catchError((error: any) => throwError(error)));
  }

}