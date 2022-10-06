import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
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
import { BaseEditor } from '@common/base/base-editor';
import { FilterService } from '@common/modules/text-filter/filter-service';
import { DatePipe } from '@angular/common';
import { QueryParamsService } from '@app/core/services/ui/query-params.service';
import { DataObjectType } from '@app/core/model/data-object-type/data-object-type.model';
import { DataObjectTypeService } from '@app/core/services/http/data-object-type.service';
import { DataObjectTypeEditorResolver } from '@app/ui/data-object-type/editor/data-object-type-editor.resolver';
import { BaseRankingProfileModel, DataObjectTypeRankingMethodologyEditorModel, RankingConfigurationModel } from '@app/ui/data-object-type/ranking-methodology-editor/data-object-type-ranking-methodology-editor.model';
import { DataObjectTypeRankingMethodology } from '@app/core/model/data-object-type/ranking-methodology.model';
import { RankingProfileType } from '@app/core/enum/ranking-profile-type.enum';
import { EvaluationConfigurationType } from '@app/core/enum/evaluation-configuration-type.enum';
import { ScaleEvaluationOption, SelectionEvaluationOption } from '@app/core/model/data-object-type/evaluation-configuration.model';

@Component({
  selector: 'app-data-object-type-ranking-methodology-editor',
  templateUrl: './data-object-type-ranking-methodology-editor.component.html',
  styleUrls: ['./data-object-type-ranking-methodology-editor.component.css']
})
export class DataObjectTypeRankingMethodologyEditorComponent extends BaseEditor<DataObjectTypeRankingMethodologyEditorModel, DataObjectTypeRankingMethodology> implements OnInit {

	isNew = true;
	isUsed = false;
	isDeleted = false;
	saveClicked = false;
	formGroup: FormGroup = null;
	
