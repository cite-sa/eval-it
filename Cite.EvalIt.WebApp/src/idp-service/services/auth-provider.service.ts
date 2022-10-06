
import { Injectable } from '@angular/core';
import { AuthService } from '@app/core/services/ui/auth.service';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { Guid } from '@common/types/guid';
import { CredentialProviderService } from '@idp-service/services/http/credential-provider.service';
import { AuthProviderManager } from '@idp-service/ui/auth-providers/manager/auth-provider-manager';
import { Observable, throwError } from 'rxjs';

@Injectable()
export class AuthProviderService {

	constructor(
		private credentialProviderService: CredentialProviderService,
		private installationConfigurationService: InstallationConfigurationService,
		private authService: AuthService
	) { }

	public getAuthenticationProviderManager(tenantId?: Guid): Observable<AuthProviderManager> {
		let tenant = tenantId;
		if (!tenant && this.authService.tenantId()) { tenant = this.authService.tenantId(); }
		if (!tenant && this.installationConfigurationService.isMultitenant) { return throwError('Tenant not found'); }
		return this.credentialProviderService.configuration(tenant);
	}
}
