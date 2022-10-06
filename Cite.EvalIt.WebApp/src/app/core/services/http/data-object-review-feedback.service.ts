import { Injectable } from '@angular/core';
import { DataObjectReviewFeedback, DataObjectReviewFeedbackPersist } from '@app/core/model/data-object/data-object-review-feedback.model';
import { DataObjectReviewFeedbackLookup } from '@app/core/query/data-object-review-feedback.lookup';
import { BaseHttpService } from '@common/base/base-http.service';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { QueryResult } from '@common/model/query-result';
import { Guid } from '@common/types/guid';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
  })
export class DataObjectReviewFeedbackService {
    private get apiBase(): string { return `${this.installationConfiguration.appServiceAddress}api/app/dataobjectreviewfeedback`; }
    
    constructor(
		private installationConfiguration: InstallationConfigurationService,
		private http: BaseHttpService
	) { }

	public query( q: DataObjectReviewFeedbackLookup): Observable<QueryResult<DataObjectReviewFeedback>> {
		const url = `${this.apiBase}/query`;

        return this.http.post<QueryResult<DataObjectReviewFeedback>>(url, q).pipe(
			catchError((error: any) => throwError(error)));
    }

	public persist( objectId: Guid, reviewId: Guid, feedback: DataObjectReviewFeedbackPersist, reqFields: string[] = []): Observable<DataObjectReviewFeedback> {
		const url = `${this.apiBase}/persist/${objectId}/${reviewId}`;
		const options = { params: { f: reqFields } };

		return this.http.post<DataObjectReviewFeedback>(url, feedback, options).pipe(
			catchError((error: any) => throwError(error)));
	}

	public delete( objectId: Guid, reviewId: Guid, feedback: DataObjectReviewFeedbackPersist, reqFields: string[] = []): Observable<DataObjectReviewFeedback> {
		const url = `${this.apiBase}/delete/${objectId}/${reviewId}`;
		const options = { params: { f: reqFields } };

		return this.http.post<DataObjectReviewFeedback>(url, feedback, options).pipe(
			catchError((error: any) => throwError(error)));
	}
}