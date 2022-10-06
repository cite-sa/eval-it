import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, ControlContainer, FormArray, FormControl, FormGroup } from '@angular/forms';
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
import { map, takeUntil } from 'rxjs/operators';
import { BaseEditor } from '@common/base/base-editor';
import { FilterService } from '@common/modules/text-filter/filter-service';
import { DatePipe } from '@angular/common';
import { QueryParamsService } from '@app/core/services/ui/query-params.service';
import { DataObjectTypeEditorModel, EvaluationConfigurationModel, RegistrationInformationModel } from '@app/ui/data-object-type/editor/data-object-type-editor.model';
import { DataObjectType, DataObjectTypePersist } from '@app/core/model/data-object-type/data-object-type.model';
import { DataObjectTypeService } from '@app/core/services/http/data-object-type.service';
import { DataObjectTypeEditorResolver } from '@app/ui/data-object-type/editor/data-object-type-editor.resolver';
import { RegistrationInformationType } from '@app/core/enum/registration-information-type.enum';
import { DataObjectService } from '@app/core/services/http/data-object.service';
import { DataObjectLookup } from '@app/core/query/data-object.lookup';
import { nameof } from 'ts-simple-nameof';
import { DataObject } from '@app/core/model/data-object/data-object.model';
import { ScaleIcons } from '@app/core/enum/scale-icons.enum';
import { EvaluationConfigurationType } from '@app/core/enum/evaluation-configuration-type.enum';
import { ObjectRankRecalculationStrategyType } from '@app/core/enum/object-rank-recalculation-strategy-type.enum';
import { AllEqualObjectRankRecalculationStrategyModel, BaseObjectRankRecalculationStrategyModel, LikedObjectRankRecalculationStrategyModel, ObjectRankRecalculationStrategyConfigurationModel } from '@app/ui/data-object-type/editor/object-rank-recalculation-strategy-editor.model';
import { SingleAutoCompleteConfiguration } from '@common/modules/auto-complete/single/single-auto-complete-configuration';
import { DataObjectTypeRankingMethodology } from '@app/core/model/data-object-type/ranking-methodology.model';
import { Observable } from 'rxjs';
import { DataObjectTypeLookup } from '@app/core/query/data-object-type.lookup';

@Component({
	selector: 'app-data-object-type-editor',
	templateUrl: './data-object-type-editor.component.html',
	styleUrls: ['./data-object-type-editor.component.scss']
})
export class DataObjectTypeEditorComponent extends BaseEditor<DataObjectTypeEditorModel, DataObjectType> implements OnInit {

	isNew = true;
	isUsed = false;
	isDeleted = false;
	saveClicked = false;
	formGroup: FormGroup = null;
	strategyFormGroup: FormGroup = null;

	methodologies = [];
	type : DataObjectType = null;
	infoType = RegistrationInformationType;
	infoTypeKeys = [];
	evalType = EvaluationConfigurationType;
	evalTypeKeys = [];
	stratType = ObjectRankRecalculationStrategyType;
	stratTypeKeys = [];
	scaleIcons = ScaleIcons;
	scaleIconKeys = [];

