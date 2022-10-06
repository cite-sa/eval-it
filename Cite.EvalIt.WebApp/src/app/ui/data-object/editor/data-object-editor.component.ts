import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
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
import { AbsoluteDecimalInputOptionModel, AbsoluteIntegerInputOptionModel, DataObjectTypeEditorModel, PercentageInputOptionModel, RegistrationInformationInputOptionModel, RegistrationInformationModel, TextInputOptionModel } from '@app/ui/data-object-type/editor/data-object-type-editor.model';
import { DataObjectType } from '@app/core/model/data-object-type/data-object-type.model';
import { DataObjectTypeService } from '@app/core/services/http/data-object-type.service';
import { DataObjectTypeEditorResolver } from '@app/ui/data-object-type/editor/data-object-type-editor.resolver';
import { RegistrationInformationType } from '@app/core/enum/registration-information-type.enum';
import { DataObjectService } from '@app/core/services/http/data-object.service';
import { DataObjectLookup } from '@app/core/query/data-object.lookup';
import { nameof } from 'ts-simple-nameof';
import { DataObject, PersistentID } from '@app/core/model/data-object/data-object.model';
import { DataObjectAttributeDataModel, DataObjectEditorModel } from '@app/ui/data-object/editor/data-object-editor.model';
import { DataObjectAttributeType } from '@app/core/enum/data-object-attribute-type.enum';
import { DataObjectEditorResolver } from '@app/ui/data-object/editor/data-object-editor.resolver';
import { SingleAutoCompleteConfiguration } from '@common/modules/auto-complete/single/single-auto-complete-configuration';
import { Observable } from 'rxjs';
import { DataObjectTypeLookup } from '@app/core/query/data-object-type.lookup';
import { AbsoluteDecimalInputOption, RegistrationInformation, RegistrationInformationInputOption, ScaleInputOption, SelectionInputOption } from '@app/core/model/data-object-type/registration-information.model';
import { AbsoluteDecimalAttribute, AbsoluteIntegerAttribute, DataObjectAttribute, PercentageAttribute, ScaleAttribute, SelectionAttribute, TextAttribute } from '@app/core/model/data-object/data-object-attribute.model';
import { PersistentIDType } from '@app/core/enum/persistent-id-type.enum';

@Component({
	selector: 'app-data-object-editor',
	templateUrl: './data-object-editor.component.html',
	styleUrls: ['./data-object-editor.component.scss']
})
export class DataObjectEditorComponent extends BaseEditor<DataObjectEditorModel, DataObject> implements OnInit {

	isNew = true;
	isUsed = false;
	isDeleted = false;
	saveClicked = false;
	formGroup: FormGroup = null;
	type: DataObjectType = null;
	userId: Guid = null;

	attrType = DataObjectAttributeType;
	attrTypeKeys = [];

	pidType = PersistentIDType;
	pidTypeKeys = [];

	removedOptionIds = null;
	addedOptionIds = null;

	objectTypeRevised = false;

	userSingleAutocompleteConfiguration: SingleAutoCompleteConfiguration = {
		initialItems: this.initialSingleDataObjectItems.bind(this),
		filterFn: this.dataObjectSingleFilterFn.bind(this),
		displayFn: (item: DataObjectType) => item.name,
		titleFn: (item: DataObjectType) => item.name
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
		public formBuilder: FormBuilder,
		private dataObjectTypeService: DataObjectTypeService,
		private dataObjectService: DataObjectService,
		private logger: LoggingService,
		private readonly cdr: ChangeDetectorRef
	) {
		super(dialog, language, formService, router, uiNotificationService, httpErrorHandlingService, filterService, datePipe, route, queryParamsService);
		this.attrTypeKeys = Object.keys(DataObjectAttributeType).filter((item) => isFinite(Number(item))).map(item => Number(item));
		this.pidTypeKeys = Object.keys(PersistentIDType).filter((item) => isFinite(Number(item))).map(item => Number(item));
	}

	ngOnInit(): void {
		const entity = this.route.snapshot.data['entity'] as DataObject;
		if(entity) {
			this.dataObjectTypeService.getSingle(entity.dataObjectType.id, DataObjectTypeEditorResolver.lookupFields()).subscribe(currentType => {
				if( currentType.updatedAt > entity.dataObjectType.updatedAt ) {
					
					let inactiveOptionIds = currentType.info.inputOptions.filter(o => o.isActive == IsActive.Inactive).map(o => o.optionId);
					this.removedOptionIds = entity.dataObjectType.info.inputOptions.filter(o => o.isActive == IsActive.Active && inactiveOptionIds.includes(o.optionId)).map(y => y.optionId);
					
					let addedOptions = currentType.info.inputOptions.filter(o => o.isActive == IsActive.Active && !entity.dataObjectType.info.inputOptions.map(u => u.optionId).includes(o.optionId));
					this.addedOptionIds = addedOptions.map(o => o.optionId);
					
					let addedAttributes =  addedOptions ? addedOptions.map(x => this.dataObjectAttributesFromOptions(x)) : []
					
					entity.attributeData.attributes.push(...addedAttributes);
					entity.dataObjectType.info.inputOptions = currentType.info.inputOptions.map(x => {x.isActive = this.removedOptionIds.includes(x.optionId) ? IsActive.Active : x.isActive; return x});
				}
				this.type = entity.dataObjectType;
				this.prepareForm(entity);

			});
			this.isNew = false;
		}
		else this.prepareForm(null);

		this.route.queryParamMap.pipe(takeUntil(this._destroyed)).subscribe((params: ParamMap) => {
			// If lookup is on the query params load it
			if (params.keys.length > 0 && params.has('lookup')) {
				this.lookupParams = this.queryParamsService.deSerializeLookup(params.get('lookup'));
			}
		});
	}

