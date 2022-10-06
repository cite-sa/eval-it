import { NgModule } from '@angular/core';
import { CommonFormsModule } from '@common/forms/common-forms.module';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { UserPassOverrideDialogComponent } from '@idp-service/ui/user-pass-override-dialog/user-pass-override-dialog.component';

@NgModule({
	imports: [
		CommonUiModule,
		CommonFormsModule,
	],
	declarations: [
		UserPassOverrideDialogComponent
	],
	entryComponents: [
		UserPassOverrideDialogComponent
	]
})
export class UserPassOverrideDialogModule { }
