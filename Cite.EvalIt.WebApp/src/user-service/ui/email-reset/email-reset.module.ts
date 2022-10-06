import { NgModule } from '@angular/core';
import { CommonFormsModule } from '@common/forms/common-forms.module';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { DeclineEmailResetComponent } from '@user-service/ui/email-reset/decline/decline-email-reset.component';
import { EmailResetRoutingModule } from '@user-service/ui/email-reset/email-reset-routing.module';
import { EmailResetComponent } from '@user-service/ui/email-reset/email-reset.component';
import { NgxCaptchaModule } from 'ngx-captcha';

@NgModule({
	imports: [
		CommonUiModule,
		CommonFormsModule,
		NgxCaptchaModule,
		EmailResetRoutingModule
	],
	declarations: [
		EmailResetComponent,
		DeclineEmailResetComponent
	],
	entryComponents: []
})
export class EmailResetModule { }
