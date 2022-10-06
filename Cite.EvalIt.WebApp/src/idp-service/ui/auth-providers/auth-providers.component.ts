import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { Guid } from '@common/types/guid';
import { SignUpMode } from '@idp-service/core/enum/sign-up-mode.enum';
import { AuthenticationProvider, SamlAuthenticationProvider, CASAuthenticationProvider, OpenIDConnectCodeAuthenticationProvider } from '@idp-service/core/model/authentication-configuration.model';
import { AuthenticationInfo } from '@idp-service/core/model/idp.model';
import { ConsentSelection } from '@idp-service/ui/user-consents/editor/user-consents-editor.component';

export interface ExternalAuthProvidersComponentConfiguration {
	showHeader: boolean;
}

@Component({
	selector: 'app-auth-providers',
	styleUrls: ['./auth-providers.component.scss'],
	templateUrl: './auth-providers.component.html'
})
export class AuthProvidersComponent implements AfterViewInit {

	private static defaultConfiguration: ExternalAuthProvidersComponentConfiguration = {
		showHeader: true
	};

	@Input() tenantId: Guid;
	@Input() signUpMode: SignUpMode;
	@Input() invitationCode: string;
	@Input() signupConsents: ConsentSelection[];
	@Input() configuration: ExternalAuthProvidersComponentConfiguration;

	@Input() directLinkProvider: AuthenticationProvider;
	@Input() transientProvider: AuthenticationProvider;
	@Input() userPassProvider: AuthenticationProvider;
	@Input() googleProvider: AuthenticationProvider;
	@Input() facebookProvider: AuthenticationProvider;
	@Input() twitterProvider: AuthenticationProvider;
	@Input() linkedInProvider: AuthenticationProvider;
	@Input() gitHubProvider: AuthenticationProvider;
	@Input() taxisnetProvider: AuthenticationProvider;
	@Input() samlProviders: SamlAuthenticationProvider[];
	@Input() openIDConnectCodeProviders: OpenIDConnectCodeAuthenticationProvider[];
	@Input() casProviders: CASAuthenticationProvider[];

	@Output() onProviderSelected = new EventEmitter<AuthenticationProvider>();
	@Output() onAuthenticate = new EventEmitter<AuthenticationInfo>();

	constructor(private installationConfiguration: InstallationConfigurationService) {
	}

	ngAfterViewInit(): void {
		// If only User/Pass provider is available we auto select it.
		if (!this.googleProvider &&
			!this.facebookProvider &&
			!this.twitterProvider &&
			!this.linkedInProvider &&
			!this.gitHubProvider &&
			!this.directLinkProvider &&
			!this.transientProvider &&
			!this.taxisnetProvider &&
			!this.samlProviders &&
			!this.openIDConnectCodeProviders &&
			!this.casProviders &&
			this.userPassProvider
		) {
			setTimeout(() => {
				this.onProviderSelected.emit(this.userPassProvider);
			});
		}
	}

	private getConfiguration(): ExternalAuthProvidersComponentConfiguration {
		return { ...AuthProvidersComponent.defaultConfiguration, ...this.configuration };
	}

	showHeader(): boolean { return this.getConfiguration().showHeader; }

	public selectProvider(provider: AuthenticationProvider) {
		this.onProviderSelected.emit(provider);
	}

	public onGoogleLoginSuccess(token: string) {
		this.onAuthenticate.emit({ token: token, enableSignInRegister: this.installationConfiguration.googleEnableSignInRegister, provider: this.googleProvider });
	}

	public onFacebookLoginSuccess(token: string) {
		this.onAuthenticate.emit({ token: token, enableSignInRegister: this.installationConfiguration.facebookEnableSignInRegister, provider: this.facebookProvider });
	}

	public onTwitterLoginSuccess(token: string) {
		this.onAuthenticate.emit({ token: token, enableSignInRegister: this.installationConfiguration.twitterEnableSignInRegister, provider: this.twitterProvider });
	}

	public onLinkedInLoginSuccess(token: string) {
		this.onAuthenticate.emit({ token: token, enableSignInRegister: this.installationConfiguration.linkedInEnableSignInRegister, provider: this.linkedInProvider });
	}

	public onGitHubLoginSuccess(token: string) {
		this.onAuthenticate.emit({ token: token, enableSignInRegister: this.installationConfiguration.githubEnableSignInRegister, provider: this.gitHubProvider });
	}

	public onTaxisnetLoginSuccess(token: string) {
		this.onAuthenticate.emit({ token: token, enableSignInRegister: this.installationConfiguration.taxisnetEnableSignInRegister, provider: this.taxisnetProvider });
	}
}
