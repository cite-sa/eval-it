import { NgModule } from '@angular/core';
import { CommonFormsModule } from '@common/forms/common-forms.module';
import { ConfirmationDialogModule } from '@common/modules/confirmation-dialog/confirmation-dialog.module';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { IdpServiceFormattingModule } from '@idp-service/core/formatting/formatting.module';
import { UserCredentialsComponent } from '@idp-service/ui/credentials/user-credentials.component';
import { TotpSetupModule } from '@idp-service/ui/totp-setup/totp-setup.module';
import { TotpModule } from '@idp-service/ui/totp/totp.module';
import { UserConsentsModule } from '@idp-service/ui/user-consents/user-consents.module';
import { UserProfileNotifierListModule } from '@notification-service/ui/user-profile/notifier-list/user-profile-notifier-list-editor.module';
import { UserServiceFormattingModule } from '@user-service/core/formatting/formatting.module';
import { UserProfileConsentsComponent } from '@user-service/ui/user-profile/consents/user-profile-consents.component';
import { UserProfileChangeEmailDialogComponent } from '@user-service/ui/user-profile/contact-info/change-email-dialog/change-email-dialog.component';
import { UserProfileContactInfoEditorComponent } from '@user-service/ui/user-profile/contact-info/contact-info-editor.component';
import { UserProfileForgetMeEditorComponent } from '@user-service/ui/user-profile/forget-me/user-profile-forget-me.component';
import { UserProfilePersonalInfoEditorComponent } from '@user-service/ui/user-profile/personal/personal-info-editor.component';
import { UserProfilePictureEditorDialogComponent } from '@user-service/ui/user-profile/profile/profile-picture-editor/profile-picture-editor.component';
import { UserProfileEditorComponent } from '@user-service/ui/user-profile/profile/user-profile-editor.component';
import { UserProfileRoutingModule } from '@user-service/ui/user-profile/user-profile-routing.module';
import { UserProfileComponent } from '@user-service/ui/user-profile/user-profile.component';
import { UserProfileWhatYouKnowAboutMeEditorComponent } from '@user-service/ui/user-profile/what-you-know-about-me/user-profile-what-you-know-about-me.component';
import { AngularCropperjsModule } from 'angular-cropperjs';

@NgModule({
	imports: [
		UserProfileRoutingModule,
		CommonUiModule,
		CommonFormsModule,
		UserServiceFormattingModule,
		IdpServiceFormattingModule,
		UserConsentsModule,
		UserProfileNotifierListModule,
		ConfirmationDialogModule,
		TotpSetupModule,
		TotpModule,
		AngularCropperjsModule,
	],
	declarations: [
		UserProfileEditorComponent,
		UserProfileChangeEmailDialogComponent,
		UserProfileConsentsComponent,
		UserProfileComponent,
		UserCredentialsComponent,
		UserProfilePersonalInfoEditorComponent,
		UserProfileForgetMeEditorComponent,
		UserProfileWhatYouKnowAboutMeEditorComponent,
		UserProfileContactInfoEditorComponent,
		UserProfilePictureEditorDialogComponent
	],
	entryComponents: [
		UserProfileChangeEmailDialogComponent,
		UserProfilePictureEditorDialogComponent
	]
})
export class UserProfileModule { }
