import { ChangeDetectorRef, Component, DoCheck, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AppPermission } from '@app/core/enum/permission.enum';
import { DataObjectReviewFeedback, DataObjectReviewFeedbackPersist, FeedbackData } from '@app/core/model/data-object/data-object-review-feedback.model';
import { DataObjectService } from '@app/core/services/http/data-object.service';
import { AuthService } from '@app/core/services/ui/auth.service';
import { DataObjectReviewFeedbackModel } from '@app/ui/data-object/review-feedback-panel/data-object-review-feedback-panel.model';
import { FormService } from '@common/forms/form-service';
import { LoggingService } from '@common/logging/logging-service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { Guid } from '@common/types/guid';
import { TranslateService } from '@ngx-translate/core';
import { BaseComponent } from '@common/base/base.component';
import { takeUntil } from 'rxjs/operators';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ReviewVisibility } from '@app/core/enum/review-visibility.enum';
import { ReviewAnonymity } from '@app/core/enum/review-anonymity.enum';
import { DataObjectReviewFeedbackService } from '@app/core/services/http/data-object-review-feedback.service';
import { MatDialog } from '@angular/material/dialog';
import { ReviewSettingsDialogComponent } from '@app/ui/misc/review-settings-dialog/review-settings-dialog.component';

@Component({
	selector: 'app-data-object-review-feedback-panel',
	templateUrl: './data-object-review-feedback-panel.component.html',
	styleUrls: ['./data-object-review-feedback-panel.component.scss']
})
export class DataObjectReviewFeedbackPanelComponent extends BaseComponent implements OnInit, OnChanges, DoCheck {

	@Input() feedback: DataObjectReviewFeedback[] = [];
	@Input() objId: Guid;
	@Input() reviewId: Guid;

	@Output() nameClicked: EventEmitter<Guid> = new EventEmitter<Guid>();
	@Output() refreshReview: EventEmitter<void> = new EventEmitter<void>();

	likeUsers: any[] = [];
	likeCount: number = 0;
	anonymousCount: number = 0;
	formGroup: FormGroup = null;

	userId: Guid = null;
	userIdHash: string = null;

	visibilityType = ReviewVisibility;
	anonymityType = ReviewAnonymity;

	editorModel: DataObjectReviewFeedbackModel;

	constructor(
		protected dialog: MatDialog,
		public authService: AuthService,
		protected uiNotificationService: UiNotificationService,
		protected language: TranslateService,
		private logger: LoggingService,
		private dataObjectReviewFeedbackService: DataObjectReviewFeedbackService,
		protected formService: FormService,
		private readonly cdr: ChangeDetectorRef,
		protected httpErrorHandlingService: HttpErrorHandlingService
  ) { super(); }

	ngOnInit(): void {
		this.prepareForm(null);
	}

	ngOnChanges(changes: SimpleChanges): void {
		if(changes['feedback'] && !changes['feedback'].isFirstChange()) {
			if( this.feedback && this.feedback.filter(x => x.isMine).length > 0) {
				this.prepareForm(this.feedback.filter(x => x.isMine)[0])
			}
			this.initLikeValues();
		}
	}

	ngDoCheck(): void {}

	prepareForm(data: DataObjectReviewFeedback): void {
		try {
			this.editorModel = data ? new DataObjectReviewFeedbackModel().fromModel(data) : new DataObjectReviewFeedbackModel();
			this.buildForm();
			if(data) {
				if(data.userId) this.userId = data.userId;
				
				if(data.userIdHash) {
					this.userIdHash = data.userIdHash;
				}
			}
			else {
				this.userId = this.authService.userId().toString() as any;
			}
		} catch {
			this.logger.error('Could not parse Review: ' + data);
			this.uiNotificationService.snackBarNotification(this.language.instant('COMMONS.ERRORS.DEFAULT'), SnackBarNotificationLevel.Error);
		}
	}

	dialogThenSubmit(): void {
		const dialogRef = this.dialog.open(ReviewSettingsDialogComponent, {
			maxWidth: '300px',
			data: {}
		});
		dialogRef.afterClosed().pipe(takeUntil(this._destroyed)).subscribe(result => {
			if (result) {
				if(result.anonymity == null) this.formSubmit(result.visibility);
				else this.formSubmit(result.visibility, result.anonymity);
			}
		})
	}

