import { NgModule } from '@angular/core';
import { CommonFormsModule } from '@common/forms/common-forms.module';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { TotpModule } from '@idp-service/ui/totp/totp.module';
import { EmailClientEditorComponent } from '@notification-service/ui/tenant-configuration/email-client/email-client-editor.component';

@NgModule({
	imports: [
		CommonUiModule,
		CommonFormsModule,
		TotpModule,
	],
	declarations: [
		EmailClientEditorComponent
	],
	exports: [
		EmailClientEditorComponent
	]
})
export class TenantConfigurationEmailClientModule { }
