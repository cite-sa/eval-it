import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IsActive } from '@app/core/enum/is-active.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { IsActiveTypePipe } from '@app/core/formatting/pipes/is-active-type.pipe';
import { AuthService } from '@app/core/services/ui/auth.service';
import { QueryParamsService } from '@app/core/services/ui/query-params.service';
import { BaseListingComponent } from '@common/base/base-listing-component';
import { PipeService } from '@common/formatting/pipe.service';
import { QueryResult } from '@common/model/query-result';
import { HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { ColumnDefinition, ColumnsChangedEvent, PageLoadEvent } from '@common/modules/listing/listing.component';
import { UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { UserServiceUser } from '@user-service/core/model/user.model';
import { UserLookup } from '@user-service/core/query/user.lookup';
import { UserService } from '@user-service/services/http/user.service';
import { Observable } from 'rxjs';
import { nameof } from 'ts-simple-nameof';

@Component({
	templateUrl: './api-client-listing.component.html',
	styleUrls: ['./api-client-listing.component.scss']
})
export class ApiClientListingComponent extends BaseListingComponent<UserServiceUser, UserLookup> implements OnInit {
	publish = false;
	userSettingsKey = { key: 'ApiClientListingUserSettings' };
	propertiesAvailableForOrder: ColumnDefinition[];

	constructor(
		protected router: Router,
		protected route: ActivatedRoute,
		protected uiNotificationService: UiNotificationService,
		protected httpErrorHandlingService: HttpErrorHandlingService,
		protected queryParamsService: QueryParamsService,
		public authService: AuthService,
		private pipeService: PipeService,
		public enumUtils: AppEnumUtils,
		private userService: UserService,
		// private language: TranslateService,
		// private dialog: MatDialog
	) {
		super(router, route, uiNotificationService, httpErrorHandlingService, queryParamsService);
		// Lookup setup
		// Default lookup values are defined in the user settings class.
		this.lookup = this.initializeLookup();
	}

	ngOnInit() {
		super.ngOnInit();
	}

	protected initializeLookup(): UserLookup {
		const lookup = new UserLookup();
		lookup.metadata = { countAll: true };
		lookup.page = { offset: 0, size: this.ITEMS_PER_PAGE };
		lookup.isActive = [IsActive.Active];
		lookup.order = { items: [this.toDescSortField(nameof<UserServiceUser>(x => x.createdAt))] };
		this.updateOrderUiFields(lookup.order);

		lookup.project = {
			fields: [
				nameof<UserServiceUser>(x => x.id),
				nameof<UserServiceUser>(x => x.name),
				nameof<UserServiceUser>(x => x.type),
				nameof<UserServiceUser>(x => x.updatedAt),
				nameof<UserServiceUser>(x => x.createdAt),
				nameof<UserServiceUser>(x => x.hash),
				nameof<UserServiceUser>(x => x.isActive),
				nameof<UserServiceUser>(x => x.profile),
				nameof<UserServiceUser>(x => x.contacts)
			]
		};

		return lookup;
	}

	protected setupColumns() {
		this.gridColumns.push(...[{
			prop: nameof<UserServiceUser>(x => x.name),
			sortable: true,
			languageName: 'USER-SERVICE.API-CLIENT-LISTING.FIELDS.NAME'
		},
		{
			prop: nameof<UserServiceUser>(x => x.isActive),
			sortable: true,
			languageName: 'USER-SERVICE.API-CLIENT-LISTING.FIELDS.IS-ACTIVE',
			pipe: this.pipeService.getPipe<IsActiveTypePipe>(IsActiveTypePipe)
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
				nameof<UserServiceUser>(x => x.id),
				nameof<UserServiceUser>(x => x.name),
				...columns
			]
		};
		this.onPageLoad({ offset: 0 } as PageLoadEvent);
	}

	protected loadListing(): Observable<QueryResult<UserServiceUser>> {
		return this.userService.query(this.lookup);
	}
}
