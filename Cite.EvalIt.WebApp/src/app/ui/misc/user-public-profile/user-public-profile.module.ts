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
import { UserPublicProfileComponent } from '@app/ui/misc/user-public-profile/user-public-profile.component';
import { UserPublicProfileRoutingModule } from '@app/ui/misc/user-public-profile/user-public-profile-routing.module';
import { AppUserModule } from '@app/ui/app-user/app-user.module';
import { DataObjectModule } from '@app/ui/data-object/data-object.module';

@NgModule({
	imports: [
		CommonUiModule,
		CommonFormsModule,
		ConfirmationDialogModule,
		ListingModule,
		TextFilterModule,
		FormattingModule,
		UserPublicProfileRoutingModule,
		TimePickerModule,
		AutoCompleteModule,
		TotpModule,
		MatDatetimepickerModule,
		EditorActionsModule,
		UserSettingsModule,
		AppUserModule,
		DataObjectModule
	],
	declarations: [
		UserPublicProfileComponent
	]
})
export class UserPublicProfileModule { }
