import { Guid } from '@common/types/guid';
import { CredentialProvider } from '@idp-service/core/enum/credential-provider.enum';

export interface UserCredential {
	userId?: Guid;
	provider?: CredentialProvider;
	createdAt?: Date;
}

export interface ResetUserCredential {
	provider?: CredentialProvider;
	private: string;
	token: string;
}

export interface ResetUserCredentialDecline {
	text: string;
	token: string;
}

export interface OverrideUserPassCredential {
	userId?: Guid;
	public: string;
	private: string;
}