	methodology: DataObjectTypeRankingMethodology;
	type: DataObjectType;
	id: Guid;
	missingOptIds: Guid[] = [];

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
		private dataObjectTypeService: DataObjectTypeService,
		private logger: LoggingService,
		private readonly cdr: ChangeDetectorRef
	) {
		super(dialog, language, formService, router, uiNotificationService, httpErrorHandlingService, filterService, datePipe, route, queryParamsService);
	}

	ngOnInit(): void {
		this.route.url.subscribe((data => {
			const entity = this.route.snapshot.data['entity'] as DataObjectType;
			if(entity) {
				this.type = entity;
				this.id = Guid.parse(data[2].path);
				
				const tmp = entity.rankingMethodologies?.filter(x => x.id == this.id) ?? [];
				this.methodology = tmp.length > 0 ? tmp[0] : null ;

				this.isNew = this.methodology == null;
				this.prepareForm(this.methodology);
				this.formGroup.get('dataObjectTypeId').setValue(this.type.id);
				this.addMissingProfiles();
				this.removeDeletedProfiles();
			}
			else this.prepareForm(null);
		}))
			
		this.route.queryParamMap.pipe(takeUntil(this._destroyed)).subscribe((params: ParamMap) => {
			// If lookup is on the query params load it
			if (params.keys.length > 0 && params.has('lookup')) {
				this.lookupParams = this.queryParamsService.deSerializeLookup(params.get('lookup'));
			}
		});
	}

	getItem(itemId: Guid, successFunction: (item: DataObjectTypeRankingMethodology) => void): void {
	}

	getMethodology(typeId: Guid, itemId: Guid, successFunction: (item: DataObjectTypeRankingMethodology) => void): void {
		this.dataObjectTypeService.getSingle(typeId, DataObjectTypeEditorResolver.lookupFields())
			.pipe(map(data => data as DataObjectType), takeUntil(this._destroyed))
			.subscribe(
				data => {
					const tmp = data.rankingMethodologies.filter(x => x.id == itemId);
					successFunction(tmp.length > 0 ? tmp[0] : null);
				},
				error => this.onCallbackError(error)
			);
	}


	prepareForm(data: DataObjectTypeRankingMethodology): void {
		try {
			this.editorModel = data ? new DataObjectTypeRankingMethodologyEditorModel().fromModel(data) : new DataObjectTypeRankingMethodologyEditorModel();
			this.isDeleted = data ? data.isActive === IsActive.Inactive : false;
			this.buildForm();
		} catch {
			this.logger.error('Could not parse Data Object Type: ' + data);
			this.uiNotificationService.snackBarNotification(this.language.instant('COMMONS.ERRORS.DEFAULT'), SnackBarNotificationLevel.Error);
		}
	}

	buildForm() {
		this.formGroup = this.editorModel.buildForm(null, this.isDeleted || !this.authService.hasPermission(AppPermission.EditDataObjectType) || this.isUsed);
	}

	refreshData(): void {
		this.getMethodology(this.type.id ,this.editorModel.id, (data: DataObjectTypeRankingMethodology) =>  {
			this.prepareForm(data);
			this.formGroup.get('dataObjectTypeId').setValue(this.type.id);
			this.addMissingProfiles();
		});
	}

	refreshOnNavigateToData(id?: Guid): void {
		if (this.isNew) {
			this.formGroup.markAsPristine();
			this.router.navigate(['/data-object-type/' + this.type.id + '/rankingmethodology/' + (id ? id : this.editorModel.id)], { queryParams: { 'lookup': this.queryParamsService.serializeLookup(this.lookupParams), 'lv': ++this.lv }, replaceUrl: true });
		} else { this.internalRefreshData(); }
	}

	persistEntity(onSuccess?: (response) => void): void {
		const formData = this.formService.getValue(this.formGroup.value);

		this.dataObjectTypeService.persistRankingMethodology(this.type.id, formData)
			.pipe(takeUntil(this._destroyed)).subscribe(
				complete => onSuccess ? onSuccess(complete) : this.onCallbackSuccess(complete),
				error => this.onCallbackError(error)
			);
	}

	formSubmit(): void {
		this.formService.touchAllFormFields(this.formGroup);
		if (!this.isFormDisabled() && !this.isFormValid()) {
			return;
		}

		this.persistEntity();
	}

	public delete() {
		const value = this.formGroup.value;
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
					this.dataObjectTypeService.deleteRankingMethodology(this.type.id, value).pipe(takeUntil(this._destroyed))
						.subscribe(
							complete => this.onCallbackSuccess(),
							error => this.onCallbackError(error)
						);
				}
			});
		}
	}

	clearErrorModel() {
		this.editorModel.validationErrorModel.clear();
		this.formService.validateAllFormFields(this.formGroup);
	}

	isActive(fg: any)
	{
		return fg.get('isActive').value == IsActive.Active;
	}

	getRankingProfile(optionId: Guid) {
		let val = (this.formGroup.getRawValue() as DataObjectTypeRankingMethodologyEditorModel).config.rankingProfiles as BaseRankingProfileModel[];
		let index = val.findIndex(x => x.optionId == optionId);
		if(index != undefined) {
			return (this.formGroup.get('config').get('rankingProfiles') as FormArray).at(index);
		}
		return null;
	}

	getSortedValidEvalOptions() {
		var arr = this.type.config.evalOptions.filter(x => x.optionType != EvaluationConfigurationType.TextEvaluationOption);
		return [...arr].sort((a,b) =>{
			let aVal = a.isActive == IsActive.Active ? 1 : 0;
			let bVal = b.isActive == IsActive.Active ? 1 : 0;
			return bVal - aVal;
		})
	}

	addMissingProfiles() {
		let arr = this.formGroup.get('config').get('rankingProfiles') as FormArray;
		let val = arr.value as BaseRankingProfileModel[];

		let missingOpt = this.type.config.evalOptions.filter(x => x.optionType != EvaluationConfigurationType.TextEvaluationOption)
									.filter(x => !val.map(y => y.optionId).includes(x.optionId));

		this.missingOptIds = missingOpt.map(x => x.optionId);
		
		for (let index = 0; index < missingOpt.length; index++) {
			let opt = missingOpt[index];
			let userVals = [];
			if( opt.optionType in [EvaluationConfigurationType.AbsoluteDecimalEvaluationOption, EvaluationConfigurationType.AbsoluteIntegerEvaluationOption, EvaluationConfigurationType.PercentageEvaluationOption] ) {
				userVals.push(undefined);
			}
			else if( opt.optionType == EvaluationConfigurationType.ScaleEvaluationOption) {
				for (let index = 0; index < (opt as ScaleEvaluationOption).evaluationScale.length; index++) {
					userVals.push(undefined);
			}}
			else if( opt.optionType == EvaluationConfigurationType.SelectionEvaluationOption) {
				for (let index = 0; index < (opt as SelectionEvaluationOption).evaluationSelectionOptions.length; index++) {
					userVals.push(undefined);
			}}

			let model = new RankingConfigurationModel().fromModel({
				rankingProfiles: [
					{optionWeight: undefined, optionId: opt.optionId, profileType: opt.optionType as any as RankingProfileType, mappedNormalizedValues: [], mappedUserValues: userVals, isActive: this.isNew ? IsActive.Active : IsActive.Inactive}
				]
			});
			arr.push(model.buildProfileForm(model.rankingProfiles[0], !this.isNew));
		}
		this.cdr.detectChanges();
	}

	removeDeletedProfiles() {
		// Remove ranking profiles that have been completely deleted - not inactive - since last time the methodology was edited
		let arr = this.formGroup.get('config').get('rankingProfiles') as FormArray;
		let val = arr.value as BaseRankingProfileModel[];

		let deletedProfiles = val.filter(x => !this.type.config.evalOptions.map(y => y.optionId).includes(x.optionId));
		for (let index = 0; index < deletedProfiles.length; index++) {
			let ind = arr.controls.findIndex(x => x.value.optionId == deletedProfiles[index].optionId);
			arr.removeAt(ind);	
		}
		this.cdr.detectChanges();
	}

	deleteProfile(fg: FormGroup)
	{
		var arr = this.formGroup.get('config').get('rankingProfiles') as FormArray;
		var i = arr.controls.indexOf(fg);
		arr.at(i).get('isActive').setValue(IsActive.Inactive);
		arr.at(i).get('isActive').markAsDirty();
		if(this.missingOptIds.includes(arr.at(i).get('optionId').value)) arr.at(i).disable();
	}

	restoreProfile(fg: FormGroup)
	{
		var arr = this.formGroup.get('config').get('rankingProfiles') as FormArray;
		var i = arr.controls.indexOf(fg);
		arr.at(i).get('isActive').setValue(IsActive.Active);
		arr.at(i).get('isActive').markAsPristine();
		if(arr.at(i).disabled) arr.at(i).enable();
	}

	public cancel(): void {
		this.router.navigate(['../..'], { relativeTo: this.route, queryParams: { 'lookup': this.queryParamsService.serializeLookup(this.lookupParams), 'lv': ++this.lv }, replaceUrl: true });// ! lv is always zero . replaceUrl?
	}
}
