import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReviewAnonymity } from '@app/core/enum/review-anonymity.enum';
import { ReviewVisibility } from '@app/core/enum/review-visibility.enum';

@Component({
  selector: 'app-review-settings-dialog',
  templateUrl: './review-settings-dialog.component.html',
  styleUrls: ['./review-settings-dialog.component.css']
})
export class ReviewSettingsDialogComponent {

  visibilityType = ReviewVisibility;
  anonymityType = ReviewAnonymity;

	constructor(
		public dialogRef: MatDialogRef<ReviewSettingsDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {
	}

	select(visibility: ReviewVisibility, anonymity: ReviewAnonymity = null) {
    this.dialogRef.close({visibility: visibility, anonymity: anonymity});
  }
}
