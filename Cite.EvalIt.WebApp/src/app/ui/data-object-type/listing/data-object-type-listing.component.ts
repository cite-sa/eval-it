import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { DataObjectType } from '@app/core/model/data-object-type/data-object-type.model';
import { BaseEvaluationOption } from '@app/core/model/data-object-type/evaluation-configuration.model';
import { RegistrationInformationInputOption } from '@app/core/model/data-object-type/registration-information.model';
import { DataObjectTypeLookup } from '@app/core/query/data-object-type.lookup';
import { DataObjectTypeService } from '@app/core/services/http/data-object-type.service';
import { AuthService } from '@app/core/services/ui/auth.service';
import { QueryParamsService } from '@app/core/services/ui/query-params.service';
import { BaseListingComponent } from '@common/base/base-listing-component';
import { PipeService } from '@common/formatting/pipe.service';
import { DataTableDateTimeFormatPipe } from '@common/formatting/pipes/date-time-format.pipe';
import { QueryResult } from '@common/model/query-result';
import { HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { ColumnDefinition, ColumnsChangedEvent, PageLoadEvent } from '@common/modules/listing/listing.component';
import { UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { IsActive } from '@idp-service/core/enum/is-active.enum';
import { Observable } from 'rxjs';
import { nameof } from 'ts-simple-nameof';

@Component({
	templateUrl: './data-object-type-listing.component.html',
	styleUrls: ['./data-object-type-listing.component.scss']
})
export class DataObjectTypeListingComponent extends BaseListingComponent<DataObjectType, DataObjectTypeLookup> implements OnInit {
	publish = false;
	userSettingsKey = { key: 'DataObjectTypeListingUserSettings' };
	propertiesAvailableForOrder: ColumnDefinition[];
	constructor(
		protected router: Router,
		protected route: ActivatedRoute,
		protected uiNotificationService: UiNotificationService,
		protected httpErrorHandlingService: HttpErrorHandlingService,
		protected queryParamsService: QueryParamsService,
		private dataObjectTypeService: DataObjectTypeService,
		public authService: AuthService,
		private pipeService: PipeService,
		public enumUtils: AppEnumUtils,
		// private language: TranslateService,
		// private dialog: MatDialog
	) {
		super(router, route, uiNotificationService, httpErrorHandlingService, queryParamsService);
		// Lookup setup
		// Default lookup values are defined in the user settings class.
		this.lookup = this.initializeLookup();
	}

	propsToFields = {}

	ngOnInit() {
		super.ngOnInit();
	}

	protected initializeLookup(): DataObjectTypeLookup {
		const lookup = new DataObjectTypeLookup();
		lookup.metadata = { countAll: true };
		lookup.page = { offset: 0, size: this.ITEMS_PER_PAGE };
		lookup.isActive = [IsActive.Active];
		lookup.order = { items: [this.toDescSortField(nameof<DataObjectType>(x => x.createdAt))] };
		this.updateOrderUiFields(lookup.order);

		const infoStr = "RegistrationInformation.";
		const configStr = "EvaluationConfiguration.";

		this.propsToFields[nameof<DataObjectType>(x => x.id)] = nameof<DataObjectType>(x => x.id);
		this.propsToFields[nameof<DataObjectType>(x => x.name)] = nameof<DataObjectType>(x => x.name);
		this.propsToFields[nameof<DataObjectType>(x => x.createdAt)] = nameof<DataObjectType>(x => x.createdAt);
		this.propsToFields[nameof<DataObjectType>(x => x.info)] = infoStr + nameof<RegistrationInformationInputOption>(x => x.label);
		this.propsToFields[nameof<DataObjectType>(x => x.config)] = configStr + nameof<BaseEvaluationOption>(x => x.label);

		lookup.project = {
			fields: [
				this.propsToFields[nameof<DataObjectType>(x => x.id)],
				this.propsToFields[nameof<DataObjectType>(x => x.name)],
				this.propsToFields[nameof<DataObjectType>(x => x.createdAt)]
			]
		};

		return lookup;
	}

	protected setupColumns() {
		this.gridColumns.push(...[{
			prop: nameof<DataObjectType>(x => x.name),
			sortable: true,
			languageName: 'APP.DATA-OBJECT-TYPE-LISTING.FIELDS.NAME'
		},{
			prop: nameof<DataObjectType>(x => x.createdAt),
			sortable: true,
			languageName: 'APP.DATA-OBJECT-TYPE-LISTING.FIELDS.CREATED-AT',
			pipe: this.pipeService.getPipe<DataTableDateTimeFormatPipe>(DataTableDateTimeFormatPipe).withFormat('short')
		}]);
		this.propertiesAvailableForOrder = this.gridColumns.filter(x => x.sortable);
	}

	//
	// Listing Component functions
	//
	onColumnsChanged(event: ColumnsChangedEvent) {
		this.onColumnsChangedInternal(event.properties.map(x => x.toString()));
	}

	private onColumnsChangedInternal(columns: string[]) {
		// Here are defined the projection fields that always requested from the api.
		this.lookup.project = {
			fields: [
				this.propsToFields[nameof<DataObjectType>(x => x.id)],
				...columns.map(c => this.propsToFields[c])
			]
		};
		this.onPageLoad({ offset: 0 } as PageLoadEvent);
	}

	protected loadListing(): Observable<QueryResult<DataObjectType>> {
		return this.dataObjectTypeService.query(this.lookup);
	}
}
