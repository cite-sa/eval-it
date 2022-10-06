import { Guid } from '@common/types/guid';
import { SignUpMode } from '@idp-service/core/enum/sign-up-mode.enum';
import { AuthenticationProvider } from '@idp-service/core/model/authentication-configuration.model';

export interface Credential {
	username: string;
	password: string;
	recaptcha?: string;
}

export interface DirectLinkRegistrationInfo {
	username: string;
	email: string;
	recaptcha: string;
}

export interface SignUpInfo<PayloadType> {
	mode: SignUpMode;
	payload: PayloadType;
	invitationCode?: string;
	tenantId?: Guid;
}

export interface AuthenticationInfo {
	provider: AuthenticationProvider;
	token: string;
	enableSignInRegister: boolean;
}
