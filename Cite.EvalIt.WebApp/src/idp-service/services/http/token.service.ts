
import { Injectable } from '@angular/core';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { AuthService } from '@app/core/services/ui/auth.service';
import { BaseHttpService } from '@common/base/base-http.service';
import { BaseService } from '@common/base/base.service';
import { QueryResult } from '@common/model/query-result';
import { PersistedGrantAggregation, PersistedGrantAggregationKey } from '@idp-service/core/model/persisted-grant.model';
import { PersistedGrantLookup } from '@idp-service/core/query/persisted-grant.lookup';
import { Observable, throwError } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';

@Injectable()
export class TokenService extends BaseService {
	constructor(
		private installationConfiguration: InstallationConfigurationService,
		private authService: AuthService,
		private http: BaseHttpService
	) { super(); }

	private get apiBase(): string { return `${this.installationConfiguration.idpServiceAddress}api/idp/token`; }

	public query(q: PersistedGrantLookup): Observable<QueryResult<PersistedGrantAggregation>> {
		const url = `${this.apiBase}/query`;
		return this.http
			.post<QueryResult<PersistedGrantAggregation>>(url, q).pipe(
				catchError((error: any) => throwError(error)));
	}

	delete(item: PersistedGrantAggregationKey): Observable<void> {
		const url = `${this.apiBase}/delete`;

		return this.http
			.post<void>(url, item).pipe(
				catchError((error: any) => throwError(error)));
	}

	public logout(action: () => void = null): void {
		this.authService.beginLogOutProcess();

		const authToken = this.authService.currentAuthenticationToken();

		if (authToken && this.authService.hasAccessToken()) {
			this.logoutExplicit(action);
		} else {
			this.logoutImplicit(action);
		}
	}

	private logoutExplicit(action: () => void = null): void {
		const url = `${this.apiBase}/logout-explicit`;

		const params = {
			subjectId: this.authService.userId(),
			clientId: this.installationConfiguration.authClientId
		};
		this.http
			.post(url, params).pipe(
				catchError(() => {
					this.authService.clear();
					if (action) {
						action();
					}
					return null;
				}),
				takeUntil(this._destroyed)
			).subscribe(() => {
				this.authService.clear();
				if (action) { action(); }
			});
	}

	private logoutImplicit(action: () => void = null): void {
		const url = `${this.apiBase}/logout-implicit`;

		const params = {
		};
		this.http
			.post(url, params).pipe(
				catchError(() => {
					this.authService.clear();
					if (action) {
						action();
					}
					return null;
				}),
				takeUntil(this._destroyed)
			).subscribe(() => {
				this.authService.clear();
				if (action) { action(); }
			});
	}
}
