import { NgModule } from '@angular/core';
import { CommonFormsModule } from '@common/forms/common-forms.module';
import { ConfirmationDialogModule } from '@common/modules/confirmation-dialog/confirmation-dialog.module';
import { ListingModule } from '@common/modules/listing/listing.module';
import { TextFilterModule } from '@common/modules/text-filter/text-filter.module';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { IdpServiceFormattingModule } from '@idp-service/core/formatting/formatting.module';
import { TotpModule } from '@idp-service/ui/totp/totp.module';
import { UserServiceFormattingModule } from '@user-service/core/formatting/formatting.module';
import { ApiClientRoutingModule } from '@user-service/ui/api-client/api-client-routing.module';
import { ApiClientEditorComponent } from '@user-service/ui/api-client/editor/api-client-editor.component';
import { ApiClientKeysEditorComponent } from '@user-service/ui/api-client/editor/api-client-keys/api-client-keys-editor.component';
import { ApiClientRolesEditorComponent } from '@user-service/ui/api-client/editor/api-client-roles/api-client-roles-editor.component';
import { ApiKeyPopupDialogComponent } from '@user-service/ui/api-client/editor/api-key-popup/api-key-popup.component';
import { ApiClientListingComponent } from '@user-service/ui/api-client/listing/api-client-listing.component';
import { ApiClientListingFiltersComponent } from '@user-service/ui/api-client/listing/filters/api-client-listing-filters.component';
import { UserSettingsModule } from '@common/modules/user-settings/user-settings.module';

@NgModule({
	imports: [
		CommonUiModule,
		CommonFormsModule,
		ConfirmationDialogModule,
		ListingModule,
		TextFilterModule,
		UserServiceFormattingModule,
		IdpServiceFormattingModule,
		TotpModule,
		ApiClientRoutingModule,
		UserSettingsModule
	],
	declarations: [
		ApiClientListingComponent,
		ApiClientEditorComponent,
		ApiClientListingFiltersComponent,
		ApiKeyPopupDialogComponent,
		ApiClientRolesEditorComponent,
		ApiClientKeysEditorComponent
	],
	entryComponents: [
		ApiKeyPopupDialogComponent
	]
})
export class ApiClientModule { }
