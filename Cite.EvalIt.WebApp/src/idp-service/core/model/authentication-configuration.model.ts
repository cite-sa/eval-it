import { CredentialProvider } from '@idp-service/core/enum/credential-provider.enum';
import { UserType } from '@idp-service/core/enum/user-type.enum';

export interface AuthenticationConfiguration {
	providers: AuthenticationProvider[];
}

export interface AuthenticationProvider {
	enable: boolean;
	isPrimaryAuthNMethod: boolean;
	isAuxiliaryAuthNMethod: boolean;
	allowRegistration: boolean;
	allowInvitation: boolean;
	grantType: string;
	credentialProvider: CredentialProvider;
	compatibleUserTypes: UserType[];
	auxiliaries: CredentialProvider[];
}

export interface SamlAuthenticationProvider extends AuthenticationProvider {
	options: SamlOptions;
}

export interface SamlOptions {
	title: string;
	idpEntityId: string;
	idpssoUrl: string;
	binding: string;
}

export interface OpenIDConnectCodeAuthenticationProvider extends AuthenticationProvider {
	options: OpenIDConnectCodeOptions;
}

export interface OpenIDConnectCodeOptions {
	title: string;
	idpId: string;
	ssoUrl: string;
}

export interface CASAuthenticationProvider extends AuthenticationProvider {
	options: CASOptions;
}

export interface CASOptions {
	title: string;
	idpEntityId: string;
	casServerUrlBase: string;
	casVersion: CASVersion;
}
export enum CASVersion {
	CAS_1 = 0,
	CAS_2 = 1,
	CAS_3 = 2
}
