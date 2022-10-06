import { NgModule } from '@angular/core';
import { CommonFormsModule } from '@common/forms/common-forms.module';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { TotpDialogComponent } from '@idp-service/ui/totp/dialog/totp-dialog.component';
import { TotpInputComponent } from '@idp-service/ui/totp/totp-input/totp-input.component';
import { TotpService } from '@idp-service/ui/totp/totp.service';

@NgModule({
	imports: [
		CommonUiModule,
		CommonFormsModule,
	],
	declarations: [
		TotpInputComponent,
		TotpDialogComponent
	],
	exports: [
		TotpDialogComponent,
		TotpInputComponent
	],
	entryComponents: [
		TotpDialogComponent
	],
	providers: [
		TotpService
	]
})
export class TotpModule { }
