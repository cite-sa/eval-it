import { NgModule } from '@angular/core';
import { CommonFormsModule } from '@common/forms/common-forms.module';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { TotpModule } from '@idp-service/ui/totp/totp.module';
import { SlackBroadcastEditorComponent } from '@notification-service/ui/tenant-configuration/slack-broadcast/slack-broadcast-editor.component';

@NgModule({
	imports: [
		CommonUiModule,
		CommonFormsModule,
		TotpModule,
	],
	declarations: [
		SlackBroadcastEditorComponent
	],
	exports: [
		SlackBroadcastEditorComponent
	]
})
export class TenantConfigurationSlackBroadcastModule { }
