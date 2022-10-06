import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
	selector: 'app-api-key-popup-dialog',
	templateUrl: './api-key-popup.component.html',
	styleUrls: ['./api-key-popup.component.scss']
})
export class ApiKeyPopupDialogComponent {

	constructor(
		public dialogRef: MatDialogRef<ApiKeyPopupDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public key: string
	) {
	}
}
