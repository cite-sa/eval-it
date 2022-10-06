import { NgModule } from '@angular/core';
import { FormattingModule } from '@app/core/formatting/formatting.module';
import { CommonFormsModule } from '@common/forms/common-forms.module';
import { ConfirmationDialogModule } from '@common/modules/confirmation-dialog/confirmation-dialog.module';
import { ListingModule } from '@common/modules/listing/listing.module';
import { TextFilterModule } from '@common/modules/text-filter/text-filter.module';
import { UserSettingsModule } from '@common/modules/user-settings/user-settings.module';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { IdpServiceFormattingModule } from '@idp-service/core/formatting/formatting.module';
import { SendInvitationPopupComponent } from '@idp-service/ui/send-invitation-popup/send-invitation-popup.component';
import { TotpModule } from '@idp-service/ui/totp/totp.module';
import { UserPassOverrideDialogModule } from '@idp-service/ui/user-pass-override-dialog/user-pass-override-dialog.module';
import { UserServiceFormattingModule } from '@user-service/core/formatting/formatting.module';
import { UserCredentialsEditorComponent } from '@user-service/ui/users/editor/user-credentials/user-credentials-editor.component';
import { UserEditorComponent } from '@user-service/ui/users/editor/user-editor.component';
import { UserRolesEditorComponent } from '@user-service/ui/users/editor/user-roles/user-roles-editor.component';
import { UserListingFiltersComponent } from '@user-service/ui/users/listing/filters/user-listing-filters.component';
import { UserListingComponent } from '@user-service/ui/users/listing/user-listing.component';
import { UserRoutingModule } from '@user-service/ui/users/user-routing.module';

@NgModule({
	imports: [
		CommonUiModule,
		CommonFormsModule,
		ConfirmationDialogModule,
		ListingModule,
		TextFilterModule,
		UserServiceFormattingModule,
		IdpServiceFormattingModule,
		UserRoutingModule,
		UserSettingsModule,
		TotpModule,
		UserPassOverrideDialogModule,
		FormattingModule
	],
	declarations: [
		UserListingComponent,
		UserEditorComponent,
		UserListingFiltersComponent,
		SendInvitationPopupComponent,
		UserRolesEditorComponent,
		UserCredentialsEditorComponent
	],
	entryComponents: [
		SendInvitationPopupComponent
	]
})
export class UserModule { }
