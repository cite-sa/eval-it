import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { Guid } from '@common/types/guid';
import { SignUpMode } from '@idp-service/core/enum/sign-up-mode.enum';
import { SamlLoginService } from '@idp-service/services/saml-login.service';
import { ConsentSelection } from '@idp-service/ui/user-consents/editor/user-consents-editor.component';

@Component({
	selector: 'app-saml-login',
	templateUrl: './saml-login.component.html',
	styleUrls: ['./saml-login.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class SamlLoginComponent implements OnInit {
	@Input() tenantId: Guid;
	@Input() signUpMode: SignUpMode;
	@Input() invitationCode: string;
	@Input() signupConsents: ConsentSelection[];
	@Input() samlIdpId: string;
	@Input() idpSSOUrl: string;
	@Input() binding: string;
	@Input() title: string;

	loginWindow: Window;
	config: any;

	constructor(
		private samlLoginService: SamlLoginService,
		private installationConfiguration: InstallationConfigurationService
	) { }

	ngOnInit() {
		this.config = {
			spEntityID: this.installationConfiguration.samlSpEntityID,
			assertionConsumerServiceURL: this.installationConfiguration.samlAssertionConsumerServiceUrl,
			idpUrl: this.idpSSOUrl,
			binding: this.binding,
		};
	}

	samlLogin() {
		window.location.href = this.samlLoginService.getSamlLoginUrl(this.tenantId, this.samlIdpId, this.idpSSOUrl, this.binding, this.signUpMode, this.invitationCode, this.signupConsents);
	}

	// loadSAMLResponse(url, closeWindow) {
	// 	const samlResponse = this.getParameterByName(window.document.URL, this.config.useArtifact ? 'SAMLart' : 'SAMLResponse');
	// 	this.setSamlResponse(samlResponse);
	// 	if (closeWindow) { window.close(); }
	// }

	getParameterByName(url, name) {
		name = name.replace(/[[]/, '\[').replace(/[]]/, '\]');
		const regexS = '[\?&]' + name + '=([^&#]*)';
		const regex = new RegExp(regexS);
		const results = regex.exec(url);
		if (results == null) {
			return '';
		} else {
			return results[1];
		}
	}

	getPopUpFeatures() {
		const w = 600;
		const h = 600;
		const dualScreenLeft = window.screenLeft;
		const dualScreenTop = window.screenTop;
		const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
		const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
		const left = ((width / 2) - (w / 2)) + dualScreenLeft;
		const top = ((height / 2) - (h / 2)) + dualScreenTop;
		return 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left;
	}

	getSamlResponse() {
		return this.readCookie('_samlresponse');
	}

	setSamlResponse(value) {
		this.createCookie('_samlresponse', value, 30);
	}

	createCookie(name, value, days) {
		let expires = '';
		if (days) {
			const date = new Date();
			date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
			expires = '; expires=' + date.toUTCString();
		}
		document.cookie = name + '=' + value + expires + '; path=/';
	}

	readCookie(name) {
		const nameEQ = name + '=';
		const ca = document.cookie.split(';');
		for (let i = 0; i < ca.length; i++) {
			let c = ca[i];
			while (c.charAt(0) === ' ') { c = c.substring(1, c.length); }
			if (c.indexOf(nameEQ) === 0) { return c.substring(nameEQ.length, c.length); }
		}
		return null;
	}
}
