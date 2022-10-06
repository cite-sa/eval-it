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
import { MyNetworkListingFiltersComponent } from '@app/ui/my-network/my-network-listing/filters/my-network-listing-filters.component';
import { MyNetworkListingComponent } from '@app/ui/my-network/my-network-listing/my-network-listing.component';
import { MyNetworkRoutingModule } from '@app/ui/my-network/my-network-routing.module';
import { MyNetworkEditorComponent } from '@app/ui/my-network/my-network-editor/my-network-editor.component';

@NgModule({
	imports: [
		CommonUiModule,
		CommonFormsModule,
		ConfirmationDialogModule,
		ListingModule,
		TextFilterModule,
		FormattingModule,
		TimePickerModule,
		AutoCompleteModule,
		TotpModule,
		MatDatetimepickerModule,
		EditorActionsModule,
		UserSettingsModule,
		MyNetworkRoutingModule
	],
	declarations: [
		MyNetworkListingComponent,
		MyNetworkListingFiltersComponent,
		MyNetworkEditorComponent
	]
})
export class MyNetworkModule { }
