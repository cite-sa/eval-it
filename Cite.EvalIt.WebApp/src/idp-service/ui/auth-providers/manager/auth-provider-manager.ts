import { CredentialProvider } from '@idp-service/core/enum/credential-provider.enum';
import { SignUpMode } from '@idp-service/core/enum/sign-up-mode.enum';
import { UserType } from '@idp-service/core/enum/user-type.enum';
import { AuthenticationConfiguration, AuthenticationProvider, SamlAuthenticationProvider, CASAuthenticationProvider, OpenIDConnectCodeAuthenticationProvider } from '@idp-service/core/model/authentication-configuration.model';

export class AuthProviderManager {

	public userTypesEnum = UserType;
	private _providers: AuthenticationProvider[];

	constructor(authConfiguration: AuthenticationConfiguration) {
		this._providers = authConfiguration.providers || [];
	}

	public userPassProvider(userType?: UserType): AuthenticationProvider { return this._getPrimarySingleProvider(CredentialProvider.UserPass, userType); }
	public supportsUserPass(userType?: UserType): boolean { return this._supportsPrimarySingleProvider(CredentialProvider.UserPass, userType); }

	public googleProvider(userType?: UserType): AuthenticationProvider { return this._getPrimarySingleProvider(CredentialProvider.Google, userType); }
	public supportsGoogle(userType?: UserType): boolean { return this._supportsPrimarySingleProvider(CredentialProvider.Google, userType); }

	public facebookProvider(userType?: UserType): AuthenticationProvider { return this._getPrimarySingleProvider(CredentialProvider.Facebook, userType); }
	public supportsFacebook(userType?: UserType): boolean { return this._supportsPrimarySingleProvider(CredentialProvider.Facebook, userType); }

	public twitterProvider(userType?: UserType): AuthenticationProvider { return this._getPrimarySingleProvider(CredentialProvider.Twitter, userType); }
	public supportsTwitter(userType?: UserType): boolean { return this._supportsPrimarySingleProvider(CredentialProvider.Twitter, userType); }

	public linkedInProvider(userType?: UserType): AuthenticationProvider { return this._getPrimarySingleProvider(CredentialProvider.LinkedIn, userType); }
	public supportsLinkedIn(userType?: UserType): boolean { return this._supportsPrimarySingleProvider(CredentialProvider.LinkedIn, userType); }

	public gitHubProvider(userType?: UserType): AuthenticationProvider { return this._getPrimarySingleProvider(CredentialProvider.GitHub, userType); }
	public supportsGitHub(userType?: UserType): boolean { return this._supportsPrimarySingleProvider(CredentialProvider.GitHub, userType); }

	public taxisnetProvider(userType?: UserType): AuthenticationProvider { return this._getPrimarySingleProvider(CredentialProvider.Taxisnet, userType); }
	public supportsTaxisnet(userType?: UserType): boolean { return this._supportsPrimarySingleProvider(CredentialProvider.Taxisnet, userType); }

	public samlProviders(userType?: UserType): SamlAuthenticationProvider[] { return this._getPrimaryMultipleProvider(CredentialProvider.Saml, userType) as SamlAuthenticationProvider[]; }
	public supportsSaml(userType?: UserType): boolean { return this._supportsPrimaryMultipleProvider(CredentialProvider.Saml, userType); }

	public openIDConnectCodeProviders(userType?: UserType): OpenIDConnectCodeAuthenticationProvider[] { return this._getPrimaryMultipleProvider(CredentialProvider.OpenIDConnectCode, userType) as OpenIDConnectCodeAuthenticationProvider[]; }
	public supportsOpenIDConnectCode(userType?: UserType): boolean { return this._supportsPrimaryMultipleProvider(CredentialProvider.OpenIDConnectCode, userType); }

	public casProviders(userType?: UserType): CASAuthenticationProvider[] { return this._getPrimaryMultipleProvider(CredentialProvider.CAS, userType) as CASAuthenticationProvider[]; }
	public supportsCAS(userType?: UserType): boolean { return this._supportsPrimaryMultipleProvider(CredentialProvider.CAS, userType); }

	public apiKeyProvider(userType?: UserType): AuthenticationProvider { return this._getPrimarySingleProvider(CredentialProvider.APIKey, userType); }
	public supportsApiKey(userType?: UserType): boolean { return this._supportsPrimarySingleProvider(CredentialProvider.APIKey, userType); }

	public totpProvider(userType?: UserType): AuthenticationProvider { return this._getAuxiliarySingleProvider(CredentialProvider.Totp, userType); }
	public supportsTotp(userType?: UserType): boolean { return this._supportsAuxiliarySingleProvider(CredentialProvider.Totp, userType); }

	public directLinkProvider(userType?: UserType): AuthenticationProvider { return this._getPrimarySingleProvider(CredentialProvider.DirectLink, userType); }
	public supportsDirectLink(userType?: UserType): boolean { return this._supportsPrimarySingleProvider(CredentialProvider.DirectLink, userType); }

