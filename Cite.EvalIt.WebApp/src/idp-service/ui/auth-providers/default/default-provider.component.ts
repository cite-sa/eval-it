import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IdpServiceEnumUtils } from '@idp-service/core/formatting/enum-utils.service';
import { AuthenticationProvider } from '@idp-service/core/model/authentication-configuration.model';

@Component({
	selector: 'app-default-provider',
	templateUrl: './default-provider.html'
})
export class DefaultProviderComponent {
	@Input() provider: AuthenticationProvider;
	@Output() onSelect = new EventEmitter<AuthenticationProvider>();

	constructor(
		private idpEnumUtils: IdpServiceEnumUtils
	) { }

	public get name(): string {
		return this.idpEnumUtils.toCredentialProviderString(this.provider.credentialProvider);
	}

	public selectProvider() {
		this.onSelect.emit(this.provider);
	}
}