	formSubmit(visibility: ReviewVisibility, anonymity: ReviewAnonymity = ReviewAnonymity.Signed): void {
		this.formService.touchAllFormFields(this.formGroup);
		if ((!this.isFormDisabled() && !this.isFormValid())) {
			return;
		}

		this.formGroup.get('anonymity').setValue(anonymity);
		this.formGroup.get('visibility').setValue(visibility);

		this.formGroup.get('dataObjectId').setValue(this.objId);
		this.formGroup.get('dataObjectReviewId').setValue(this.reviewId);

		if ( this.userIdHash ) {
			this.formGroup.get('userId').setValue(null);
			this.formGroup.get('userIdHash').setValue(this.userIdHash);
		}
		else {
			this.formGroup.get('userId').setValue(this.userId ? this.userId : this.authService.userId().toString());
			this.formGroup.get('userIdHash').setValue(null);
		}

		this.persistEntity(res => this.onRefreshReview());
	}

	public isFormValid() {
		return this.formGroup.valid;
	}

	public isFormDisabled() {
		return this.formGroup.disabled;
	}

	persistEntity(onSuccess?: (response) => void) : void {
		const feedbackValue : DataObjectReviewFeedbackPersist = this.formService.getValue(this.formGroup.value);

		this.dataObjectReviewFeedbackService.persist(this.objId, this.reviewId, feedbackValue)
		.pipe(takeUntil(this._destroyed)).subscribe(
			complete => onSuccess ? onSuccess(complete) : this.onCallbackSuccess(complete),
			error => this.onCallbackError(error)
		);
	}

	buildForm() {
		this.formGroup = this.editorModel.buildForm(null, !this.authService.hasPermission(AppPermission.EditDataObjectReviewFeedback));
	}

	onCallbackSuccess(data?: any): void {
		this.uiNotificationService.snackBarNotification(this.language.instant('COMMONS.SNACK-BAR.SUCCESSFUL-UPDATE'), SnackBarNotificationLevel.Success);
	}

	onCallbackError(errorResponse: HttpErrorResponse) {
		const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
		if (error.statusCode === 400) {
			this.editorModel.validationErrorModel.fromJSONObject(errorResponse.error);
			this.formService.validateAllFormFields(this.formGroup);
		} else {
			this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
		}
	}

	initLikeValues() {
		this.likeCount = this.feedback.filter(x => x.feedbackData.like).length;
		this.anonymousCount = this.feedback.filter(x => x.feedbackData.like && x.userId == null).length;
		this.likeUsers = this.feedback.filter(x => x.userId != null).map(x => x.user);
		this.likeUsers.push({id: null, name: null});
	}

	toggleLike() {
		let like = this.formGroup?.get('feedbackData.like').value;
		this.formGroup?.get('feedbackData.like').setValue(!like);
		if( like ) { 
			let tempCount = this.likeUsers.length;
			this.likeUsers = this.likeUsers.filter(x => x.id != this.authService.userId())
			if( this.likeUsers.length == tempCount ) this.anonymousCount--;
			this.likeCount--;
		}
		else {
			this.likeUsers = [{id: this.authService.userId(), name: this.authService.getPrincipalName()}].concat(this.likeUsers)
			this.likeCount++;
		}
		this.formGroup.markAsDirty();
		this.cdr.detectChanges();

  	}

	getLikeUsers() {
		let res : any[] = this.feedback?.filter(x => x.userId != null && !x.isMine).map(x => x.user) ?? [];
		if(this.formGroup.get('feedbackData.like').value) {
			res.push( {id: this.authService.userId(), name: this.authService.getPrincipalName()})
		}
		return res;
	}

	isMyFeedbackEmpty() : boolean {
		let fbData = this.formGroup?.value?.feedbackData as FeedbackData;
		if( fbData?.like ) return false;

		return true;
	}

	onUserClicked(id: Guid) {
		this.nameClicked.emit(id);
	}

	onRefreshReview() {
		this.refreshReview.emit();
		this.onCallbackSuccess();
	}
}
