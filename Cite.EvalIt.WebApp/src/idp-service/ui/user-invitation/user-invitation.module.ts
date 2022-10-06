import { NgModule } from '@angular/core';
import { CommonFormsModule } from '@common/forms/common-forms.module';
import { AutoCompleteModule } from '@common/modules/auto-complete/auto-complete.module';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { IdpServiceFormattingModule } from '@idp-service/core/formatting/formatting.module';
import { UserInvitationRoutingModule } from '@idp-service/ui/user-invitation/user-invitation-routing.module';
import { UserInvitationComponent } from '@idp-service/ui/user-invitation/user-invitation.component';

@NgModule({
	imports: [
		CommonUiModule,
		CommonFormsModule,
		AutoCompleteModule,
		IdpServiceFormattingModule,
		UserInvitationRoutingModule
	],
	declarations: [
		UserInvitationComponent
	],
})
export class UserInvitationModule { }
