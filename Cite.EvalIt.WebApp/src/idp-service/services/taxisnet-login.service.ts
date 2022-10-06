import { Injectable } from '@angular/core';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { Guid } from '@common/types/guid';
import { SignUpMode } from '@idp-service/core/enum/sign-up-mode.enum';
import { ConsentSelection } from '@idp-service/ui/user-consents/editor/user-consents-editor.component';

@Injectable()
export class TaxisnetLoginService {

	constructor(
		private installationConfiguration: InstallationConfigurationService,
	) { }

	//TODO: Move it to separate service
	buildState(tenantId: Guid, signUpMode: SignUpMode, invitationCode: string, signupConsents: ConsentSelection[]): string {
		let uri = '';
		uri = this.addParam(uri, 'mode', signUpMode);
		uri = this.addParam(uri, 'inv', invitationCode);
		uri = this.addParam(uri, 'tenantId', tenantId.toString());
		if (signupConsents) { uri = this.addParam(uri, 'consents', btoa(JSON.stringify(signupConsents))); }
		return uri;
	}

	addParam(current: string, name: string, value: any): string {
		if (value === null || value === undefined) { return current; }
		if (current && current.length > 0) { current += '&'; }
		current += name + '=' + value;
		return current;
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
}
