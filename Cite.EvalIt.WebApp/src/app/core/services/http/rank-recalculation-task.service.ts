import { Injectable } from '@angular/core';
import { RankRecalculationTask } from '@app/core/model/rank-recalculation-task/rank-recalculation-task.model';
import { RankRecalculationTaskLookup } from '@app/core/query/rank-recalculation-task.lookup';
import { BaseHttpService } from '@common/base/base-http.service';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { QueryResult } from '@common/model/query-result';
import { Guid } from '@common/types/guid';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RankRecalculationTaskService {

	private get apiBase(): string { return `${this.installationConfiguration.appServiceAddress}api/app/rankrecalculationtask`; }

	constructor(
		private installationConfiguration: InstallationConfigurationService,
		private http: BaseHttpService
	) { }

  public query( q: RankRecalculationTaskLookup): Observable<QueryResult<RankRecalculationTask>> {
	const url = `${this.apiBase}/query`;
	return this.http.post<QueryResult<RankRecalculationTask>>(url, q).pipe(
		catchError((error: any) => throwError(error)));
  }

  public start(reqFields: string[] = []): Observable<RankRecalculationTask> {
	const url = `${this.apiBase}/starttask`;
	const options = { params: { f: reqFields } };

	return this.http.post<RankRecalculationTask>(url,null,options).pipe(
		catchError((error: any) => throwError(error)));
  }

  public cancel(taskId: Guid, reqFields: string[] = []): Observable<RankRecalculationTask> {
	const url = `${this.apiBase}/canceltask/${taskId}`;
	const options = { params: { f: reqFields } };

	return this.http.post<RankRecalculationTask>(url,null, options).pipe(
		catchError((error: any) => throwError(error)));
  }
}
