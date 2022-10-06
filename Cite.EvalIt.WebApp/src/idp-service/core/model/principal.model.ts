import { Guid } from '@common/types/guid';
import { CredentialProvider } from '@idp-service/core/enum/credential-provider.enum';
import { IdpServicePermission } from '@idp-service/core/enum/permission.enum';
import { UserType } from '@idp-service/core/enum/user-type.enum';

export interface IdpServiceAccount {
	isAuthenticated: boolean;
	permissions: IdpServicePermission[];
	claims: IdpClaimInfo;
	principal: IdpPrincipalInfo;
	profile: IdpProfileInfo;
	consentInfo: IdpConsentInfo;
	credentials: IdpCredentialInfo;
}

export interface IdpClaimInfo {
	roles: string[];
	other: IdpClaimPair[];
}

export interface IdpClaimPair {
	name: string;
	value: string;
}

export interface IdpPrincipalInfo {
	subject: Guid;
	name: string;
	scope: string[];
	client: string;
	notBefore: Date;
	authenticatedAt: Date;
	expiresAt: Date;
}

export interface IdpProfileInfo {
	type: UserType;
	tenant: Guid;
}

export interface IdpConsentInfo {
	requireAttention: boolean;
	lastRequested: Date;
	lastConsented: Date;
}

export interface IdpCredentialInfo {
	providers: CredentialProvider[];
}
