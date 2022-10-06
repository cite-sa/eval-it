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
import { RankRecalculationTaskListingComponent } from '@app/ui/rank-recalculation-task/listing/rank-recalculation-task-listing.component';
import { RankRecalculationTaskRoutingModule } from '@app/ui/rank-recalculation-task/rank-recalculation-task-routing.module';
import { RankRecalculationTaskListingFiltersComponent } from '@app/ui/rank-recalculation-task/listing/filters/rank-recalculation-task-listing-filters.component';

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
		RankRecalculationTaskRoutingModule
	],
	declarations: [
		RankRecalculationTaskListingComponent,
		RankRecalculationTaskListingFiltersComponent
	]
})
export class RankRecalculationTaskModule { }
