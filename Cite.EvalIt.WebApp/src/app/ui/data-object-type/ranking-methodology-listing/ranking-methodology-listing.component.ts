import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { AppUser } from '@app/core/model/app-user/app-user.model';
import { AuthService } from '@app/core/services/ui/auth.service';
import { QueryParamsService } from '@app/core/services/ui/query-params.service';
import { BaseListingComponent } from '@common/base/base-listing-component';
import { QueryResult } from '@common/model/query-result';
import { HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { ColumnDefinition, ColumnsChangedEvent, PageLoadEvent, RowActivateEvent } from '@common/modules/listing/listing.component';
import { UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { Guid } from '@common/types/guid';
import { IsActive } from '@app/core/enum/is-active.enum';
import { Observable } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';
import { AppPermission } from '@app/core/enum/permission.enum';
import { DataObjectType } from '@app/core/model/data-object-type/data-object-type.model';
import { DataObjectTypeService } from '@app/core/services/http/data-object-type.service';
import { DataObjectTypeRankingMethodology } from '@app/core/model/data-object-type/ranking-methodology.model';
import { DataObjectTypeLookup } from '@app/core/query/data-object-type.lookup';
import { DataObjectTypeRankingMethodologyClientLookup } from '@app/core/query/data-object-type-ranking-methodology.lookup';
import { DataObjectTypeEditorResolver } from '@app/ui/data-object-type/editor/data-object-type-editor.resolver';

@Component({
	selector: './app-ranking-methodology-listing',
	templateUrl: './ranking-methodology-listing.component.html',
	styleUrls: ['./ranking-methodology-listing.component.scss']
})
export class DataObjectTypeRankingMethodologyListingComponent extends BaseListingComponent<DataObjectTypeRankingMethodology, DataObjectTypeLookup> implements OnInit {
	
	@Input() object : DataObjectType;

	publish = false;
	userSettingsKey = { key: 'dataObjectTypeRankingMethodologyListingUserSettingss' };
	propertiesAvailableForOrder: ColumnDefinition[];

	clientLookup : DataObjectTypeRankingMethodologyClientLookup;
	tempRows = null;

	constructor(
		protected router: Router,
		protected route: ActivatedRoute,
		protected uiNotificationService: UiNotificationService,
		protected httpErrorHandlingService: HttpErrorHandlingService,
		protected queryParamsService: QueryParamsService,
		private dataObjectTypeService: DataObjectTypeService,
		public authService: AuthService,
		public enumUtils: AppEnumUtils
		// private language: TranslateService,
		// private dialog: MatDialog
	) {
		super(router, route, uiNotificationService, httpErrorHandlingService, queryParamsService );
		// Lookup setup
		// Default lookup values are defined in the user settings class.
		this.clientLookup = new DataObjectTypeRankingMethodologyClientLookup();
		this.clientLookup.pageOffset = 0;
		this.clientLookup.pageSize = this.ITEMS_PER_PAGE;
		this.clientLookup.isActive = [IsActive.Active];

		this.lookup = this.initializeLookup();
	}

	ngOnInit() {
		super.ngOnInit()
	}

	protected initializeLookup(): DataObjectTypeLookup {
		const lookup = new DataObjectTypeLookup();
		lookup.metadata = { countAll: true };
		lookup.page = { offset: 0, size: this.ITEMS_PER_PAGE };
		lookup.isActive = [IsActive.Active];
		this.updateOrderUiFields(lookup.order);
		var rankingStr = "dataObjectTypeRankingMethodology.";
		lookup.project = {
			fields: [
				nameof<DataObjectType>(x => x.id),
				nameof<DataObjectType>(x => x.name),
				nameof<DataObjectType>(x => x.updatedAt),
				nameof<DataObjectType>(x => x.createdAt),
				nameof<DataObjectType>(x => x.hash),
				nameof<DataObjectType>(x => x.isActive),
				rankingStr + nameof<DataObjectTypeRankingMethodology>(x => x.id),
				rankingStr + nameof<DataObjectTypeRankingMethodology>(x => x.name),
				rankingStr + nameof<DataObjectTypeRankingMethodology>(x => x.isActive)
			]
		};

		return lookup;
	}

	protected setupColumns() {
		this.gridColumns.push(...[{
			prop: nameof<DataObjectTypeRankingMethodology>(x => x.name),
			sortable: true,
			languageName: 'APP.DATA-OBJECT-TYPE-RANKING-METHODOLOGY-LISTING.FIELDS.NAME'
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
				nameof<AppUser>(x => x.id),
				...columns
			]
		};
		this.onPageLoad({ offset: 0 } as PageLoadEvent);
	}

	protected loadListing(): Observable<QueryResult<DataObjectTypeRankingMethodology>> {
		var obs = this.dataObjectTypeService.getSingle(this.object.id,this.lookup.project.fields)
			.pipe(map(x => <QueryResult<DataObjectTypeRankingMethodology>> {items : x.rankingMethodologies ?? [], count : x.rankingMethodologies?.length ?? 0 }),
				  tap(y => this.tempRows = y.items));
		return obs;
	}

	clientFilterChange(value: DataObjectTypeRankingMethodologyClientLookup) {
		var str = value.like?.slice(0,length-1);

		// first time this is called, save copy of unfilitered results
		if( this.tempRows == null) this.tempRows = this.gridRows;

		var filteredRows : DataObjectTypeRankingMethodology[] = this.tempRows;

		if( str ) filteredRows = filteredRows.filter( x => x.name.indexOf(str) !== -1);
		if( value.isActive) filteredRows = filteredRows.filter( x => value.isActive.includes(x.isActive));

		this.gridRows = filteredRows;
	}

	getItem(itemId: Guid, successFunction: (item: DataObjectType) => void): void {
		this.dataObjectTypeService.getSingle(itemId, DataObjectTypeEditorResolver.lookupFields())
			.pipe(map(data => data as DataObjectType), takeUntil(this._destroyed))
			.subscribe(
				data => successFunction(data),
				error => this.onCallbackError(error)
			);
	}

	onNewItem() {
		this.navigateTo('./rankingmethodology/new');
	}

	onRowActivated(event: RowActivateEvent) {
		if (event && event.type === 'click' && event.row && event.row.id  && this.authService.hasPermission(AppPermission.EditDataObjectType)) {
			this.navigateTo('./rankingmethodology/' + event.row.id);
		}
	}
}
