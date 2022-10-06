import { Injectable } from '@angular/core';
import { DataObjectReview, DataObjectReviewPersist } from '@app/core/model/data-object/data-object-review.model';
import { DataObjectReviewLookup } from '@app/core/query/data-object-review.lookup';
import { BaseHttpService } from '@common/base/base-http.service';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { QueryResult } from '@common/model/query-result';
import { Guid } from '@common/types/guid';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
  })
export class DataObjectReviewService {
    private get apiBase(): string { return `${this.installationConfiguration.appServiceAddress}api/app/dataobjectreview`; }
    
    constructor(
		private installationConfiguration: InstallationConfigurationService,
		private http: BaseHttpService
	) { }

    public query( q: DataObjectReviewLookup): Observable<QueryResult<DataObjectReview>> {
		const url = `${this.apiBase}/query`;

        return this.http.post<QueryResult<DataObjectReview>>(url, q).pipe(
			catchError((error: any) => throwError(error)));
    }

	public persist( objectId: Guid, review: DataObjectReviewPersist, reqFields: string[] = []): Observable<DataObjectReview> {
		const url = `${this.apiBase}/persist/${objectId}`;
		const options = { params: { f: reqFields } };

		return this.http.post<DataObjectReview>(url, review, options).pipe(
			catchError((error: any) => throwError(error)));
	}

	public delete( objectId: Guid, review: DataObjectReviewPersist, reqFields: string[] = []): Observable<DataObjectReview> {
		const url = `${this.apiBase}/delete/${objectId}`;
		const options = { params: { f: reqFields } };

		return this.http.post<DataObjectReview>(url, review, options).pipe(
			catchError((error: any) => throwError(error)));
	}
}