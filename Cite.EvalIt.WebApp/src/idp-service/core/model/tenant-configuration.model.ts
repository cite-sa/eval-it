import { CredentialProvider } from '@idp-service/core/enum/credential-provider.enum';

export interface TenantCredentialProviderPersist {
	providers: CredentialProvider[];
}
