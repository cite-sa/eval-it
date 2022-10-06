
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { BaseComponent } from '@common/base/base.component';
import { FormService } from '@common/forms/form-service';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { PopupNotificationDialogComponent } from '@common/modules/notification/popup/popup-notification.component';
import { PopupNotification, SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { UserService } from '@user-service/services/http/user.service';
import { CropperComponent, ImageCropperResult } from 'angular-cropperjs';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-user-profile-picture-editor',
	templateUrl: './profile-picture-editor.component.html',
	styleUrls: ['./profile-picture-editor.component.scss']
})
export class UserProfilePictureEditorDialogComponent extends BaseComponent implements OnInit {

	@ViewChild('angularCropper') public angularCropper: CropperComponent;
	uploadedImage: any;
	croppedImage: any;
	croppedImageBlob: Blob;
	cropperConfig = {
		aspectRatio: 1 / 1,
		viewMode: 1,
		dragMode: 'move',
		movable: true,
		scalable: true,
		zoomable: true,
	};
	// cropboxConfig: Cropper.CropBoxData = { width: 200, height: 200, left: 150, top: 150 };

	constructor(
		private userService: UserService,
		public appEnumUtils: AppEnumUtils,
		private formService: FormService,
		private uiNotificationService: UiNotificationService,
		private httpErrorHandlingService: HttpErrorHandlingService,
		public dialogRef: MatDialogRef<PopupNotificationDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public notification: PopupNotification
	) {
		super();
	}

	ngOnInit(): void {

	}

	public close(): void {
		this.dialogRef.close();
	}

	onCallbackSuccess(): void {

	}

	onCallbackError(errorResponse: HttpErrorResponse) {
		const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
		this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
	}

	imageUploaded(files: FileList) {
		// this.uploadedImage = items[0];

		if (files.length === 0) { return; }

		const mimeType = files[0].type;
		if (mimeType.match(/image\/*/) == null) {
			// this.message = "Only images are supported.";
			return;
		}

		const reader = new FileReader();
		reader.readAsDataURL(files[0]);
		reader.onload = (_event) => {
			this.uploadedImage = reader.result;
		};
	}

	crop() {
		const image = this.angularCropper.cropper.getCroppedCanvas({ width: 300, height: 300 });

		image.toBlob((blob) => {
			const reader = new FileReader();
			reader.readAsDataURL(blob);
			reader.onload = (_event) => {
				this.croppedImage = reader.result;
			};

			this.croppedImageBlob = blob;


		});
	}

	uploadImage() {
		this.userService.updateUserProfilePicture(this.croppedImageBlob).pipe(takeUntil(this._destroyed)).subscribe((text) => {
			this.dialogRef.close({ imageFileRef: text, image: this.croppedImage } as ProfilePictureEditorDialogResult);
		});
	}
}

export interface ProfilePictureEditorDialogResult {
	imageFileRef: string;
	image: any;
}