	public transientProvider(userType?: UserType): AuthenticationProvider { return this._getPrimarySingleProvider(CredentialProvider.Transient, userType); }
	public supportsTransient(userType?: UserType): boolean { return this._supportsPrimarySingleProvider(CredentialProvider.Transient, userType); }

	public primaryProviders(userType?: UserType): AuthenticationProvider[] {
		const userTypeToFilter = userType || UserType.Person; // Defaults to Person.
		return this._providersFilter(x => x.isPrimaryAuthNMethod && x.compatibleUserTypes.includes(userTypeToFilter));
	}

	public primaryExternalProviders(userType?: UserType): AuthenticationProvider[] { return this.primaryProviders(userType).filter(x => x.credentialProvider !== CredentialProvider.UserPass); }
	public anyExternalProviders(userType?: UserType): boolean { return !!(this.primaryProviders(userType).filter(x => x.credentialProvider !== CredentialProvider.UserPass)[0]); }

	public totpAuxiliaryProviders(userType?: UserType): AuthenticationProvider[] { return this.primaryProviders(userType).filter(x => Array.isArray(x.auxiliaries) && x.auxiliaries.includes(CredentialProvider.Totp)); }
	public totpEnabledForUserPass(userType?: UserType): boolean {
		const totpProviders = this.totpAuxiliaryProviders(userType);
		return this.supportsTotp && totpProviders.filter(x => x.credentialProvider === CredentialProvider.UserPass).length > 0;
	}

	public all(): AuthenticationProvider[] {
		return this._providers;
	}

	public any(predicate?: (x: AuthenticationProvider) => boolean): boolean {
		predicate = predicate || (() => true);
		let found = false;
		for (let i = 0; i < this._providers.length && !found; i++) {
			found = predicate(this._providers[i]);
		}
		return found;
	}

	public providersForSignupMode(signupMode: SignUpMode): AuthenticationProvider[] {
		switch (signupMode) {
			case SignUpMode.Invitation:
				return this.primaryProviders().filter(x => x.allowInvitation);
			case SignUpMode.Register:
				return this.primaryProviders().filter(x => x.allowRegistration);
			default: return [];
		}
	}

	public supportsProviderForSignupMode(provider: CredentialProvider, signupMode: SignUpMode): boolean { return !!(this.providersForSignupMode(signupMode).filter(x => x.credentialProvider === provider)[0]); }

	private _supportsPrimarySingleProvider(provider: CredentialProvider, userType?: UserType): boolean {
		const userTypeToFilter = userType || UserType.Person; // Defaults to Person.
		return !!(this._providers.filter(x => x.compatibleUserTypes.includes(userTypeToFilter) && x.isPrimaryAuthNMethod && x.credentialProvider === provider)[0]);
	}

	private _getPrimarySingleProvider(provider: CredentialProvider, userType?: UserType): AuthenticationProvider {
		const userTypeToFilter = userType || UserType.Person; // Defaults to Person.
		return this._providers.filter(x => x.compatibleUserTypes.includes(userTypeToFilter) && x.isPrimaryAuthNMethod && x.credentialProvider === provider)[0];
	}

	private _supportsPrimaryMultipleProvider(provider: CredentialProvider, userType?: UserType): boolean {
		const userTypeToFilter = userType || UserType.Person; // Defaults to Person.
		return this.any(x => x.compatibleUserTypes.includes(userTypeToFilter) && x.isPrimaryAuthNMethod && x.credentialProvider === provider);
	}

	private _getPrimaryMultipleProvider(provider: CredentialProvider, userType?: UserType): AuthenticationProvider[] {
		const userTypeToFilter = userType || UserType.Person; // Defaults to Person.
		return this._providersFilter(x => x.compatibleUserTypes.includes(userTypeToFilter) && x.isPrimaryAuthNMethod && x.credentialProvider === provider);
	}

	private _supportsAuxiliarySingleProvider(provider: CredentialProvider, userType?: UserType): boolean {
		const userTypeToFilter = userType || UserType.Person; // Defaults to Person.
		return !!(this._providers.filter(x => x.compatibleUserTypes.includes(userTypeToFilter) && x.isAuxiliaryAuthNMethod && x.credentialProvider === provider)[0]);
	}

	private _getAuxiliarySingleProvider(provider: CredentialProvider, userType?: UserType): AuthenticationProvider {
		const userTypeToFilter = userType || UserType.Person; // Defaults to Person.
		return this._providers.filter(x => x.compatibleUserTypes.includes(userTypeToFilter) && x.isAuxiliaryAuthNMethod && x.credentialProvider === provider)[0];
	}

	private _providersFilter(predicate?: (x: AuthenticationProvider) => boolean): AuthenticationProvider[] {
		predicate = predicate || (() => true);
		return this._providers.filter(predicate);
	}
}
