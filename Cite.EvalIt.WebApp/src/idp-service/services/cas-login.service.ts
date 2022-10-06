import { Injectable } from '@angular/core';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { Guid } from '@common/types/guid';
import { SignUpMode } from '@idp-service/core/enum/sign-up-mode.enum';
import { ConsentSelection } from '@idp-service/ui/user-consents/editor/user-consents-editor.component';

@Injectable()
export class CASLoginService {

	constructor(
		private installationConfiguration: InstallationConfigurationService,
	) { }

	buildRelayState(tenantId: Guid, idpId: string, signUpMode: SignUpMode, invitationCode: string, signupConsents: ConsentSelection[]): string {
		let uri = 'tenantId=' + tenantId.toString() + '&idpId=' + idpId;
		if (signUpMode !== undefined) { uri += '&mode=' + signUpMode; }
		if (invitationCode) { uri += '&inv=' + invitationCode; }
		if (signupConsents) { uri += '&consents=' + btoa(JSON.stringify(signupConsents)); }
		return encodeURIComponent(uri);
	}

	resolveTenantId(relayState: string): Guid {
		const decoded = decodeURIComponent(relayState);
		const routeParams = new URLSearchParams(decoded);
		return routeParams.has('tenantId') ? Guid.parse(routeParams.get('tenantId')) : null;
	}

	resolveSignUpMode(relayState: string): SignUpMode {
		const decoded = decodeURIComponent(relayState);
		const routeParams = new URLSearchParams(decoded);
		return routeParams.has('mode') ? Number.parseInt(routeParams.get('mode')) : undefined;
	}

	resolveInvitationCode(relayState: string): string {
		const decoded = decodeURIComponent(relayState);
		const routeParams = new URLSearchParams(decoded);
		return routeParams.has('inv') ? routeParams.get('inv') : undefined;
	}

	resolveConsentSelections(relayState: string): ConsentSelection[] {
		const decoded = decodeURIComponent(relayState);
		const routeParams = new URLSearchParams(decoded);
		return routeParams.has('consents') ? JSON.parse(atob(routeParams.get('consents'))) : undefined;
	}

	resolveIdp(relayState: string): string {
		const decoded = decodeURIComponent(relayState);
		const routeParams = new URLSearchParams(decoded);
		return routeParams.has('idpId') ? routeParams.get('idpId') : '';
	}

	getCASLoginUrl(tenantId: Guid, idpId: string, casServerUrlBase: string, mode: SignUpMode, invitationCode: string, signupConsents: ConsentSelection[]) {
		const service = this.getCASService(tenantId, idpId, mode, invitationCode, signupConsents);

		const url = casServerUrlBase  + '/login?service=' + encodeURIComponent(service);
		return url;
	}

	getCASService(tenantId: Guid, idpId: string, mode: SignUpMode, invitationCode: string, signupConsents: ConsentSelection[]) {
		const service = this.installationConfiguration.casLoginConsumerUrl + "?relayState=" + this.buildRelayState(tenantId, idpId, mode, invitationCode, signupConsents);
		return service;
	}
}
