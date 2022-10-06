import { NgModule } from '@angular/core';
import { CommonFormsModule } from '@common/forms/common-forms.module';
import { ConfirmationDialogModule } from '@common/modules/confirmation-dialog/confirmation-dialog.module';
import { ListingModule } from '@common/modules/listing/listing.module';
import { TextFilterModule } from '@common/modules/text-filter/text-filter.module';
import { UserSettingsModule } from '@common/modules/user-settings/user-settings.module';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { IdpServiceFormattingModule } from '@idp-service/core/formatting/formatting.module';
import { UserRoleAssignmentFiltersComponent } from '@idp-service/ui/user-role-assignment/filters/user-role-assignment-filters.component';
import { UserRoleEditorComponent } from '@idp-service/ui/user-role-assignment/role-editor/user-role-editor.component';
import { UserRoleAssignmentRoutingModule } from '@idp-service/ui/user-role-assignment/user-role-assignment-routing.module';
import { UserRoleAssignmentComponent } from '@idp-service/ui/user-role-assignment/user-role-assignment.component';

@NgModule({
	imports: [
		CommonUiModule,
		CommonFormsModule,
		ConfirmationDialogModule,
		ListingModule,
		TextFilterModule,
		IdpServiceFormattingModule,
		UserRoleAssignmentRoutingModule,
		UserSettingsModule
	],
	declarations: [
		UserRoleAssignmentComponent,
		UserRoleAssignmentFiltersComponent,
		UserRoleEditorComponent
	]
})
export class UserRoleAssignmentModule { }
