import { NgModule } from '@angular/core';
import { CommonFormsModule } from '@common/forms/common-forms.module';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { IdpServiceFormattingModule } from '@idp-service/core/formatting/formatting.module';
import { CredentialProvidersEditorComponent } from '@idp-service/ui/tenant-configuration/credential-providers/credential-providers-editor.component';
import { TotpModule } from '@idp-service/ui/totp/totp.module';

@NgModule({
	imports: [
		CommonUiModule,
		CommonFormsModule,
		IdpServiceFormattingModule,
		TotpModule,
	],
	declarations: [
		CredentialProvidersEditorComponent
	],
	exports: [
		CredentialProvidersEditorComponent
	]
})
export class TenantConfigurationCredentialProvidersModule { }
