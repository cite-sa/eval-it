import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { TagListSerializePipe } from '@app/core/formatting/pipes/tag-list-serialize.pipe';
import { AppUserProfile } from '@app/core/model/app-user/app-user-profile.model';
import { AppUser } from '@app/core/model/app-user/app-user.model';
import { Tag } from '@app/core/model/tag/tag.model';
import { AppUserLookup } from '@app/core/query/app-user.lookup';
import { AppUserService } from '@app/core/services/http/app-user.service';
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
	templateUrl: './app-user-listing.component.html',
	styleUrls: ['./app-user-listing.component.scss']
})
export class AppUserListingComponent extends BaseListingComponent<AppUser, AppUserLookup> implements OnInit {
	publish = false;
	userSettingsKey = { key: 'AppUserListingUserSettingss' };
	propertiesAvailableForOrder: ColumnDefinition[];
	constructor(
		protected router: Router,
		protected route: ActivatedRoute,
		protected uiNotificationService: UiNotificationService,
		protected httpErrorHandlingService: HttpErrorHandlingService,
		protected queryParamsService: QueryParamsService,
		private appUserService: AppUserService,
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



	protected initializeLookup(): AppUserLookup {
		const lookup = new AppUserLookup();
		lookup.metadata = { countAll: true };
		lookup.page = { offset: 0, size: this.ITEMS_PER_PAGE };
		lookup.isActive = [IsActive.Active];
		lookup.order = { items: [this.toDescSortField(nameof<AppUser>(x => x.createdAt))] };
		this.updateOrderUiFields(lookup.order);

		const tagStr = "Tag.";

		this.propsToFields[nameof<AppUser>(x => x.id)] = nameof<AppUser>(x => x.id);
		this.propsToFields[nameof<AppUser>(x => x.name)] = nameof<AppUser>(x => x.name);
		this.propsToFields[nameof<AppUser>(x => x.createdAt)] = nameof<AppUser>(x => x.createdAt);
		this.propsToFields[nameof<AppUser>(x => x.assignedTagIds)] = tagStr + nameof<Tag>(x => x.label);

		lookup.project = {
			fields: [
				this.propsToFields[nameof<AppUser>(x => x.id)],
				this.propsToFields[nameof<AppUser>(x => x.name)],
				this.propsToFields[nameof<AppUser>(x => x.createdAt)]
			]
		};

		return lookup;
	}

	protected setupColumns() {
		this.gridColumns.push(...[{
			prop: nameof<AppUser>(x => x.name),
			sortable: true,
			languageName: 'APP.APP-USER-LISTING.FIELDS.NAME'
		}, {
			prop: nameof<AppUser>(x => x.createdAt),
			sortable: true,
			languageName: 'APP.APP-USER-LISTING.FIELDS.CREATED-AT',
			pipe: this.pipeService.getPipe<DataTableDateTimeFormatPipe>(DataTableDateTimeFormatPipe).withFormat('short')
		}, {
			prop: nameof<AppUser>(x => x.assignedTagIds),
			sortable: false,
			languageName: 'APP.APP-USER-LISTING.FIELDS.ASSIGNED-TAGS',
			pipe: this.pipeService.getPipe<TagListSerializePipe>(TagListSerializePipe)
		}
	]);
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
		const tagStr = "Tag.";
		this.lookup.project = {
			fields: [
				this.propsToFields[nameof<AppUser>(x => x.id)],
				...columns.map(c => this.propsToFields[c])
			]
		};
		this.onPageLoad({ offset: 0 } as PageLoadEvent);
	}

	protected loadListing(): Observable<QueryResult<AppUser>> {
		return this.appUserService.query(this.lookup);
	}
}
