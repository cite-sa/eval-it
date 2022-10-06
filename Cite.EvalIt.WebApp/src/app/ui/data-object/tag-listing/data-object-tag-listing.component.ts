import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { AppUser } from '@app/core/model/app-user/app-user.model';
import { Tag } from '@app/core/model/tag/tag.model';
import { AuthService } from '@app/core/services/ui/auth.service';
import { QueryParamsService } from '@app/core/services/ui/query-params.service';
import { BaseListingComponent } from '@common/base/base-listing-component';
import { PipeService } from '@common/formatting/pipe.service';
import { QueryResult } from '@common/model/query-result';
import { HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { ColumnDefinition, ColumnsChangedEvent, PageLoadEvent, RowActivateEvent } from '@common/modules/listing/listing.component';
import { UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { Guid } from '@common/types/guid';
import { IsActive } from '@app/core/enum/is-active.enum';
import { Observable } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';
import { DataObjectLookup } from '@app/core/query/data-object.lookup';
import { DataObject } from '@app/core/model/data-object/data-object.model';
import { DataObjectService } from '@app/core/services/http/data-object.service';
import { DataObjectTagListingResolver } from '@app/ui/data-object/tag-listing/data-object-tag-listing.resolver';
import { DataObjectTagClientLookup } from '@app/core/query/data-object-tag.lookup';
import { TagTypePipe } from '@app/core/formatting/pipes/tag-type.pipe';
import { AppPermission } from '@app/core/enum/permission.enum';

@Component({
	selector: './app-data-object-tag-listing',
	templateUrl: './data-object-tag-listing.component.html',
	styleUrls: ['./data-object-tag-listing.component.scss']
})
export class DataObjectTagListingComponent extends BaseListingComponent<Tag, DataObjectLookup> implements OnInit {
	
	@Input() object : DataObject;

	publish = false;
	userSettingsKey = { key: 'DataObjectListingUserSettingss' };
	propertiesAvailableForOrder: ColumnDefinition[];

	clientLookup : DataObjectTagClientLookup;
	tempRows = null;

	constructor(
		protected router: Router,
		protected route: ActivatedRoute,
		protected uiNotificationService: UiNotificationService,
		protected httpErrorHandlingService: HttpErrorHandlingService,
		protected queryParamsService: QueryParamsService,
		private dataObjectService: DataObjectService,
		public authService: AuthService,
		private pipeService: PipeService,
		public enumUtils: AppEnumUtils
		// private language: TranslateService,
		// private dialog: MatDialog
	) {
		super(router, route, uiNotificationService, httpErrorHandlingService, queryParamsService );
		// Lookup setup
		// Default lookup values are defined in the user settings class.
		this.clientLookup = new DataObjectTagClientLookup();
		this.clientLookup.pageOffset = 0;
		this.clientLookup.pageSize = this.ITEMS_PER_PAGE;

		this.lookup = this.initializeLookup();
	}

	ngOnInit() {
		super.ngOnInit()
	}

	protected initializeLookup(): DataObjectLookup {
		const lookup = new DataObjectLookup();
		lookup.metadata = { countAll: true };
		lookup.page = { offset: 0, size: this.ITEMS_PER_PAGE };
		lookup.isActive = [IsActive.Active];
		this.updateOrderUiFields(lookup.order);
		var tagStr = "tag.";
		lookup.project = {
			fields: [
				nameof<DataObject>(x => x.id),
				nameof<DataObject>(x => x.title),
				nameof<DataObject>(x => x.updatedAt),
				nameof<DataObject>(x => x.createdAt),
				nameof<DataObject>(x => x.hash),
				nameof<DataObject>(x => x.isActive),
				tagStr + nameof<Tag>(x => x.id),
				tagStr + nameof<Tag>(x => x.label)
			]
		};

		return lookup;
	}

	protected setupColumns() {
		this.gridColumns.push(...[{
			prop: nameof<Tag>(x => x.label),
			sortable: true,
			languageName: 'APP.DATA-OBJECT-TAG-LISTING.FIELDS.LABEL'
		}, {
			prop: nameof<Tag>(x => x.type),
			sortable: true,
			languageName: 'APP.DATA-OBJECT-TAG-LISTING.FIELDS.TYPE',
			pipe: this.pipeService.getPipe<TagTypePipe>(TagTypePipe)
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

	protected loadListing(): Observable<QueryResult<Tag>> {
		var obs = this.dataObjectService.getSingle(this.object.id,this.lookup.project.fields)
			.pipe(map(x => <QueryResult<Tag>> {items : x.assignedTagIds, count : x.assignedTagIds.length }),
				  tap(y => this.tempRows = y.items));
		return obs;
	}

	clientFilterChange(value: DataObjectTagClientLookup) {
		var str = value.like?.slice(0,length-1);

		// first time this is called, save copy of unfilitered results
		if( this.tempRows == null) this.tempRows = this.gridRows;

		var filteredRows : Tag[] = this.tempRows;

		if( str ) filteredRows = filteredRows.filter( x => x.label.indexOf(str) !== -1);
		if( value.tagType?.length > 0 ) filteredRows = filteredRows.filter( x => value.tagType.includes(x.type));

		this.gridRows = filteredRows;
	}

	getItem(itemId: Guid, successFunction: (item: DataObject) => void): void {
		this.dataObjectService.getSingle(itemId, DataObjectTagListingResolver.lookupFields())
			.pipe(map(data => data as DataObject), takeUntil(this._destroyed))
			.subscribe(
				data => successFunction(data),
				error => this.onCallbackError(error)
			);
	}

	onNewItem() {
		this.navigateTo('./tag/new');
	}

	onRowActivated(event: RowActivateEvent) {
		if (event && event.type === 'click' && event.row && event.row.id  && this.authService.hasPermission(AppPermission.EditDataObject)) {
			this.navigateTo('./tag/' + event.row.id);
		}
	}
}
