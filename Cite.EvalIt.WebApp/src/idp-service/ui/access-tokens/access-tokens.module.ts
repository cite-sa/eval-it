import { NgModule } from '@angular/core';
import { ConfirmationDialogModule } from '@common/modules/confirmation-dialog/confirmation-dialog.module';
import { ListingModule } from '@common/modules/listing/listing.module';
import { TextFilterModule } from '@common/modules/text-filter/text-filter.module';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { AccessTokensRoutingModule } from '@idp-service/ui/access-tokens/access-tokens-routing.module';
import { AccessTokenListingComponent } from '@idp-service/ui/access-tokens/listing/access-token-listing.component';
import { AccessTokenListingFiltersComponent } from '@idp-service/ui/access-tokens/listing/filters/access-token-listing-filters.component';
import { UserSettingsModule } from '@common/modules/user-settings/user-settings.module';
import { CommonFormsModule } from '@common/forms/common-forms.module';

@NgModule({
	imports: [
		CommonUiModule,
		CommonFormsModule,
		ConfirmationDialogModule,
		ListingModule,
		TextFilterModule,
		AccessTokensRoutingModule,
		UserSettingsModule
	],
	declarations: [
		AccessTokenListingComponent,
		AccessTokenListingFiltersComponent
	],
})
export class AccessTokensModule { }
