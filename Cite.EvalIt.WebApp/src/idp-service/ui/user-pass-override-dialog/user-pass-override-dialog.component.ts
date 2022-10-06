import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BaseComponent } from '@common/base/base.component';
import { PasswordMatchValidator } from '@common/forms/validation/custom-validator';

@Component({
	selector: 'app-user-pass-override-dialog.component',
	templateUrl: './user-pass-override-dialog.component.html',
	styleUrls: ['./user-pass-override-dialog.component.scss']
})
export class UserPassOverrideDialogComponent extends BaseComponent implements OnInit {
	formGroup: FormGroup;

	constructor(
		public dialogRef: MatDialogRef<UserPassOverrideDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private formBuilder: FormBuilder
	) {
		super();
		this.dialogRef.disableClose = true;
	}

	ngOnInit() {
		this.formGroup = this.formBuilder.group({
			username: [{ value: null, disabled: false }, [Validators.required]],
			password: [{ value: null, disabled: false }, [Validators.required]],
			passwordRepeat: [{ value: null, disabled: false }, [Validators.required]],
		}, {
			validator: PasswordMatchValidator('password', 'passwordRepeat')
		});
	}

	cancel() {
		this.dialogRef.close(null);
	}

	formSubmit() {
		if (!this.formGroup.valid) { return; }
		this.dialogRef.close(this.formGroup.value);
	}

	public hasPasswordMismatchError() {
		return this.formGroup.get('password').touched
			&& this.formGroup.get('passwordRepeat').touched
			&& this.formGroup.hasError('passwordMismatch');
	}
}
