import { Injectable } from '@angular/core';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { Guid } from '@common/types/guid';
import { SignUpMode } from '@idp-service/core/enum/sign-up-mode.enum';
import { ConsentSelection } from '@idp-service/ui/user-consents/editor/user-consents-editor.component';
import * as pk from 'pako';

@Injectable()
export class OpenIDConnectCodeLoginService {

	constructor(
		private installationConfiguration: InstallationConfigurationService,
	) { }

	buildState(tenantId: Guid, idpId: string, signUpMode: SignUpMode, invitationCode: string, signupConsents: ConsentSelection[]): string {
		let uri =  'idpId=' + idpId;
		if (tenantId !== undefined) { uri += '&tenantId=' + tenantId.toString() }
		if (signUpMode !== undefined) { uri += '&mode=' + signUpMode; }
		if (invitationCode) { uri += '&inv=' + invitationCode; }
		if (signupConsents) { uri += '&consents=' + btoa(JSON.stringify(signupConsents)); }
		uri += '&idp_id=' + idpId;
		uri += '&client_url=' + this.installationConfiguration.openIDConnectCodeConsumerServiceUrl;
		if (this.installationConfiguration.openIDConnectCodeEnableSignInRegister) { uri += '&signin-register=' + 'true'; }
		return encodeURIComponent(uri);
	}

	resolveTenantId(state: string): Guid {
		const decoded = decodeURIComponent(state);
		const routeParams = new URLSearchParams(decoded);
		return routeParams.has('tenantId') ? Guid.parse(routeParams.get('tenantId')) : null;
	}

	resolveSignUpMode(state: string): SignUpMode {
		const decoded = decodeURIComponent(state);
		const routeParams = new URLSearchParams(decoded);
		return routeParams.has('mode') ? Number.parseInt(routeParams.get('mode')) : undefined;
	}

	resolveInvitationCode(state: string): string {
		const decoded = decodeURIComponent(state);
		const routeParams = new URLSearchParams(decoded);
		return routeParams.has('inv') ? routeParams.get('inv') : undefined;
	}

	resolveConsentSelections(state: string): ConsentSelection[] {
		const decoded = decodeURIComponent(state);
		const routeParams = new URLSearchParams(decoded);
		return routeParams.has('consents') ? JSON.parse(atob(routeParams.get('consents'))) : undefined;
	}

	resolveIdp(state: string): string {
		const decoded = decodeURIComponent(state);
		const routeParams = new URLSearchParams(decoded);
		return routeParams.has('idpId') ? routeParams.get('idpId') : '';
	}

	getOpenIDLoginUrl(tenantId: Guid, idpId: string, idpUrl: string, mode: SignUpMode, invitationCode: string, signupConsents: ConsentSelection[]) {
		const now = new Date();
		let protocolBinding = '';
		const state = this.buildState(tenantId, idpId, mode, invitationCode, signupConsents);
		let url = ''
		if (idpUrl.includes("?")) url = idpUrl + '&state=' + state;
		else url = idpUrl + '?state=' + state;
		return url;
	}
}
