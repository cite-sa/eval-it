import { NgModule } from '@angular/core';
import { CommonFormsModule } from '@common/forms/common-forms.module';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { TotpModule } from '@idp-service/ui/totp/totp.module';
import { NotifierListEditorComponent } from '@notification-service/ui/tenant-configuration/notifier-list/notifier-list-editor.component';

@NgModule({
	imports: [
		CommonUiModule,
		CommonFormsModule,
		TotpModule,
	],
	declarations: [
		NotifierListEditorComponent
	],
	exports: [
		NotifierListEditorComponent
	]
})
export class TenantConfigurationNotifierListModule { }
