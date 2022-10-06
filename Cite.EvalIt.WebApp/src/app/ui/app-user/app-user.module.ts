import { NgModule } from '@angular/core';
import { FormattingModule } from '@app/core/formatting/formatting.module';
import { CommonFormsModule } from '@common/forms/common-forms.module';
import { AutoCompleteModule } from '@common/modules/auto-complete/auto-complete.module';
import { ConfirmationDialogModule } from '@common/modules/confirmation-dialog/confirmation-dialog.module';
import { ListingModule } from '@common/modules/listing/listing.module';
import { TextFilterModule } from '@common/modules/text-filter/text-filter.module';
import { TimePickerModule } from '@common/modules/time-picker/time-picker.module';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { TotpModule } from '@idp-service/ui/totp/totp.module';
import { MatDatetimepickerModule } from '@mat-datetimepicker/core';
import { EditorActionsModule } from '@app/ui/editor-actions/editor-actions.module';
import { UserSettingsModule } from '@common/modules/user-settings/user-settings.module';
import { AppUserRoutingModule } from '@app/ui/app-user/app-user-routing.module';
import { AppUserListingComponent } from '@app/ui/app-user/listing/app-user-listing.component';
import { AppUserListingFiltersComponent } from '@app/ui/app-user/listing/filters/app-user-listing-filters.component';
import { AppUserTagListingComponent } from '@app/ui/app-user/tag-listing/app-user-tag-listing.component';
import { AppUserTagEditorComponent } from '@app/ui/app-user/tag-editor/app-user-tag-editor.component';
import { AppUserInfoComponent} from './info/app-user-info.component';
import { AppUserNetworkListingComponent } from '@app/ui/app-user/network-listing/app-user-network-listing.component';
import { AppUserNetworkEditorComponent } from '@app/ui/app-user/network-editor/app-user-network-editor.component';
import { AppUserNetworkListingFiltersComponent } from '@app/ui/app-user/network-listing/filters/app-user-network-listing-filters.component';
import { AppUserTagListingFiltersComponent } from '@app/ui/app-user/tag-listing/filters/app-user-tag-listing-filters.component';

@NgModule({
	imports: [
		CommonUiModule,
		CommonFormsModule,
		ConfirmationDialogModule,
		ListingModule,
		TextFilterModule,
		FormattingModule,
		AppUserRoutingModule,
		TimePickerModule,
		AutoCompleteModule,
		TotpModule,
		MatDatetimepickerModule,
		EditorActionsModule,
		UserSettingsModule
	],
	exports: [
		AppUserTagListingComponent
	],
	declarations: [
		AppUserListingComponent,
		AppUserListingFiltersComponent,
  		AppUserTagListingComponent,
		AppUserTagListingFiltersComponent,
		AppUserTagEditorComponent,
		AppUserInfoComponent,
  		AppUserNetworkListingComponent,
		AppUserNetworkListingFiltersComponent,
    	AppUserNetworkEditorComponent
	]
})
export class AppUserModule { }
