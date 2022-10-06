import { A } from '@angular/cdk/keycodes';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IsActive } from '@app/core/enum/is-active.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { ListCountPipe } from '@app/core/formatting/pipes/list-count.pipe';
import { RankScorePipe } from '@app/core/formatting/pipes/rank-score.pipe';
import { TagListSerializePipe } from '@app/core/formatting/pipes/tag-list-serialize.pipe';
import { AppUser } from '@app/core/model/app-user/app-user.model';
import { DataObjectType } from '@app/core/model/data-object-type/data-object-type.model';
import { DataObjectAttribute } from '@app/core/model/data-object/data-object-attribute.model';
import { DataObjectReview } from '@app/core/model/data-object/data-object-review.model';
import { DataObject } from '@app/core/model/data-object/data-object.model';
import { Tag } from '@app/core/model/tag/tag.model';
import { DataObjectLookup } from '@app/core/query/data-object.lookup';
import { DataObjectService } from '@app/core/services/http/data-object.service';
import { AuthService } from '@app/core/services/ui/auth.service';
import { QueryParamsService } from '@app/core/services/ui/query-params.service';
import { BaseListingComponent } from '@common/base/base-listing-component';
import { PipeService } from '@common/formatting/pipe.service';
import { DataTableDateTimeFormatPipe } from '@common/formatting/pipes/date-time-format.pipe';
import { QueryResult } from '@common/model/query-result';
import { HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { ColumnDefinition, ColumnsChangedEvent, PageLoadEvent, RowActivateEvent } from '@common/modules/listing/listing.component';
import { UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { Observable } from 'rxjs';
import { nameof } from 'ts-simple-nameof';

@Component({
  selector: 'app-data-object-listing',
  templateUrl: './data-object-listing.component.html',
  styleUrls: ['./data-object-listing.component.scss']
})
export class DataObjectListingComponent extends BaseListingComponent<DataObject, DataObjectLookup> implements OnInit {

	publish = false;
	userSettingsKey = { key: 'DataObjectTypeListingUserSettings' };
	propertiesAvailableForOrder: ColumnDefinition[];
	constructor(
		protected router: Router,
		protected route: ActivatedRoute,
		protected uiNotificationService: UiNotificationService,
		protected httpErrorHandlingService: HttpErrorHandlingService,
		protected queryParamsService: QueryParamsService,
		private dataObjectService: DataObjectService,
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

	protected initializeLookup(): DataObjectLookup {
		const lookup = new DataObjectLookup();
		lookup.metadata = { countAll: true };
		lookup.page = { offset: 0, size: this.ITEMS_PER_PAGE };
		lookup.isActive = [IsActive.Active];
		lookup.order = { items: [this.toDescSortField(nameof<DataObject>(x => x.createdAt))] };
		this.updateOrderUiFields(lookup.order);

		const typeStr = "DataObjectType.";
		const tagStr = "Tag.";
		const userStr = "User.";
		const reviewStr = "DataObjectReview.";

		this.propsToFields[nameof<DataObject>(x => x.id)] = nameof<DataObject>(x => x.id);
		this.propsToFields[nameof<DataObject>(x => x.title)] = nameof<DataObject>(x => x.title);
		this.propsToFields[nameof<DataObject>(x => x.description)] = nameof<DataObject>(x => x.description);
		this.propsToFields[nameof<DataObject>(x => x.assignedTagIds)] = tagStr + nameof<Tag>(x => x.label);
		this.propsToFields[nameof<DataObject>(x => x.dataObjectType.name)] = typeStr + nameof<DataObjectType>(x => x.name);
		this.propsToFields[nameof<DataObject>(x => x.user.name)] = userStr + nameof<AppUser>(x => x.name);
		this.propsToFields[nameof<DataObject>(x => x.createdAt)] = nameof<DataObject>(x => x.createdAt);
		this.propsToFields[nameof<DataObject>(x => x.rankScore)] = nameof<DataObject>(x => x.rankScore);
		// this.propsToFields[nameof<DataObject>(x => x.reviews)] = reviewStr + nameof<DataObjectReview>(x => x.id);
		this.propsToFields[nameof<DataObject>(x => x.reviews)] = reviewStr + nameof<DataObjectReview>(x => x.isActive);

		lookup.project = {
			fields: [
				this.propsToFields[nameof<DataObject>(x => x.id)],
				this.propsToFields[nameof<DataObject>(x => x.title)],
				this.propsToFields[nameof<DataObject>(x => x.createdAt)]
			]
		};

		return lookup;
	}

	protected setupColumns() {
		this.gridColumns.push(...[{
			prop: nameof<DataObject>(x => x.title),
			sortable: true,
			languageName: 'APP.DATA-OBJECT-LISTING.FIELDS.TITLE'
		}, {
      		prop: nameof<DataObject>(x => x.description),
			sortable: true,
			languageName: 'APP.DATA-OBJECT-LISTING.FIELDS.DESCRIPTION'
   		}, {
			prop: nameof<DataObject>(x => x.assignedTagIds),
			sortable: false,
			languageName: 'APP.DATA-OBJECT-LISTING.FIELDS.ASSIGNED-TAGS',
			pipe: this.pipeService.getPipe<TagListSerializePipe>(TagListSerializePipe)
		},{
			prop: nameof<DataObject>(x => x.dataObjectType.name),
			sortable: false,
			languageName: 'APP.DATA-OBJECT-LISTING.FIELDS.TYPE-NAME'
		},{
			prop: nameof<DataObject>(x => x.rankScore),
			sortable: true,
			languageName: 'APP.DATA-OBJECT-LISTING.FIELDS.RANK-SCORE',
			pipe: this.pipeService.getPipe<RankScorePipe>(RankScorePipe)
		},{
			prop: nameof<DataObject>(x => x.user.name),
			sortable: false,
			languageName: 'APP.DATA-OBJECT-LISTING.FIELDS.AUTHOR'
		},{
			prop: nameof<DataObject>(x => x.reviews),
			sortable: true,
			languageName: 'APP.DATA-OBJECT-LISTING.FIELDS.REVIEWCOUNT',
			pipe: this.ListActiveCountPipe()
		},{
			prop: nameof<DataObject>(x => x.createdAt),
			sortable: true,
			languageName: 'APP.DATA-OBJECT-LISTING.FIELDS.CREATED-AT',
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
				this.propsToFields[nameof<DataObject>(x => x.id)],
				...columns.map(c => this.propsToFields[c])
			]
		};
		this.onPageLoad({ offset: 0 } as PageLoadEvent);
	}

	onNewItem() {
		this.navigateTo('./new/editor');
	}

	onRowActivated(event: RowActivateEvent) {
		if (event && event.type === 'click' && event.row && event.row.id) {
			this.router.navigate([event.row.id], { relativeTo: this.route });
		}
	}

	protected loadListing(): Observable<QueryResult<DataObject>> {
		return this.dataObjectService.query(this.lookup);
	}

	private ListActiveCountPipe () {
		return {transform: (value : DataObjectReview[]) => this.pipeService.getPipe<ListCountPipe>(ListCountPipe).transform(Array.isArray(value) ? value.filter(u => u.isActive == IsActive.Active) : value)}
	}
}
