import { NgModule } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
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
import { DataObjectListingComponent } from '@app/ui/data-object/listing/data-object-listing.component';
import { DataObjectRoutingModule } from '@app/ui/data-object/data-object-routing.module';
import { DataObjectListingFiltersComponent } from '@app/ui/data-object/listing/filters/data-object-listing-filters.component';
import { DataObjectInfoComponent } from '@app/ui/data-object/info/data-object-info.component';
import { DataObjectTagListingComponent } from '@app/ui/data-object/tag-listing/data-object-tag-listing.component';
import { DataObjectTagListingFiltersComponent } from '@app/ui/data-object/tag-listing/filters/data-object-tag-listing-filters.component';
import { DataObjectTagEditorComponent } from '@app/ui/data-object/tag-editor/data-object-tag-editor.component';
import { DataObjectEditorComponent } from '@app/ui/data-object/editor/data-object-editor.component';
import { DataObjectAttributeFieldComponent } from '@app/ui/data-object/editor/data-object-attribute-field/data-object-attribute-field.component';
import { DataObjectAttributeInactiveFieldComponent } from '@app/ui/data-object/editor/data-object-attribute-inactive-field/data-object-attribute-inactive-field.component';
import { DataObjectViewerComponent } from './viewer/data-object-viewer.component';
import { DataObjectAttributeFieldViewerComponent } from '@app/ui/data-object/viewer/data-object-attribute-field/data-object-attribute-field-viewer.component';
import { DataObjectAttributeInactiveFieldViewerComponent } from '@app/ui/data-object/viewer/data-object-attribute-inactive-field-viewer/data-object-attribute-inactive-field-viewer.component';
import { DataObjectReviewListingComponent } from '@app/ui/data-object/review-listing/data-object-review-listing.component';
import { DataObjectReviewListingFiltersComponent } from '@app/ui/data-object/review-listing/filters/data-object-review-listing-filters.component';
import { DataObjectReviewFieldComponent } from '@app/ui/data-object/review-editor/data-object-review-field/data-object-review-field.component';
import { DataObjectReviewEditorComponent } from '@app/ui/data-object/review-editor/data-object-review-editor.component';
import { DataObjectReviewInactiveFieldComponent } from '@app/ui/data-object/review-editor/data-object-review-inactive-field/data-object-review-inactive-field.component';
import { DataObjectReviewTileComponent } from '@app/ui/data-object/review-tile/data-object-review-tile.component';
import { DataObjectReviewTileFieldComponent } from '@app/ui/data-object/review-tile/data-object-review-tile-field/data-object-review-tile-field.component';
import { DataObjectReviewTileInactiveFieldComponent } from '@app/ui/data-object/review-tile/data-object-review-tile-inactive-field/data-object-review-tile-inactive-field.component';
import { DataObjectReviewListingDisplayComponent } from '@app/ui/data-object/review-listing-display/data-object-review-listing-display.component';
import { DisplaySorterComponent } from './review-listing-display/display-sorter/display-sorter.component';
import { DataObjectReviewViewerComponent } from '@app/ui/data-object/review-viewer/data-object-review-viewer.component';
import { DataObjectReviewFieldViewerComponent } from '@app/ui/data-object/review-viewer/data-object-review-field-viewer/data-object-review-field-viewer.component';
import { DataObjectTileComponent } from '@app/ui/data-object/tile/data-object-tile.component';
import { DataObjectAttributeFieldTileComponent } from '@app/ui/data-object/tile/data-object-attribute-field/data-object-attribute-field-tile.component';
import { DataObjectAttributeInactiveFieldTileComponent } from '@app/ui/data-object/tile/data-object-attribute-inactive-field-tile/data-object-attribute-inactive-field-tile.component';
import { DataObjectReviewFeedbackPanelComponent } from './review-feedback-panel/data-object-review-feedback-panel.component';
import { MatMenuModule } from '@angular/material/menu';
import { DataObjectReviewFeedbackUserMenuComponent } from './review-feedback-panel/data-object-review-feedback-user-menu/data-object-review-feedback-user-menu.component';

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
		MatMenuModule,
		EditorActionsModule,
		UserSettingsModule,
		DataObjectRoutingModule,
		MatPaginatorModule
	],
	exports: [
		DataObjectReviewTileComponent,
		DataObjectTileComponent
	],
	declarations: [
		DataObjectListingComponent,
		DataObjectEditorComponent,
		DataObjectAttributeFieldComponent,
		DataObjectAttributeInactiveFieldComponent,
		DataObjectListingFiltersComponent,
		DataObjectInfoComponent,
		DataObjectTagListingComponent,
		DataObjectTagListingFiltersComponent,
		DataObjectTagEditorComponent,
		DataObjectReviewListingComponent,
		DataObjectReviewListingDisplayComponent,
		DataObjectReviewListingFiltersComponent,
		DataObjectReviewEditorComponent,
		DataObjectReviewFieldComponent,
		DataObjectReviewInactiveFieldComponent,
		DataObjectReviewTileComponent,
		DataObjectReviewTileFieldComponent,
		DataObjectReviewTileInactiveFieldComponent,
		DataObjectReviewViewerComponent,
		DataObjectReviewFieldViewerComponent,
		DataObjectViewerComponent,
		DataObjectTileComponent,
		DataObjectAttributeFieldTileComponent,
		DataObjectAttributeInactiveFieldTileComponent,
		DataObjectAttributeFieldViewerComponent,
		DataObjectAttributeInactiveFieldViewerComponent,
  		DisplaySorterComponent,
    	DataObjectReviewFeedbackPanelComponent,
     DataObjectReviewFeedbackUserMenuComponent
	]
})
export class DataObjectModule { }
