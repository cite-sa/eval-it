import { CredentialProvider } from '@idp-service/core/enum/credential-provider.enum';
import { RecoveryInfoType } from '@idp-service/core/enum/recovery-info-type.enum';

export interface CredentialResetRequest {
	provider?: CredentialProvider;
	recoveryType?: RecoveryInfoType;
	value: string;
	recaptcha: string;
}
