import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { AppUser } from '@app/core/model/app-user/app-user.model';
import { Tag } from '@app/core/model/tag/tag.model';
import { AppUserLookup } from '@app/core/query/app-user.lookup';
import { AppUserService } from '@app/core/services/http/app-user.service';
import { AuthService } from '@app/core/services/ui/auth.service';
import { QueryParamsService } from '@app/core/services/ui/query-params.service';
import { AppUserTagListingResolver } from '@app/ui/app-user/tag-listing/app-user-tag-listing.resolver';
import { BaseListingComponent } from '@common/base/base-listing-component';
import { PipeService } from '@common/formatting/pipe.service';
import { QueryResult } from '@common/model/query-result';
import { HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { ColumnDefinition, ColumnsChangedEvent, PageLoadEvent, RowActivateEvent } from '@common/modules/listing/listing.component';
import { UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { Guid } from '@common/types/guid';
import { IsActive } from '@app/core/enum/is-active.enum';
import { Observable } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';
import { AppUserTagClientLookup } from '@app/core/query/app-user-tag.lookup';
import { TagTypePipe } from '@app/core/formatting/pipes/tag-type.pipe';

@Component({
	selector: './app-app-user-tag-listing',
	templateUrl: './app-user-tag-listing.component.html',
	styleUrls: ['./app-user-tag-listing.component.scss']
})
export class AppUserTagListingComponent extends BaseListingComponent<Tag, AppUserLookup> implements OnInit {
	
	@Input() user : AppUser;
	@Input() viewOnly: boolean = false;

	publish = false;
	userSettingsKey = { key: 'AppUserListingUserSettingss' };
	propertiesAvailableForOrder: ColumnDefinition[];

	clientLookup : AppUserTagClientLookup;
	tempRows = null;

	constructor(
		protected router: Router,
		protected route: ActivatedRoute,
		protected uiNotificationService: UiNotificationService,
		protected httpErrorHandlingService: HttpErrorHandlingService,
		protected queryParamsService: QueryParamsService,
		private appUserService: AppUserService,
		public authService: AuthService,
		private pipeService: PipeService,
		public enumUtils: AppEnumUtils
		// private language: TranslateService,
		// private dialog: MatDialog
	) {
		super(router, route, uiNotificationService, httpErrorHandlingService, queryParamsService );
		// Lookup setup
		// Default lookup values are defined in the user settings class.
		this.clientLookup = new AppUserTagClientLookup();
		this.clientLookup.pageOffset = 0;
		this.clientLookup.pageSize = this.ITEMS_PER_PAGE;

		this.lookup = this.initializeLookup();
	}

	ngOnInit() {
		super.ngOnInit()
	}

	protected initializeLookup(): AppUserLookup {
		const lookup = new AppUserLookup();
		lookup.metadata = { countAll: true };
		lookup.page = { offset: 0, size: this.ITEMS_PER_PAGE };
		lookup.isActive = [IsActive.Active];
		this.updateOrderUiFields(lookup.order);
		var tagStr = "tag.";
		lookup.project = {
			fields: [
				nameof<AppUser>(x => x.id),
				nameof<AppUser>(x => x.name),
				nameof<AppUser>(x => x.updatedAt),
				nameof<AppUser>(x => x.createdAt),
				nameof<AppUser>(x => x.hash),
				nameof<AppUser>(x => x.isActive),
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
			languageName: 'APP.APP-USER-TAG-LISTING.FIELDS.LABEL'
		}, {
			prop: nameof<Tag>(x => x.type),
			sortable: true,
			languageName: 'APP.APP-USER-TAG-LISTING.FIELDS.TYPE',
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
		var obs = this.appUserService.getSingle(this.user.id,this.lookup.project.fields).pipe(map(x => <QueryResult<Tag>> {items : x.assignedTagIds, count : x.assignedTagIds.length }));
		obs.subscribe(x => this.tempRows = x.items)
		return obs;
	}

	clientFilterChange(value: AppUserTagClientLookup) {
		var str = value.like?.slice(0,length-1);

		// first time this is called, save copy of unfilitered results
		if( this.tempRows == null) this.tempRows = this.gridRows;

		var filteredRows : Tag[] = this.tempRows;

		if( str ) filteredRows = filteredRows.filter( x => x.label.indexOf(str) !== -1);
		if( value.tagType?.length > 0 ) filteredRows = filteredRows.filter( x => value.tagType.includes(x.type));

		this.gridRows = filteredRows;
	}

	getItem(itemId: Guid, successFunction: (item: AppUser) => void): void {
		this.appUserService.getSingle(itemId, AppUserTagListingResolver.lookupFields())
			.pipe(map(data => data as AppUser), takeUntil(this._destroyed))
			.subscribe(
				data => successFunction(data),
				error => this.onCallbackError(error)
			);
	}

	onNewItem() {
		this.navigateTo('./tag/new');
	}

	onRowActivated(event: RowActivateEvent) {
		if (event && event.type === 'click' && event.row && event.row.id && this.authService.hasPermission(this.authService.permissionEnum.EditUser) && !this.viewOnly) {
			this.navigateTo('./tag/' + event.row.id);
		}
	}
}
