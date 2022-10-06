import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IsActive } from '@app/core/enum/is-active.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { UserNetworkRelationshipPipe } from '@app/core/formatting/pipes/user-network-relationship.pipe';
import { AppUser, UserWithRelationship } from '@app/core/model/app-user/app-user.model';
import { AppUserNetworkClientLookup } from '@app/core/query/app-user-network.lookup';
import { AppUserLookup } from '@app/core/query/app-user.lookup';
import { AppUserService } from '@app/core/services/http/app-user.service';
import { AuthService } from '@app/core/services/ui/auth.service';
import { QueryParamsService } from '@app/core/services/ui/query-params.service';
import { AppUserNetworkListingResolver } from '@app/ui/app-user/network-listing/app-user-network-listing.resolver';
import { BaseListingComponent } from '@common/base/base-listing-component';
import { PipeService } from '@common/formatting/pipe.service';
import { QueryResult } from '@common/model/query-result';
import { HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { ColumnDefinition, ColumnsChangedEvent, PageLoadEvent, RowActivateEvent } from '@common/modules/listing/listing.component';
import { UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { Guid } from '@common/types/guid';
import { Observable } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';

@Component({
  selector: 'app-app-user-network-listing',
  templateUrl: './app-user-network-listing.component.html',
  styleUrls: ['./app-user-network-listing.component.scss']
})
export class AppUserNetworkListingComponent extends BaseListingComponent<UserWithRelationship, AppUserLookup> implements OnInit {
	
	@Input() user : AppUser;

	publish = false;
	userSettingsKey = { key: 'AppUserListingUserSettingss' };
	propertiesAvailableForOrder: ColumnDefinition[];

	clientLookup : AppUserNetworkClientLookup;
	tempRows = null;

	constructor(
		protected router: Router,
		protected route: ActivatedRoute,
		protected uiNotificationService: UiNotificationService,
		protected httpErrorHandlingService: HttpErrorHandlingService,
		protected queryParamsService: QueryParamsService,
		private appUserService: AppUserService,
		public authService: AuthService,
    	public pipeService: PipeService,
		public enumUtils: AppEnumUtils
		// private language: TranslateService,
		// private dialog: MatDialog
	) {
		super(router, route, uiNotificationService, httpErrorHandlingService, queryParamsService );
		// Lookup setup
		// Default lookup values are defined in the user settings class.
		this.clientLookup = new AppUserNetworkClientLookup();
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
		var userStr = "User.";
		lookup.project = {
			fields: [
				nameof<AppUser>(x => x.id),
				nameof<AppUser>(x => x.name),
				nameof<AppUser>(x => x.updatedAt),
				nameof<AppUser>(x => x.createdAt),
				nameof<AppUser>(x => x.hash),
				nameof<AppUser>(x => x.isActive),
				userStr + nameof<AppUser>(x => x.id),
				userStr + nameof<AppUser>(x => x.name)
			]
		};

		return lookup;
	}

	protected setupColumns() {
		this.gridColumns.push(...[{
			prop: nameof<UserWithRelationship>(x => x.user.name),
			sortable: true,
			languageName: 'APP.APP-USER-NETWORK-LISTING.FIELDS.NAME'
		}, {
			prop: nameof<UserWithRelationship>(x => x.relationship),
			sortable: true,
			languageName: 'APP.APP-USER-NETWORK-LISTING.FIELDS.RELATIONSHIP',
      pipe: this.pipeService.getPipe<UserNetworkRelationshipPipe>(UserNetworkRelationshipPipe)

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

	protected loadListing(): Observable<QueryResult<UserWithRelationship>> {
		return this.appUserService.getSingle(this.user.id,this.lookup.project.fields).pipe(map(x => <QueryResult<UserWithRelationship>> {items : x.userNetworkIds, count : x.userNetworkIds.length }));
	}

	clientFilterChange(value: AppUserNetworkClientLookup) {
		var str = value.like?.slice(0,length-1);

		// first time this is called, save copy of unfilitered results
		if( this.tempRows == null) this.tempRows = this.gridRows;

		var filteredRows : UserWithRelationship[] = this.tempRows;

		if( str ) filteredRows = filteredRows.filter(x => x.user.name.indexOf(str) !== -1);
		if( value.relationship?.length > 0) filteredRows = filteredRows.filter(x => value.relationship.includes(x.relationship) )
		
		this.gridRows = filteredRows;
	}

	getItem(itemId: Guid, successFunction: (item: AppUser) => void): void {
		this.appUserService.getSingle(itemId, AppUserNetworkListingResolver.lookupFields())
			.pipe(map(data => data as AppUser), takeUntil(this._destroyed))
			.subscribe(
				data => successFunction(data),
				error => this.onCallbackError(error)
			);
	}

	onNewItem() {
		this.navigateTo('./network/new');
	}

	onRowActivated(event: RowActivateEvent) {
		if (event && event.type === 'click' && event.row && event.row.id) {
			this.navigateTo('./network/' + event.row.id);
		}
	}
}
