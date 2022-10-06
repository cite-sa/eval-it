import { NgModule } from '@angular/core';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { ConsentsGuardDialogComponent } from '@idp-service/ui/user-consents/consents-guard/consents-dialog/consents-guard-dialog.component';
import { UserConsentsGuardService } from '@idp-service/ui/user-consents/consents-guard/user-consents-guard.service';
import { UserConsentsGuard } from '@idp-service/ui/user-consents/consents-guard/user-consents.guard';
import { UserConsentsEditorComponent } from '@idp-service/ui/user-consents/editor/user-consents-editor.component';
import { UserConsentsRoutingModule } from '@idp-service/ui/user-consents/user-consents-routing.module';
import { UserConsentsComponent } from '@idp-service/ui/user-consents/user-consents.component';

@NgModule({
	imports: [
		CommonUiModule,
		UserConsentsRoutingModule
	],
	declarations: [
		UserConsentsEditorComponent,
		UserConsentsComponent,
		ConsentsGuardDialogComponent
	],
	exports: [
		UserConsentsEditorComponent
	],
	providers: [
		UserConsentsGuard,
		UserConsentsGuardService
	],
	entryComponents: [
		ConsentsGuardDialogComponent
	]
})
export class UserConsentsModule { }
