import { NgModule } from '@angular/core';
import { FormattingModule } from '@app/core/formatting/formatting.module';
import { TenantConfigurationRoutingModule } from '@app/ui/misc/tenant-configuration/tenant-configuration-routing.module';
import { TenantConfigurationComponent } from '@app/ui/misc/tenant-configuration/tenant-configuration.component';
import { CommonFormsModule } from '@common/forms/common-forms.module';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { TenantConfigurationCredentialProvidersModule } from '@idp-service/ui/tenant-configuration/credential-providers/credential-providers-editor.module';
import { TenantConfigurationEmailClientModule } from '@notification-service/ui/tenant-configuration/email-client/email-client-editor.module';
import { TenantConfigurationNotifierListModule } from '@notification-service/ui/tenant-configuration/notifier-list/notifier-list-editor.module';
import { TenantConfigurationSlackBroadcastModule } from '@notification-service/ui/tenant-configuration/slack-broadcast/slack-broadcast-editor.module';
import { TenantConfigurationSmsClientModule } from '@notification-service/ui/tenant-configuration/sms-client/sms-client-editor.module';
import { TenantConfigurationUserLocaleModule } from '@user-service/ui/tenant-configuration/user-locale/user-locale-editor.module';

@NgModule({
	imports: [
		CommonUiModule,
		CommonFormsModule,
		FormattingModule,
		TenantConfigurationUserLocaleModule,
		TenantConfigurationSlackBroadcastModule,
		TenantConfigurationEmailClientModule,
		TenantConfigurationSmsClientModule,
		TenantConfigurationNotifierListModule,
		TenantConfigurationCredentialProvidersModule,
		TenantConfigurationRoutingModule
	],
	declarations: [
		TenantConfigurationComponent,
	]
})
export class TenantConfigurationModule { }
