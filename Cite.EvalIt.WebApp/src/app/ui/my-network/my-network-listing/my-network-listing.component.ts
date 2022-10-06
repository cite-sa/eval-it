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
import { BaseListingComponent } from '@common/base/base-listing-component';
import { PipeService } from '@common/formatting/pipe.service';
import { QueryResult } from '@common/model/query-result';
import { HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { ColumnDefinition, ColumnsChangedEvent, PageLoadEvent, RowActivateEvent } from '@common/modules/listing/listing.component';
import { UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { Guid } from '@common/types/guid';
import { Observable } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';

@Component({
  selector: 'app-my-network-listing',
  templateUrl: './my-network-listing.component.html',
  styleUrls: ['./my-network-listing.component.scss']
})
export class MyNetworkListingComponent extends BaseListingComponent<UserWithRelationship, AppUserLookup> implements OnInit {
	
	publish = false;
	userSettingsKey = { key: 'ListingUserSettingss' };
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
		this.changeSetting(this.lookup);
	}

	propsToFields = {}

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
		this.propsToFields[nameof<AppUser>(x => x.id)] = nameof<AppUser>(x => x.id);
		this.propsToFields[nameof<AppUser>(x => x.name)] = nameof<AppUser>(x => x.name);
		this.propsToFields[nameof<UserWithRelationship>(x => x.id)] = userStr + nameof<AppUser>(x => x.id);
		this.propsToFields[nameof<UserWithRelationship>(x => x.user.name)] = userStr + nameof<AppUser>(x => x.name);

		lookup.project = {
			fields: [
				this.propsToFields[nameof<AppUser>(x => x.id)] = nameof<AppUser>(x => x.id),
				this.propsToFields[nameof<AppUser>(x => x.name)] = nameof<AppUser>(x => x.name),
				this.propsToFields[nameof<UserWithRelationship>(x => x.relationship)] = userStr + nameof<AppUser>(x => x.id),
				this.propsToFields[nameof<UserWithRelationship>(x => x.user.name)] = userStr + nameof<AppUser>(x => x.name)
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
				this.propsToFields[nameof<AppUser>(x => x.id)],
				...columns.map(c => this.propsToFields[c])
			]
		};
		this.onPageLoad({ offset: 0 } as PageLoadEvent);
	}

	protected loadListing(): Observable<QueryResult<UserWithRelationship>> {
		return this.appUserService.getMyNetwork(this.lookup.project.fields);
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
}
