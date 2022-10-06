import { NgModule } from '@angular/core';
import { CommonFormsModule } from '@common/forms/common-forms.module';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { TotpModule } from '@idp-service/ui/totp/totp.module';
import { UserProfileNotifierListEditorComponent } from '@notification-service/ui/user-profile/notifier-list/user-profile-notifier-list-editor.component';

@NgModule({
	imports: [
		CommonUiModule,
		CommonFormsModule,
		TotpModule,
	],
	declarations: [
		UserProfileNotifierListEditorComponent
	],
	exports: [
		UserProfileNotifierListEditorComponent
	]
})
export class UserProfileNotifierListModule { }
