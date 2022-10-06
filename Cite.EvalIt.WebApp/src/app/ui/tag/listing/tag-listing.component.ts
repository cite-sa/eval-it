import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { ListCountPipe } from '@app/core/formatting/pipes/list-count.pipe';
import { TagAppliesToTypePipe } from '@app/core/formatting/pipes/tag-applies-to-type.pipe';
import { TagTypePipe } from '@app/core/formatting/pipes/tag-type.pipe';
import { AppUser } from '@app/core/model/app-user/app-user.model';
import { DataObject } from '@app/core/model/data-object/data-object.model';
import { Tag } from '@app/core/model/tag/tag.model';
import { TagLookup } from '@app/core/query/tag.lookup';
import { TagService } from '@app/core/services/http/tag.service';
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
	templateUrl: './tag-listing.component.html',
	styleUrls: ['./tag-listing.component.scss']
})
export class TagListingComponent extends BaseListingComponent<Tag, TagLookup> implements OnInit {
	publish = false;
	userSettingsKey = { key: 'TagListingUserSettingss' };
	propertiesAvailableForOrder: ColumnDefinition[];
	constructor(
		protected router: Router,
		protected route: ActivatedRoute,
		protected uiNotificationService: UiNotificationService,
		protected httpErrorHandlingService: HttpErrorHandlingService,
		protected queryParamsService: QueryParamsService,
		private tagService: TagService,
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

	protected initializeLookup(): TagLookup {
		const lookup = new TagLookup();
		lookup.metadata = { countAll: true };
		lookup.page = { offset: 0, size: this.ITEMS_PER_PAGE };
		lookup.isActive = [IsActive.Active];
		lookup.order = { items: [this.toDescSortField(nameof<Tag>(x => x.createdAt))] };
		this.updateOrderUiFields(lookup.order);

		const userStr = "User.";
		const dataObjectStr = "DataObject.";

		this.propsToFields[nameof<Tag>(x => x.id)] = nameof<Tag>(x => x.id);
		this.propsToFields[nameof<Tag>(x => x.label)] = nameof<Tag>(x => x.label);
		this.propsToFields[nameof<Tag>(x => x.type)] = nameof<Tag>(x => x.type);
		this.propsToFields[nameof<Tag>(x => x.appliesTo)] = nameof<Tag>(x => x.appliesTo);
		this.propsToFields[nameof<Tag>(x => x.createdAt)] = nameof<Tag>(x => x.createdAt);
		this.propsToFields[nameof<Tag>(x => x.associatedUsers)] = userStr + nameof<AppUser>(x => x.name);
		this.propsToFields[nameof<Tag>(x => x.associatedDataObjects)] = dataObjectStr + nameof<DataObject>(x => x.title);

		lookup.project = {
			fields: [
				this.propsToFields[nameof<Tag>(x => x.id)],
				this.propsToFields[nameof<Tag>(x => x.label)],
				this.propsToFields[nameof<Tag>(x => x.type)],
				this.propsToFields[nameof<Tag>(x => x.appliesTo)],
				this.propsToFields[nameof<Tag>(x => x.createdAt)]
			]
		};

		return lookup;
	}

	protected setupColumns() {
		this.gridColumns.push(...[{
			prop: nameof<Tag>(x => x.label),
			sortable: true,
			languageName: 'APP.TAG-LISTING.FIELDS.LABEL'
		}, {
			prop: nameof<Tag>(x => x.type),
			sortable: true,
			languageName: 'APP.TAG-LISTING.FIELDS.TYPE',
			pipe: this.pipeService.getPipe<TagTypePipe>(TagTypePipe)

		}, {
			prop: nameof<Tag>(x => x.appliesTo),
			sortable: true,
			languageName: 'APP.TAG-LISTING.FIELDS.APPLIESTO',
			pipe: this.pipeService.getPipe<TagAppliesToTypePipe>(TagAppliesToTypePipe)

		},{
			prop: nameof<Tag>(x => x.associatedUsers),
			sortable: false,
			languageName: 'APP.TAG-LISTING.FIELDS.USERCOUNT',
			pipe: this.pipeService.getPipe<ListCountPipe>(ListCountPipe)
		},{
			prop: nameof<Tag>(x => x.associatedDataObjects),
			sortable: false,
			languageName: 'APP.TAG-LISTING.FIELDS.DATAOBJECTCOUNT',
			pipe: this.pipeService.getPipe<ListCountPipe>(ListCountPipe)
		},{
			prop: nameof<Tag>(x => x.createdAt),
			sortable: true,
			languageName: 'APP.TAG-LISTING.FIELDS.CREATED-AT',
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
				this.propsToFields[nameof<Tag>(x => x.id)],
				...columns.map(c => this.propsToFields[c])
			]
		};
		this.onPageLoad({ offset: 0 } as PageLoadEvent);
	}

	protected loadListing(): Observable<QueryResult<Tag>> {
		return this.tagService.query(this.lookup);
	}
}