	getItem(itemId: Guid, successFunction: (item: DataObject) => void): void {
		this.dataObjectService.getSingle(itemId, DataObjectEditorResolver.lookupFields())
			.pipe(map(data => data as DataObject), takeUntil(this._destroyed))
			.subscribe(
				data => successFunction(data),
				error => this.onCallbackError(error)
			);
	}

	prepareForm(data: DataObject): void {
		try {
			this.editorModel = data ? new DataObjectEditorModel().fromModel(data) : new DataObjectEditorModel();
			this.isDeleted = data ? data.isActive === IsActive.Inactive : false;
			
			this.buildForm();
			if(data && data.userId) {
				this.userId = data.userId;
			}
			else {
				this.userId = this.authService.userId().toString() as any;
			}
		} catch {
			this.logger.error('Could not parse Data Object: ' + data);
			this.uiNotificationService.snackBarNotification(this.language.instant('COMMONS.ERRORS.DEFAULT'), SnackBarNotificationLevel.Error);
		}
	}

	buildForm() {
		this.formGroup = this.editorModel.buildForm(null, this.isDeleted || !this.authService.hasPermission(AppPermission.EditDataObject) || this.isUsed);
	}

	refreshData(): void {
		this.getItem(this.editorModel.id, (data: DataObject) => this.prepareForm(data));
	}

	refreshOnNavigateToData(id?: Guid): void {
		if (this.isNew) {
			this.formGroup.markAsPristine();
			this.router.navigate(['/data-object/' + (id ? id : this.editorModel.id)], { queryParams: { 'lookup': this.queryParamsService.serializeLookup(this.lookupParams), 'lv': ++this.lv }, replaceUrl: true });
		} else { this.internalRefreshData(); }
	}

	persistEntity(onSuccess?: (response) => void): void {
		if( this.objectTypeRevised) this.formGroup.setControl('dataObjectType', new DataObjectTypeEditorModel().fromModel(this.type).buildForm())
		this.formGroup.get('dataObjectTypeId').enable();
		const formData = this.formService.getValue(this.formGroup.value);
		this.formGroup.get('dataObjectTypeId').disable();

		this.dataObjectService.persist(formData)
			.pipe(takeUntil(this._destroyed)).subscribe(
				complete => onSuccess ? onSuccess(complete) : this.onCallbackSuccess(complete),
				error => this.onCallbackError(error)
			);
	}

