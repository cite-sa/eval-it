import { NgModule } from '@angular/core';
import { FormattingModule } from '@app/core/formatting/formatting.module';
import { CommonFormsModule } from '@common/forms/common-forms.module';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { TotpModule } from '@idp-service/ui/totp/totp.module';
import { UserServiceFormattingModule } from '@user-service/core/formatting/formatting.module';
import { UserLocaleEditorComponent } from '@user-service/ui/tenant-configuration/user-locale/user-locale-editor.component';

@NgModule({
	imports: [
		CommonUiModule,
		CommonFormsModule,
		TotpModule,
		FormattingModule,
		UserServiceFormattingModule
	],
	declarations: [
		UserLocaleEditorComponent
	],
	exports: [
		UserLocaleEditorComponent
	]
})
export class TenantConfigurationUserLocaleModule { }
