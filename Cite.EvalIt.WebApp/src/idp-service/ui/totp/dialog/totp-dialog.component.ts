import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
	selector: 'app-totp-dialog',
	templateUrl: './totp-dialog.component.html',
	styleUrls: ['./totp-dialog.component.scss']
})
export class TotpDialogComponent implements OnInit {

	formGroup: FormGroup;

	constructor(
		public dialogRef: MatDialogRef<TotpDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {
		this.dialogRef.disableClose = true;
	}

	ngOnInit() {
		this.formGroup = new FormBuilder().group({ totp: new FormControl({ value: '', disabled: false }, [Validators.required]) });
	}

	cancel() {
		this.dialogRef.close(null);
	}

	confirm() {
		if (!this.formGroup.get('totp').value || this.formGroup.get('totp').value.length === 0) { return; }
		this.dialogRef.close(this.formGroup.get('totp').value);
	}
}
