import { NgModule } from '@angular/core';
import { CommonFormsModule } from '@common/forms/common-forms.module';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { TotpModule } from '@idp-service/ui/totp/totp.module';
import { SmsClientEditorComponent } from '@notification-service/ui/tenant-configuration/sms-client/sms-client-editor.component';

@NgModule({
	imports: [
		CommonUiModule,
		CommonFormsModule,
		TotpModule,
	],
	declarations: [
		SmsClientEditorComponent
	],
	exports: [
		SmsClientEditorComponent
	]
})
export class TenantConfigurationSmsClientModule { }
