import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QRCodeModule } from '@common/modules/qr-code/qr-code.module';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { TotpSetupComponent } from '@idp-service/ui/totp-setup/totp-setup.component';
import { TotpModule } from '@idp-service/ui/totp/totp.module';

@NgModule({
	imports: [
		CommonUiModule,
		FormsModule,
		QRCodeModule,
		TotpModule
	],
	declarations: [
		TotpSetupComponent,
	],
	exports: [
		TotpSetupComponent
	]
})
export class TotpSetupModule { }
