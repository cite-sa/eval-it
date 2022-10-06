import { Injectable } from '@angular/core';
import { BaseEnumUtilsService } from '@common/base/base-enum-utils.service';
import { CredentialProvider } from '@idp-service/core/enum/credential-provider.enum';
import { IsActive } from '@idp-service/core/enum/is-active.enum';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class IdpServiceEnumUtils extends BaseEnumUtilsService {
	constructor(private language: TranslateService) { super(); }

	public toIsActiveString(value: IsActive): string {
		switch (value) {
			case IsActive.Active: return this.language.instant('IDP-SERVICE.TYPES.IS-ACTIVE.ACTIVE');
			case IsActive.Inactive: return this.language.instant('IDP-SERVICE.TYPES.IS-ACTIVE.INACTIVE');
			default: return '';
		}
	}

	public toCredentialProviderString(value: CredentialProvider): string {
		switch (value) {
			case CredentialProvider.UserPass: return this.language.instant('IDP-SERVICE.TYPES.CREDENTIAL-PROVIDER.USER-PASS');
			case CredentialProvider.Google: return this.language.instant('IDP-SERVICE.TYPES.CREDENTIAL-PROVIDER.GOOGLE');
			case CredentialProvider.Taxisnet: return this.language.instant('IDP-SERVICE.TYPES.CREDENTIAL-PROVIDER.TAXISNET');
			case CredentialProvider.Facebook: return this.language.instant('IDP-SERVICE.TYPES.CREDENTIAL-PROVIDER.FACEBOOK');
			case CredentialProvider.Twitter: return this.language.instant('IDP-SERVICE.TYPES.CREDENTIAL-PROVIDER.TWITTER');
			case CredentialProvider.LinkedIn: return this.language.instant('IDP-SERVICE.TYPES.CREDENTIAL-PROVIDER.LINKED-IN');
			case CredentialProvider.GitHub: return this.language.instant('IDP-SERVICE.TYPES.CREDENTIAL-PROVIDER.GIT-HUB');
			case CredentialProvider.Saml: return this.language.instant('IDP-SERVICE.TYPES.CREDENTIAL-PROVIDER.SAML');
			case CredentialProvider.CAS: return this.language.instant('IDP-SERVICE.TYPES.CREDENTIAL-PROVIDER.CAS');
			case CredentialProvider.APIKey: return this.language.instant('IDP-SERVICE.TYPES.CREDENTIAL-PROVIDER.API-KEY');
			case CredentialProvider.Totp: return this.language.instant('IDP-SERVICE.TYPES.CREDENTIAL-PROVIDER.TOTP');
			case CredentialProvider.DirectLink: return this.language.instant('IDP-SERVICE.TYPES.CREDENTIAL-PROVIDER.DIRECT-LINK');
			case CredentialProvider.Transient: return this.language.instant('IDP-SERVICE.TYPES.CREDENTIAL-PROVIDER.TRANSIENT');
			case CredentialProvider.OpenIDConnectCode: return this.language.instant('IDP-SERVICE.TYPES.CREDENTIAL-PROVIDER.OPENID-CONNECT-CODE');
			default: return '';
		}
	}
}
