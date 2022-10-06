import { Injectable } from '@angular/core';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { Guid } from '@common/types/guid';
import { SignUpMode } from '@idp-service/core/enum/sign-up-mode.enum';
import { ConsentSelection } from '@idp-service/ui/user-consents/editor/user-consents-editor.component';
import * as pk from 'pako';

@Injectable()
export class SamlLoginService {

	constructor(
		private installationConfiguration: InstallationConfigurationService,
	) { }

	buildRelayState(tenantId: Guid, idpId: string, binding: string, signUpMode: SignUpMode, invitationCode: string, signupConsents: ConsentSelection[]): string {
		let uri = 'tenantId=' + tenantId.toString() + '&idpId=' + idpId;
		if (signUpMode !== undefined) { uri += '&mode=' + signUpMode; }
		if (invitationCode) { uri += '&inv=' + invitationCode; }
		if (signupConsents) { uri += '&consents=' + btoa(JSON.stringify(signupConsents)); }

		if (binding === 'Post') {
            uri += '&grant_type=' + this.installationConfiguration.samlGrantType;
            uri += '&scope=' + this.installationConfiguration.authScope;
            uri += '&idp_id=' + idpId;
            uri += '&sp_id=' + this.installationConfiguration.samlSpEntityID;
            uri += '&client_id=' + this.installationConfiguration.authClientId;
            uri += '&client_secret=' + this.installationConfiguration.authClientSecret;

            uri += '&client_url=' + this.installationConfiguration.samlAssertionConsumerServiceUrl;
            if (this.installationConfiguration.samlEnableSignInRegister) { uri += '&signin-register=' + 'true'; }
		}

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

	getSamlLoginUrl(tenantId: Guid, idpId: string, idpUrl: string, binding: string, mode: SignUpMode, invitationCode: string, signupConsents: ConsentSelection[]) {
		const now = new Date();
		const spEntityID = this.installationConfiguration.samlSpEntityID;
		let protocolBinding = '';
        switch (binding) {
            case "Redirect": protocolBinding = 'ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" '; break;
            case "Artifact": protocolBinding = 'ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Artifact" '; break;
            case "Post": protocolBinding = 'ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Post" '; break;
        }

		const authenticationRequest = '<saml2p:AuthnRequest xmlns:saml2p="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion" ID="_' + Guid.create() + '" Version="2.0" ' +
			'IssueInstant="' + now.toISOString() + '" ' +
			protocolBinding +
			'Destination="' + idpUrl + '">' +
			'<saml2:Issuer>' + spEntityID + '</saml2:Issuer>' +
			'</saml2p:AuthnRequest>';
		const uint = new Uint8Array(authenticationRequest.length);
		for (let i = 0, j = authenticationRequest.length; i < j; ++i) {
			uint[i] = authenticationRequest.charCodeAt(i);
		}
		const base64String = btoa(pk.deflateRaw(uint, { to: 'string' }));
		const relayState = this.buildRelayState(tenantId, idpId, binding, mode, invitationCode, signupConsents);
		const url = idpUrl + '?RelayState=' + relayState + '&SAMLRequest=' + encodeURIComponent(base64String);
		return url;
	}
}
