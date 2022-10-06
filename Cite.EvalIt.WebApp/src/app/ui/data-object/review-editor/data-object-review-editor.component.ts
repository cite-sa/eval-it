import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { IsActive } from '@app/core/enum/is-active.enum';
import { AppPermission } from '@app/core/enum/permission.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { AuthService } from '@app/core/services/ui/auth.service';
import { FormService } from '@common/forms/form-service';
import { LoggingService } from '@common/logging/logging-service';
import { ConfirmationDialogComponent } from '@common/modules/confirmation-dialog/confirmation-dialog.component';
import { HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { Guid } from '@common/types/guid';
import { TranslateService } from '@ngx-translate/core';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { FilterService } from '@common/modules/text-filter/filter-service';
import { DatePipe } from '@angular/common';
import { QueryParamsService } from '@app/core/services/ui/query-params.service';
import { nameof } from 'ts-simple-nameof';
import { BaseEditor } from '@common/base/base-editor';
import { DataObject } from '@app/core/model/data-object/data-object.model';
import { DataObjectService } from '@app/core/services/http/data-object.service';
import { DataObjectReviewEditorModel, ReviewEvaluationDataModel } from '@app/ui/data-object/review-editor/data-object-review-editor.model';
import { AbsoluteDecimalEvaluation, AbsoluteIntegerEvaluation, DataObjectReview, DataObjectReviewPersist, PercentageEvaluation, ReviewEvaluation, ScaleEvaluation, SelectionEvaluation, TextEvaluation } from '@app/core/model/data-object/data-object-review.model';
import { DataObjectReviewEditorResolver } from '@app/ui/data-object/review-editor/data-object-review-editor.resolver';
import { DataObjectType } from '@app/core/model/data-object-type/data-object-type.model';
import { BaseEvaluationOption } from '@app/core/model/data-object-type/evaluation-configuration.model';
import { ReviewVisibility } from '@app/core/enum/review-visibility.enum';
import { ReviewAnonymity } from '@app/core/enum/review-anonymity.enum';
import { EvaluationConfigurationType } from '@app/core/enum/evaluation-configuration-type.enum';
import { ReviewEvaluationType } from '@app/core/enum/review-evaluation-type.enum';
import { DataObjectTypeEditorModel } from '@app/ui/data-object-type/editor/data-object-type-editor.model';
import { DataObjectTypeService } from '@app/core/services/http/data-object-type.service';
import { DataObjectTypeEditorResolver } from '@app/ui/data-object-type/editor/data-object-type-editor.resolver';
import { DataObjectReviewService } from '@app/core/services/http/data-object-review.service';
import { ReviewSettingsDialogComponent } from '@app/ui/misc/review-settings-dialog/review-settings-dialog.component';

@Component({
	selector: 'app-data-object-review-editor',
	templateUrl: './data-object-review-editor.component.html',
	styleUrls: ['./data-object-review-editor.component.scss']
})
export class DataObjectReviewEditorComponent extends BaseEditor<DataObjectReviewEditorModel, DataObjectReview> implements OnInit {

	isNew = true;
	isDeleted = false;
	saveClicked = false;
	formGroup: FormGroup = null;
	type: DataObjectType = null;
	review: DataObjectReview = null;

	id: Guid;
	objId: Guid;

	userId: Guid = null;
	userIdHash: string = null;

	anonymityType = ReviewAnonymity;
	anonymityTypeKeys = [];

	visibilityType = ReviewVisibility;
	visibilityTypeKeys = [];

	removedOptionIds = null;
	addedOptionIds = null;

	objectTypeRevised = false;

	constructor(
		// BaseFormEditor injected dependencies
		protected dialog: MatDialog,
		protected language: TranslateService,
		protected formService: FormService,
		protected router: Router,
		protected uiNotificationService: UiNotificationService,
		protected httpErrorHandlingService: HttpErrorHandlingService,
		protected filterService: FilterService,
		protected datePipe: DatePipe,
		protected route: ActivatedRoute,
		protected queryParamsService: QueryParamsService,
		// Rest dependencies. Inject any other needed deps here:
		public authService: AuthService,
		public enumUtils: AppEnumUtils,
		private dataObjectService: DataObjectService,
		private dataObjectReviewService: DataObjectReviewService,
		private dataObjectTypeService: DataObjectTypeService,
		private logger: LoggingService
	) {
		super(dialog, language, formService, router, uiNotificationService, httpErrorHandlingService, filterService, datePipe, route, queryParamsService);
		this.anonymityTypeKeys = Object.keys(ReviewAnonymity).filter((item) => isFinite(Number(item))).map(item => Number(item));
		this.visibilityTypeKeys = Object.keys(ReviewVisibility).filter((item) => isFinite(Number(item))).map(item => Number(item));

	}

	ngOnInit(): void {
		const entity = this.route.snapshot.data['entity'] as DataObject;
		if(entity) {
			this.route.url.pipe(switchMap(data => {
				this.objId = Guid.parse(data[0].path);
				this.id = Guid.parse(data[2].path);
				
				this.review = entity.reviews.find(x => x.id == this.id && x.isActive == IsActive.Active);

				return this.dataObjectTypeService.getSingle(this.review ? this.review.dataObjectType.id : entity.dataObjectTypeId, DataObjectTypeEditorResolver.lookupFields());
			}))
			.subscribe(currentType => {
				if(this.review) {
					if( currentType.updatedAt > this.review.dataObjectType.updatedAt ) {
							
						let inactiveOptionIds = currentType.config.evalOptions.filter(o => o.isActive == IsActive.Inactive).map(o => o.optionId);
						this.removedOptionIds = this.review.dataObjectType.config.evalOptions.filter(o => o.isActive == IsActive.Active && inactiveOptionIds.includes(o.optionId)).map(y => y.optionId);
						
						let addedOptions = currentType.config.evalOptions.filter(o => o.isActive == IsActive.Active && !this.review.dataObjectType.config.evalOptions.map(u => u.optionId).includes(o.optionId));
						this.addedOptionIds = addedOptions.map(o => o.optionId);
						
						let addedAttributes =  addedOptions ? addedOptions.map(x => this.dataObjectAttributesFromOptions(x)) : []
						
						this.review.evaluationData.evaluations.push(...addedAttributes);
						this.review.dataObjectType.config.evalOptions = currentType.config.evalOptions.map(x => {x.isActive = this.removedOptionIds.includes(x.optionId) ? IsActive.Active : x.isActive; return x});
					}
					this.type = this.review.dataObjectType;
					this.type.info = null;
					this.prepareForm(this.review);
					this.isNew = false;
				}
				else {
					this.type = currentType;
					this.prepareForm(null);
					this.formGroup.get('dataObjectId').setValue(this.objId);
					if( this.type.config?.evalOptions) 
					{
						this.editorModel.evaluationData = new ReviewEvaluationDataModel().fromModel({ evaluations: this.type.config.evalOptions.filter(x => x.isActive == IsActive.Active).map(x => this.dataObjectAttributesFromOptions(x))});
						this.formGroup.setControl('evaluationData', this.editorModel.evaluationData.buildForm(null, false));
					}
				}
			})
		}

		this.route.queryParamMap.pipe(takeUntil(this._destroyed)).subscribe((params: ParamMap) => {
			// If lookup is on the query params load it
			if (params.keys.length > 0 && params.has('lookup')) {
				this.lookupParams = this.queryParamsService.deSerializeLookup(params.get('lookup'));
			}
			// Wrong data object id
			if(!entity) this.router.navigate(['../../../..'], { relativeTo: this.route, queryParams: { 'lookup': this.queryParamsService.serializeLookup(this.lookupParams), 'lv': ++this.lv }, replaceUrl: true });// ! lv is always zero . replaceUrl?
		});

	}

	getItem(itemId: Guid, successFunction: (item: DataObjectReview) => void): void {
		this.dataObjectService.getSingle(itemId, DataObjectReviewEditorResolver.lookupFields())
			.pipe(map(data => data as DataObject), takeUntil(this._destroyed))
			.subscribe(
				data => successFunction(data.reviews.find(x => x.id)),
				error => this.onCallbackError(error)
			);
	}

	prepareForm(data: DataObjectReview): void {
		try {
			this.editorModel = data ? new DataObjectReviewEditorModel().fromPair(data,this.objId) : new DataObjectReviewEditorModel();
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
				if(result.anonymity == null) this.formSubmitSettings(result.visibility);
				else this.formSubmitSettings(result.visibility, result.anonymity);
			}
		})
	}

	formSubmitSettings(visibility: ReviewVisibility, anonymity: ReviewAnonymity = ReviewAnonymity.Signed): void {
		this.formGroup.get('anonymity').setValue(anonymity);
		this.formGroup.get('visibility').setValue(visibility);

		this.persistEntity();
	}

	formSubmit(): void {
		this.formService.touchAllFormFields(this.formGroup);
		if ((!this.isFormDisabled() && !this.isFormValid()) || this.isUnresolved()) {
			return;
		}

		if ( this.userIdHash ) {
			this.formGroup.get('userId').setValue(null);
			this.formGroup.get('userIdHash').setValue(this.userIdHash);
		}
		else {
			this.formGroup.get('userId').setValue(this.userId ? this.userId : this.authService.userId().toString());
			this.formGroup.get('userIdHash').setValue(null);
		}

		this.dialogThenSubmit();
	}
	
	public delete() {
		const value = this.formGroup.getRawValue();
		if (value.id) {
			const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
				maxWidth: '300px',
				data: {
					message: this.language.instant('COMMONS.CONFIRMATION-DIALOG.DELETE-ITEM'),
					confirmButton: this.language.instant('COMMONS.CONFIRMATION-DIALOG.ACTIONS.CONFIRM'),
					cancelButton: this.language.instant('COMMONS.CONFIRMATION-DIALOG.ACTIONS.CANCEL')
				}
			});
			dialogRef.afterClosed().pipe(takeUntil(this._destroyed)).subscribe(result => {
				if (result) {
					this.dataObjectReviewService.delete(this.objId, value).pipe(takeUntil(this._destroyed))
						.subscribe(
							_ => this.onCallbackSuccess(),
							error => this.onCallbackError(error)
						);
				}
			});
		}
	}

	refreshData(): void {
		this.getReview(this.objId, this.editorModel.id, (data: DataObjectReview) => this.prepareForm(data));
	}

	refreshOnNavigateToData(id?: Guid): void {
		if (this.isNew) {
			this.formGroup.markAsPristine();
			this.router.navigate(['/data-object/' + (id ? id : this.objId)], { queryParams: { 'lookup': this.queryParamsService.serializeLookup(this.lookupParams), 'lv': ++this.lv }, replaceUrl: true });
		} else { this.refreshData(); }
	}

	persistEntity(onSuccess?: (response) => void) : void {
		if( this.objectTypeRevised) this.formGroup.setControl('dataObjectType', new DataObjectTypeEditorModel().fromModel(this.type).buildForm());

		const reviewValue : DataObjectReviewPersist = this.formService.getValue(this.formGroup.value);
		var objectFields =  [ nameof<DataObject>(x => x.id) ]

		this.dataObjectReviewService.persist(this.objId, reviewValue, objectFields)
		.pipe(takeUntil(this._destroyed)).subscribe(
			complete => onSuccess ? onSuccess(complete) : this.onCallbackSuccess(complete),
			error => this.onCallbackError(error)
		);
	}

	onCallbackSuccess(data?: any): void {
		this.uiNotificationService.snackBarNotification(this.isNew ? this.language.instant('COMMONS.SNACK-BAR.SUCCESSFUL-CREATION') : this.language.instant('COMMONS.SNACK-BAR.SUCCESSFUL-UPDATE'), SnackBarNotificationLevel.Success);
		this.refreshOnNavigateToData(data ? data.dataObjectId : null);
	}

	buildForm() {
		this.formGroup = this.editorModel.buildForm(null, !this.authService.hasPermission(AppPermission.EditDataObjectReview));
	}

	isTabDisabled() {
		return this.formGroup.get('evaluationData')?.get('evaluations').value.length == 0;
	}

	getOptionById(optionId: Guid): BaseEvaluationOption
	{
		var x = this.type?.config?.evalOptions.find(x => x?.optionId == optionId);
		return x;
	}

	removeUnresolvedAttribute(formGroup: FormGroup) {
		this.type.config.evalOptions.find(c => c.optionId == formGroup.value.optionId).isActive = IsActive.Inactive;
		formGroup.disable();
		this.removedOptionIds = this.removedOptionIds.filter(x => x != formGroup.value.optionId)
		this.addedOptionIds = this.addedOptionIds.filter(x => x != formGroup.value.optionId)
		this.objectTypeRevised = true;
	}

	addUnresolvedAttribute(formGroup: FormGroup) {
		this.addedOptionIds = this.addedOptionIds.filter(x => x != formGroup.value.optionId)
		this.removedOptionIds = this.removedOptionIds.filter(x => x != formGroup.value.optionId)
		this.objectTypeRevised = true;
	}

	isAdded(optionId: Guid) {
		return this.addedOptionIds != null ? this.addedOptionIds.includes(optionId) : false;
	}

	isRemoved(optionId: Guid) {
		return this.removedOptionIds  != null ? this.removedOptionIds.includes(optionId) : false;
	}

	isUnresolved() {
		return (this.removedOptionIds && this.removedOptionIds.length > 0 ) || ( this.addedOptionIds && this.addedOptionIds.length);
	}
	
	getReview(itemId: Guid, reviewId: Guid, successFunction: (item: DataObjectReview) => void): void {
		this.dataObjectService.getSingle(itemId, DataObjectReviewEditorResolver.lookupFields())
			.pipe(map(data => data as DataObject), takeUntil(this._destroyed))
			.subscribe(
				data => successFunction( data?.reviews.find(x => x.id == reviewId)),
				error => this.onCallbackError(error)
			);
	}

	visibilityChange(item: any)
	{
		if( item.value == ReviewVisibility.Trusted || item.value == ReviewVisibility.Private) this.formGroup.get('anonymity').setValue(ReviewAnonymity.Signed);
	}

	dataObjectAttributesFromOptions( option: BaseEvaluationOption) : ReviewEvaluation {
        switch (option.optionType) {
          case EvaluationConfigurationType.AbsoluteDecimalEvaluationOption: {
            const v : AbsoluteDecimalEvaluation = { optionId : option.optionId, evaluationType : ReviewEvaluationType.AbsoluteDecimalEvaluation, values : [] }
            return v;
          }
          case EvaluationConfigurationType.AbsoluteIntegerEvaluationOption: {
            const v : AbsoluteIntegerEvaluation = { optionId : option.optionId, evaluationType : ReviewEvaluationType.AbsoluteIntegerEvaluation, values : [] }
            return v;
          }
          case EvaluationConfigurationType.PercentageEvaluationOption: {
            const v : PercentageEvaluation = { optionId : option.optionId, evaluationType : ReviewEvaluationType.PercentageEvaluation, values : [] }
            return v;
          }
          case EvaluationConfigurationType.TextEvaluationOption: {
            const v : TextEvaluation = { optionId : option.optionId, evaluationType : ReviewEvaluationType.TextEvaluation, values : [] }
            return v;
          }
          case EvaluationConfigurationType.ScaleEvaluationOption: {
            const v : ScaleEvaluation = { optionId : option.optionId, evaluationType : ReviewEvaluationType.ScaleEvaluation, values : [] }
            return v;
          }
          case EvaluationConfigurationType.SelectionEvaluationOption: {
            const v : SelectionEvaluation = { optionId : option.optionId, evaluationType : ReviewEvaluationType.SelectionEvaluation, values : [] }
            return v;
          }
          default:
            break;
        }
	}

	public cancel(): void {
		this.router.navigate(['../../..'], { relativeTo: this.route, queryParams: { 'lookup': this.queryParamsService.serializeLookup(this.lookupParams), 'lv': ++this.lv }, replaceUrl: true });// ! lv is always zero . replaceUrl?
	}
}
