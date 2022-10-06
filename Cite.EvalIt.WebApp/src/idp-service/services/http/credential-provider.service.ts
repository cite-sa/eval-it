import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService, LoginStatus } from '@app/core/services/ui/auth.service';
import { BaseHttpService } from '@common/base/base-http.service';
import { BaseService } from '@common/base/base.service';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { Guid } from '@common/types/guid';
import { CredentialProvider } from '@idp-service/core/enum/credential-provider.enum';
import { AuthenticationConfiguration } from '@idp-service/core/model/authentication-configuration.model';
import { TenantCredentialProviderPersist } from '@idp-service/core/model/tenant-configuration.model';
import { TotpKeyInfo, TotpValidationInfo } from '@idp-service/core/model/totp.model';
import { AuthProviderManager } from '@idp-service/ui/auth-providers/manager/auth-provider-manager';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, takeUntil } from 'rxjs/operators';

@Injectable()
export class CredentialProviderService extends BaseService {

	private get apiBase(): string { return `${this.installationConfiguration.idpServiceAddress}api/idp/credential-provider`; }
	private _authenticationConfigurationPerTenant: Map<Guid, AuthenticationConfiguration> = new Map<Guid, AuthenticationConfiguration>();

	constructor(
		private installationConfiguration: InstallationConfigurationService,
		private http: BaseHttpService,
		private authService: AuthService
	) {
		super();

		this.authService.getAuthenticationStateObservable()
			.pipe(takeUntil(this._destroyed))
			.subscribe(authenticationState => {
				if (authenticationState.loginStatus === LoginStatus.LoggedOut) { this.clearCache(); }
			});
	}


	configuration(tenantId: Guid): Observable<AuthProviderManager> {
		if (this._authenticationConfigurationPerTenant.has(tenantId)) { return of(new AuthProviderManager(this._authenticationConfigurationPerTenant.get(tenantId))); }
		const url = `${this.apiBase}/configuration`;

		let headers = new HttpHeaders();
		if (this.installationConfiguration.isMultitenant) {
			headers = headers.set(this.installationConfiguration.authTenantHeader, tenantId.toString());
		}

		return this.http
			.get<AuthenticationConfiguration>(url, { headers: headers }).pipe(
				map(x => {
					this._authenticationConfigurationPerTenant.set(tenantId, x);
					return new AuthProviderManager(x);
				}),
				catchError((error: any) => throwError(error)));
	}

	configurationAll(tenantId: Guid): Observable<AuthProviderManager> {
		const url = `${this.apiBase}/configuration/all`;

		let headers = new HttpHeaders();
		if (this.installationConfiguration.isMultitenant) {
			headers = headers.set(this.installationConfiguration.authTenantHeader, tenantId.toString());
		}
		
		return this.http
			.get<AuthenticationConfiguration>(url, { headers: headers }).pipe(
				map(x => new AuthProviderManager(x)),
				catchError((error: any) => throwError(error)));
	}

	persist(item: TenantCredentialProviderPersist, totp?: string): Observable<CredentialProvider[]> {
		const url = `${this.apiBase}/persist`;

		let headers = new HttpHeaders();
		if (totp) { headers = headers.set(this.installationConfiguration.authTotpHeader, totp); }

		return this.http
			.post<CredentialProvider[]>(url, item, headers ? { headers: headers } : undefined).pipe(
				catchError((error: any) => throwError(error)));
	}

	clearCache() {
		this._authenticationConfigurationPerTenant = new Map<Guid, AuthenticationConfiguration>();
	}

	generateApiKey(userId: Guid, totp?: string): Observable<string> {
		const url = `${this.apiBase}/api-key/generate`;

		let headers = new HttpHeaders();
		if (totp) { headers = headers.set(this.installationConfiguration.authTotpHeader, totp); }

		return this.http
			.post<string>(url, JSON.stringify(userId), headers ? { headers: headers } : undefined).pipe(
				catchError((error: any) => throwError(error)));
	}

	generateTotp(): Observable<TotpKeyInfo> {
		const url = `${this.apiBase}/totp/generate`;
		return this.http
			.post<TotpKeyInfo>(url, {}).pipe(
				catchError((error: any) => throwError(error)));
	}

	validateTotp(key: number): Observable<TotpValidationInfo> {
		const url = `${this.apiBase}/totp/validate`;
		return this.http
			.post<TotpValidationInfo>(url, key).pipe(
				catchError((error: any) => throwError(error)));
	}

	persistTotp(keyInfo: TotpKeyInfo, key: number): Observable<TotpValidationInfo> {
		const url = `${this.apiBase}/totp/persist/${key}`;
		return this.http
			.post<TotpValidationInfo>(url, keyInfo).pipe(
				catchError((error: any) => throwError(error)));
	}

	revokeTotp(): Observable<void> {
		const url = `${this.apiBase}/totp/revoke`;
		return this.http
			.post<void>(url, {}).pipe(
				catchError((error: any) => throwError(error)));
	}
}
