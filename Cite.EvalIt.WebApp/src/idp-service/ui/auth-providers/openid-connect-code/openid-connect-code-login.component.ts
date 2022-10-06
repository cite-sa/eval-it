import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { Guid } from '@common/types/guid';
import { SignUpMode } from '@idp-service/core/enum/sign-up-mode.enum';
import { OpenIDConnectCodeLoginService } from '@idp-service/services/openid-connect-code-login.service';
import { ConsentSelection } from '@idp-service/ui/user-consents/editor/user-consents-editor.component';

@Component({
	selector: 'app-openid-connect-code-login',
	templateUrl: './openid-connect-code-login.component.html',
	styleUrls: ['./openid-connect-code-login.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class OpenIDConnectCodeLoginComponent {
	@Input() tenantId: Guid;
	@Input() signUpMode: SignUpMode;
	@Input() invitationCode: string;
	@Input() signupConsents: ConsentSelection[];
	@Input() idpId: string;
	@Input() title: string;
	@Input() ssoUrl: string;

	loginWindow: Window;

	constructor(
		private openIDConnectCodeLoginService: OpenIDConnectCodeLoginService,
		private installationConfiguration: InstallationConfigurationService
	) { }

	openIDConnectCodeLogin() {
		window.location.href = this.openIDConnectCodeLoginService.getOpenIDLoginUrl(this.tenantId, this.idpId, this.ssoUrl,  this.signUpMode, this.invitationCode, this.signupConsents);
	}
}
