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
import { DataObjectTypeListingComponent } from '@app/ui/data-object-type/listing/data-object-type-listing.component';
import { DataObjectTypeRoutingModule } from '@app/ui/data-object-type/data-object-type-routing.module';
import { DataObjectTypeListingFiltersComponent } from '@app/ui/data-object-type/listing/filters/data-object-type-listing-filters.component';
import { DataObjectTypeEditorComponent } from '@app/ui/data-object-type/editor/data-object-type-editor.component';
import { RegistrationInformationFieldComponent } from './editor/registration-information-field/registration-information-field.component';
import { RegistrationInformationInactiveFieldComponent } from './editor/registration-information-inactive-field/registration-information-inactive-field.component';
import { EvaluationConfigurationFieldComponent } from '@app/ui/data-object-type/editor/evaluation-configuration-field/evaluation-configuration-field.component';
import { EvaluationConfigurationInactiveFieldComponent } from '@app/ui/data-object-type/editor/evaluation-configuration-inactive-field/evaluation-configuration-inactive-field.component';
import { DataObjectTypeRankingMethodologyEditorComponent } from '@app/ui/data-object-type/ranking-methodology-editor/data-object-type-ranking-methodology-editor.component';
import { RankingProfileFieldComponent } from '@app/ui/data-object-type/ranking-methodology-editor/ranking-profile-field/ranking-profile-field.component';
import { DataObjectTypeRankingMethodologyListingComponent } from '@app/ui/data-object-type/ranking-methodology-listing/ranking-methodology-listing.component';
import { DataObjectTypeRankingMethodologyListingFiltersComponent } from '@app/ui/data-object-type/ranking-methodology-listing/filters/ranking-methodology-listing-filters.component';
import { RankingProfileInactiveFieldComponent } from '@app/ui/data-object-type/ranking-methodology-editor/ranking-profile-inactive-field/ranking-profile-inactive-field.component';
import { ObjectRankRecalculationStrategyFieldComponent } from '@app/ui/data-object-type/editor/object-rank-recalculation-strategy-field/object-rank-recalculation-strategy-field.component';
import { PartitionFormDisplayComponent } from './editor/object-rank-recalculation-strategy-field/partition-form-display/partition-form-display.component';

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
		DataObjectTypeRoutingModule
	],
	declarations: [
		DataObjectTypeListingComponent,
		DataObjectTypeEditorComponent,
		DataObjectTypeListingFiltersComponent,
		RegistrationInformationFieldComponent,
		RegistrationInformationInactiveFieldComponent,
		EvaluationConfigurationFieldComponent,
		EvaluationConfigurationInactiveFieldComponent,
		ObjectRankRecalculationStrategyFieldComponent,
		DataObjectTypeRankingMethodologyEditorComponent,
		RankingProfileFieldComponent,
		RankingProfileInactiveFieldComponent,
		DataObjectTypeRankingMethodologyListingComponent,
		DataObjectTypeRankingMethodologyListingFiltersComponent,
  PartitionFormDisplayComponent,
	]
})
export class DataObjectTypeModule { }