	formSubmit(): void {
		this.formService.touchAllFormFields(this.formGroup);
		if ((!this.isFormDisabled() && !this.isFormValid()) || this.isUnresolved()) {
			return;
		}
		this.formGroup.get('userId').setValue(this.userId ? this.userId : this.authService.userId().toString());
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
					this.dataObjectService.delete(value.id).pipe(takeUntil(this._destroyed))
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

	private getTypeFields() {
		var infoStr = "RegistrationInformation.";
		return [
			nameof<DataObjectType>(x => x.id),
			nameof<DataObjectType>(x => x.name),
			nameof<DataObjectType>(x => x.updatedAt),
			infoStr + nameof<RegistrationInformationInputOption>(x => x.optionId),
			infoStr + nameof<RegistrationInformationInputOption>(x => x.optionType),
			infoStr + nameof<RegistrationInformationInputOption>(x => x.label),
			infoStr + nameof<RegistrationInformationInputOption>(x => x.isMandatory),
			infoStr + nameof<RegistrationInformationInputOption>(x => x.multiValue),
			infoStr + nameof<RegistrationInformationInputOption>(x => x.isActive),
			infoStr + nameof<AbsoluteDecimalInputOption>(x => x.measurementUnit),
			infoStr + nameof<AbsoluteDecimalInputOption>(x => x.upperBound),
			infoStr + nameof<AbsoluteDecimalInputOption>(x => x.lowerBound),
			infoStr + nameof<AbsoluteDecimalInputOption>(x => x.validationRegexp),
			infoStr + nameof<ScaleInputOption>(x => x.inputScale),
			infoStr + nameof<SelectionInputOption>(x => x.inputSelectionOptions)
		]
	}

	private initialSingleDataObjectItems(selectedItem?: DataObjectType): Observable<DataObjectType[]> {
		var dataObjectTypeLookup = new DataObjectTypeLookup();
		dataObjectTypeLookup.isActive = [IsActive.Active]
		dataObjectTypeLookup.project = {
			fields: this.getTypeFields()
		}
		return this.dataObjectTypeService.query(dataObjectTypeLookup).pipe(map(x => x.items));
	}

	private dataObjectSingleFilterFn(searchQuery: string, selectedItem?: DataObjectType): Observable<DataObjectType[]> {
		var dataObjectTypeLookup = new DataObjectTypeLookup();
		dataObjectTypeLookup.isActive = [IsActive.Active]
		dataObjectTypeLookup.like = this.filterService.transformLike(searchQuery);
		dataObjectTypeLookup.project = {
			fields: this.getTypeFields()
		}
		return this.dataObjectTypeService.query(dataObjectTypeLookup).pipe(map(x => x.items));
	}

	setValue(data: DataObjectType)
	{
		this.formGroup.get('dataObjectTypeId').setValue(data.id);
		this.type = data;
		if( data.info?.inputOptions) 
		{
			this.editorModel.attributeData = new DataObjectAttributeDataModel().fromModel({ attributes: data.info.inputOptions.filter(x => x.isActive == IsActive.Active).map(x => this.dataObjectAttributesFromOptions(x))});
			var map : Map<Guid,RegistrationInformationInputOption> = new Map<Guid,RegistrationInformationInputOption>();
			this.type.info.inputOptions.forEach(o => {
				map.set(o.optionId,o);
			})
			this.formGroup.setControl('attributeData', this.editorModel.attributeData.buildForm(null, false, map));
		}
	}
	
	isTabDisabled() {
		return this.formGroup.get('attributeData')?.get('attributes').value.length == 0;
	}

	getOptionById(optionId: Guid): RegistrationInformationInputOption
	{
		var x = this.type?.info?.inputOptions.find(x => x?.optionId == optionId);
		return x;
	}

	addUserDefinedId() {
		var arr = this.formGroup.get('userDefinedIds') as FormArray;
		var option = this.formBuilder.group({
			type: [{ value: 0, disabled: false }],
			key: [{ value: '', disabled: false }],
			value: [{ value: '', disabled: false }]
		});
		arr.push(option);
		this.cdr.detectChanges();
	}

	removeUserDefinedId(i: number) {
		var arr = this.formGroup.get('userDefinedIds') as FormArray;
		arr.removeAt(i);
	}

	dataObjectAttributesFromOptions( option: RegistrationInformationInputOption) : DataObjectAttribute {
        switch (option.optionType) {
          case RegistrationInformationType.AbsoluteDecimalInputOption: {
            const v : AbsoluteDecimalAttribute = { optionId : option.optionId, attributeType : DataObjectAttributeType.AbsoluteDecimalAttribute, values : [] }
            return v;
          }
          case RegistrationInformationType.AbsoluteIntegerInputOption: {
            const v : AbsoluteIntegerAttribute = { optionId : option.optionId, attributeType : DataObjectAttributeType.AbsoluteIntegerAttribute, values : [] }
            return v;
          }
          case RegistrationInformationType.PercentageInputOption: {
            const v : PercentageAttribute = { optionId : option.optionId, attributeType : DataObjectAttributeType.PercentageAttribute, values : [] }
            return v;
          }
          case RegistrationInformationType.TextInputOption: {
            const v : TextAttribute = { optionId : option.optionId, attributeType : DataObjectAttributeType.TextAttribute, values : [] }
            return v;
          }
          case RegistrationInformationType.ScaleInputOption: {
            const v : ScaleAttribute = { optionId : option.optionId, attributeType : DataObjectAttributeType.ScaleAttribute, values : [] }
            return v;
          }
          case RegistrationInformationType.SelectionInputOption: {
            const v : SelectionAttribute = { optionId : option.optionId, attributeType : DataObjectAttributeType.SelectionAttribute, values : [] }
            return v;
          }
          default:
            break;
        }
	}

	removeUnresolvedAttribute(formGroup: FormGroup) {
		this.type.info.inputOptions.find(c => c.optionId == formGroup.value.optionId).isActive = IsActive.Inactive;
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

	isInvalidDOIWarning(pid: PersistentID) {
		if( pid == null || pid.type != PersistentIDType.DOI ) return false;
		const doiRegex = /\b(10[.][0-9]{4,}(?:[.][0-9]+)*\/(?:(?!["&\'<>?#])\S)+)\b/g

		return pid.value ? !doiRegex.test(pid.value) : false;
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

	public cancel(): void {
		if(this.isNew) this.router.navigate(['../..'], { relativeTo: this.route, queryParams: { 'lookup': this.queryParamsService.serializeLookup(this.lookupParams), 'lv': ++this.lv }, replaceUrl: true });// ! lv is always zero . replaceUrl?
		else super.cancel();
	}
}