	defaultMethodologySingleAutocompleteConfiguration: SingleAutoCompleteConfiguration = {
		initialItems: this.initialDataObjectRankingMethodologyItems.bind(this),
		filterFn: this.dataObjectRankingMethodologyFilterFn.bind(this),
		displayFn: (item: DataObjectTypeRankingMethodology) => item.name,
		titleFn: (item: DataObjectTypeRankingMethodology) => item.name
	};

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
		private dataObjectService: DataObjectService,
		private logger: LoggingService,
		private readonly cdr: ChangeDetectorRef
	) {
		super(dialog, language, formService, router, uiNotificationService, httpErrorHandlingService, filterService, datePipe, route, queryParamsService);
		this.infoTypeKeys = Object.keys(RegistrationInformationType).filter((item) => isFinite(Number(item))).map(item => Number(item));
		this.evalTypeKeys = Object.keys(EvaluationConfigurationType).filter((item) => isFinite(Number(item))).map(item => Number(item));
		this.stratTypeKeys = Object.keys(ObjectRankRecalculationStrategyType).filter((item) => isFinite(Number(item))).map(item => Number(item));
	}

	ngOnInit(): void {
		const entity = this.route.snapshot.data['entity'] as DataObjectType;
		if(entity) {
			var objectLookup = new DataObjectLookup();
			objectLookup.isActive = [IsActive.Active];
			objectLookup.typeIds = [entity.id];
			objectLookup.project = {
				fields: [
					nameof<DataObject>(x => x.id),
				]
			};
			this.dataObjectService.query(objectLookup).subscribe(x => {
				if( x.count > 0) this.isUsed = true;
				this.prepareForm(entity);
			})
			this.methodologies = entity.rankingMethodologies;
			this.type = entity;
			this.isNew = false;
		}
		this.prepareForm(null);

		this.route.queryParamMap.pipe(takeUntil(this._destroyed)).subscribe((params: ParamMap) => {
			// If lookup is on the query params load it
			if (params.keys.length > 0 && params.has('lookup')) {
				this.lookupParams = this.queryParamsService.deSerializeLookup(params.get('lookup'));
			}
		});
	}

	getItem(itemId: Guid, successFunction: (item: DataObjectType) => void): void {
		this.dataObjectTypeService.getSingle(itemId, DataObjectTypeEditorResolver.lookupFields())
			.pipe(map(data => data as DataObjectType), takeUntil(this._destroyed))
			.subscribe(
				data => successFunction(data),
				error => this.onCallbackError(error)
			);
	}

	prepareForm(data: DataObjectType): void {
		try {
			this.editorModel = data ? new DataObjectTypeEditorModel().fromModel(data) : new DataObjectTypeEditorModel();
			this.isDeleted = data ? data.isActive === IsActive.Inactive : false;
			this.buildForm();
		} catch {
			this.logger.error('Could not parse Data Object Type: ' + data);
			this.uiNotificationService.snackBarNotification(this.language.instant('COMMONS.ERRORS.DEFAULT'), SnackBarNotificationLevel.Error);
		}
	}

	buildForm() {
		this.formGroup = this.editorModel.buildForm(null, this.isDeleted || !this.authService.hasPermission(AppPermission.EditDataObjectType) || this.isUsed);
		let strategyConfig = this.editorModel.strategyConfig ?? new ObjectRankRecalculationStrategyConfigurationModel();
		this.strategyFormGroup = strategyConfig?.buildForm(null, this.isDeleted || !this.authService.hasPermission(AppPermission.EditDataObjectType));
		this.formGroup.setControl('strategyConfig',this.strategyFormGroup);
	}

	refreshData(): void {
		this.getItem(this.editorModel.id, (data: DataObjectType) => this.prepareForm(data));
	}

	refreshOnNavigateToData(id?: Guid): void {
		if (this.isNew) {
			this.formGroup.markAsPristine();
			this.router.navigate(['/data-object-type/' + (id ? id : this.editorModel.id)], { queryParams: { 'lookup': this.queryParamsService.serializeLookup(this.lookupParams), 'lv': ++this.lv }, replaceUrl: true });
		} else { this.internalRefreshData(); }
	}

	persistEntity(onSuccess?: (response) => void): void {
		const formData = this.formService.getValue(this.formGroup.getRawValue());

		formData?.info?.inputOptions?.forEach(opt => {
			if(opt.upperBound?.value == undefined) opt.upperBound = null
			if(opt.lowerBound?.value == undefined) opt.lowerBound = null
		});

		formData?.config?.evalOptions?.forEach(opt => {
			if(opt.upperBound?.value == undefined) opt.upperBound = null
			if(opt.lowerBound?.value == undefined) opt.lowerBound = null
		});

		this.dataObjectTypeService.persist(formData)
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
					this.dataObjectTypeService.delete(value.id).pipe(takeUntil(this._destroyed))
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

	getSortedInfoOptions() {
		var arr = this.formGroup.get('info').get('inputOptions')['controls'] as AbstractControl[];
		return [...arr].sort((a,b) =>{
			let aVal = a.value.isActive == IsActive.Active || !a.get('isActive').pristine ? 1 : 0;
			let bVal = b.value.isActive == IsActive.Active || !b.get('isActive').pristine ? 1 : 0;
			return bVal - aVal;
		})
	}

	addInfoOption(type: RegistrationInformationType)
	{
		var arr = this.formGroup.get('info').get('inputOptions') as FormArray;
		let model = new RegistrationInformationModel().fromModel({
			inputOptions: [
				{label: "", isMandatory: false, multiValue: false, optionType: type, isActive: IsActive.Active}
			]
		});
		if(this.editorModel.info && this.editorModel.info.inputOptions)  this.editorModel.info.inputOptions.push(model.inputOptions[0]);
		else this.editorModel.info = model;

		arr.push(this.editorModel.info.buildOptionForm(model.inputOptions[0], false));
		this.cdr.detectChanges();
	}

	deleteInfoOption(fg: FormGroup)
	{
		var arr = this.formGroup.get('info').get('inputOptions') as FormArray;
		var i = arr.controls.indexOf(fg);
		if( !this.isUsed || (this.isUsed && !fg.disabled) )
		{
			arr.removeAt(i);
			this.editorModel.info.inputOptions.splice(i,1);
		}
		else
		{
			arr.at(i).get('isActive').setValue(IsActive.Inactive);
			arr.at(i).get('isActive').markAsDirty();
		}
	}

	restoreInfoOption(fg: FormGroup)
	{
		var arr = this.formGroup.get('info').get('inputOptions') as FormArray;
		var i = arr.controls.indexOf(fg);
		arr.at(i).get('isActive').setValue(IsActive.Active);
		arr.at(i).get('isActive').markAsPristine();
	}

	getSortedConfigOptions() {
		var arr = this.formGroup.get('config').get('evalOptions')['controls'] as AbstractControl[];
		return [...arr].sort((a,b) =>{
			let aVal = a.value.isActive == IsActive.Active || !a.get('isActive').pristine ? 1 : 0;
			let bVal = b.value.isActive == IsActive.Active || !b.get('isActive').pristine ? 1 : 0;
			return bVal - aVal;
		})
	}

	addConfigOption(type: EvaluationConfigurationType)
	{
		var arr = this.formGroup.get('config').get('evalOptions') as FormArray;
		let model = new EvaluationConfigurationModel().fromModel({
			evalOptions: [
				{label: "", isMandatory: false, optionType: type, isActive: IsActive.Active}
			]
		});
		if(this.editorModel.config && this.editorModel.config.evalOptions)  this.editorModel.config.evalOptions.push(model.evalOptions[0]);
		else this.editorModel.config = model;

		arr.push(this.editorModel.config.buildOptionForm(model.evalOptions[0], false));
		this.cdr.detectChanges();
	}

	deleteConfigOption(fg: FormGroup)
	{
		var arr = this.formGroup.get('config').get('evalOptions') as FormArray;
		var i = arr.controls.indexOf(fg);
		if( !this.isUsed || (this.isUsed && !fg.disabled) )
		{
			arr.removeAt(i);
			this.editorModel.config.evalOptions.splice(i,1);
		}
		else
		{
			arr.at(i).get('isActive').setValue(IsActive.Inactive);
			arr.at(i).get('isActive').markAsDirty();
		}
	}

	restoreConfigOption(fg: FormGroup)
	{
		var arr = this.formGroup.get('config').get('evalOptions') as FormArray;
		var i = arr.controls.indexOf(fg);
		arr.at(i).get('isActive').setValue(IsActive.Active);
		arr.at(i).get('isActive').markAsPristine();
	}

	getSortedStrategyOptions() {
		let arr = this.formGroup.get('strategyConfig')?.get('strategies') as FormArray;
		let controls = null;
		if(arr != null) {
			controls = arr['controls'] as AbstractControl[];
			return [...controls].sort((a,b) =>{
				let aVal = a.value.isActive == IsActive.Active || !a.get('isActive').pristine ? 1 : 0;
				let bVal = b.value.isActive == IsActive.Active || !b.get('isActive').pristine ? 1 : 0;
				return bVal - aVal;
			})
		}
	} 

	addStrategyOption(type: ObjectRankRecalculationStrategyType)
	{
		var arr = this.formGroup.get('strategyConfig').get('strategies') as FormArray;
		let model = new ObjectRankRecalculationStrategyConfigurationModel().fromModel({
			strategies: [
				{strategyWeight: 1, strategyType: type, isActive: IsActive.Active}
			]
		});
		if(this.editorModel.strategyConfig && this.editorModel.strategyConfig.strategies)  this.editorModel.strategyConfig.strategies.push(model.strategies[0]);
		else this.editorModel.strategyConfig = model;

		if(arr) arr.push(this.editorModel.strategyConfig.buildStrategyForm(model.strategies[0], false));
		else this.formGroup.get('strategyConfig').setValue(this.editorModel.strategyConfig.buildForm());
		this.cdr.detectChanges();
	}

	deactivateStrategyOption(fg: FormGroup) {
		var arr = this.formGroup.get('strategyConfig').get('strategies') as FormArray;
		if(arr == null) return;
		var i = arr.controls.indexOf(fg);
		
		if(arr.at(i).get('id').value != null) {
			let strategyModel : BaseObjectRankRecalculationStrategyModel = null;
			switch(arr.at(i).get('strategyType').value) {
				case ObjectRankRecalculationStrategyType.AllEqual :
					strategyModel = new AllEqualObjectRankRecalculationStrategyModel();
					break;
				case ObjectRankRecalculationStrategyType.Liked :
					strategyModel = new LikedObjectRankRecalculationStrategyModel()
					break;
			}

			strategyModel = strategyModel.fromModel(this.type.strategyConfig.strategies.find(x => x.id == arr.at(i).get('id').value));
			let newControl = new ObjectRankRecalculationStrategyConfigurationModel().buildStrategyForm(strategyModel ,false);
			arr.setControl(i, newControl );
			arr.at(i).get('isActive').setValue(IsActive.Inactive);
			arr.at(i).get('isActive').markAsDirty();
		}
		else {
			arr.removeAt(i);
			this.editorModel.strategyConfig.strategies.splice(i,1);
		}

	}

	deleteStrategyOption(fg: FormGroup)
	{
		var arr = this.formGroup.get('strategyConfig').get('strategies') as FormArray;
		if(arr == null) return;
		var i = arr.controls.indexOf(fg);

		arr.removeAt(i);
		this.editorModel.strategyConfig.strategies.splice(i,1);

	}

	restoreStrategyOption(fg: FormGroup)
	{
		var arr = this.formGroup.get('strategyConfig').get('strategies') as FormArray;
		var i = arr.controls.indexOf(fg);
		arr.at(i).get('isActive').setValue(IsActive.Active);
		arr.at(i).get('isActive').markAsPristine();
	}

	
	private initialDataObjectRankingMethodologyItems(selectedItem?: DataObjectTypeRankingMethodology): Observable<DataObjectTypeRankingMethodology[]> {
		var typeLookup = new DataObjectTypeLookup();
		const rankStr = "DataObjectTypeRankingMethodology.";

		typeLookup.isActive = [IsActive.Active];
		typeLookup.ids = [this.type.id];
		typeLookup.project = {
			fields: [
				rankStr + nameof<DataObjectTypeRankingMethodology>(x => x.id),
				rankStr + nameof<DataObjectTypeRankingMethodology>(x => x.name),
				rankStr + nameof<DataObjectTypeRankingMethodology>(x => x.isActive),
				]
		}

		return this.dataObjectTypeService.query(typeLookup).pipe(map(x => x.items[0]?.rankingMethodologies?.filter(x => x.isActive == IsActive.Active) ?? []));
	}

	private dataObjectRankingMethodologyFilterFn(searchQuery: string, selectedItem?: DataObjectTypeRankingMethodology): Observable<DataObjectTypeRankingMethodology[]> {
		var typeLookup = new DataObjectTypeLookup();
		const rankStr = "DataObjectTypeRankingMethodology.";

		typeLookup.isActive = [IsActive.Active];
		typeLookup.ids = [this.type.id];
		typeLookup.project = {
			fields: [
				rankStr + nameof<DataObjectTypeRankingMethodology>(x => x.id),
				rankStr + nameof<DataObjectTypeRankingMethodology>(x => x.name),
				rankStr + nameof<DataObjectTypeRankingMethodology>(x => x.isActive),
				]
		}

		return this.dataObjectTypeService.query(typeLookup).pipe(map(x => x.items[0].rankingMethodologies.filter(x => x.isActive == IsActive.Active && x.name.indexOf(searchQuery) !== -1)));
	}

	setValue(data: DataObjectTypeRankingMethodology) {
		this.formGroup.get('selectedRankingMethodologyId').setValue(data.id);
	}

	getValue() {
		let x = this.formGroup.get('selectedRankingMethodologyId')?.value;
		if(x) return this.type.rankingMethodologies.find(y => y.id == x && y.isActive == IsActive.Active);
		return x;
	}

	addMethodology() {
		this.router.navigate(['rankingmethodology/new'], { queryParams: { 'lookup': this.queryParamsService.serializeLookup(this.lookupParams), 'lv': ++this.lv }, relativeTo: this.route });
	}

	editSelectedMethodology() {
		let id = this.formGroup.get('selectedRankingMethodologyId')?.value;
		if(id != null) this.router.navigate(['rankingmethodology/' + id], { queryParams: { 'lookup': this.queryParamsService.serializeLookup(this.lookupParams), 'lv': ++this.lv }, relativeTo: this.route });
	}
}
