import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { AuthService } from '@app/core/services/ui/auth.service';
import { QueryParamsService } from '@app/core/services/ui/query-params.service';
import { HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { DataObjectReview } from '@app/core/model/data-object/data-object-review.model';
import { PageEvent } from '@angular/material/paginator';
import { ColumnSortEvent, PageLoadEvent, RowActivateEvent } from '@common/modules/listing/listing.component';
import { Guid } from '@common/types/guid';
import { nameof } from 'ts-simple-nameof';
import { DataObjectReviewFeedback } from '@app/core/model/data-object/data-object-review-feedback.model';

@Component({
	selector: './app-data-object-review-listing-display',
	templateUrl: './data-object-review-listing-display.component.html',
	styleUrls: ['./data-object-review-listing-display.component.scss']
})
export class DataObjectReviewListingDisplayComponent implements OnInit {
	
	@Input() rows : DataObjectReview[];
	@Input() count: number;
	@Input() offset: number;
	@Input() limit: number;
	@Input() feedback : Map<string,DataObjectReviewFeedback[]> = new Map<string,DataObjectReviewFeedback[]>();

	@Output() pageLoad: EventEmitter<PageLoadEvent> = new EventEmitter<PageLoadEvent>();
	@Output() editClicked: EventEmitter<RowActivateEvent> = new EventEmitter<RowActivateEvent>();
	@Output() viewClicked: EventEmitter<RowActivateEvent> = new EventEmitter<RowActivateEvent>();
	@Output() nameClicked: EventEmitter<Guid> = new EventEmitter<Guid>();
	@Output() refreshReview: EventEmitter<Guid> = new EventEmitter<Guid>();
	@Output() columnSort: EventEmitter<ColumnSortEvent> = new EventEmitter<ColumnSortEvent>();

	displayRows: DataObjectReview[];
	sortColumns: [string,string][] = [];

	constructor(
		protected router: Router,
		protected route: ActivatedRoute,
		protected uiNotificationService: UiNotificationService,
		protected httpErrorHandlingService: HttpErrorHandlingService,
		protected queryParamsService: QueryParamsService,
		public authService: AuthService,
		public enumUtils: AppEnumUtils
	) {
	}

	ngOnInit() {
		this.sortColumns = [
			[nameof<DataObjectReview>(x => x.createdAt), 'APP.DATA-OBJECT-REVIEW-LISTING.FIELDS.CREATED-AT'], 
			[nameof<DataObjectReview>(x => x.updatedAt), 'APP.DATA-OBJECT-REVIEW-LISTING.FIELDS.UPDATED-AT'],
			[nameof<DataObjectReview>(x => x.rankScore), 'APP.DATA-OBJECT-REVIEW-LISTING.FIELDS.REVIEW-RANK-SCORE'],
			['reviewAuthorInNetwork', 'APP.DATA-OBJECT-REVIEW-LISTING.FIELDS.NETWORK'] 
		];
	}

	alterPage(event : PageEvent) {
		if (this.pageLoad && event) {
			this.pageLoad.emit({
				count: event.length,
				pageSize: event.pageSize,
				limit: event.pageSize,
				offset: event.pageIndex,
			});
		}
	}

	getFeedbackByReviewId(id: Guid) : DataObjectReviewFeedback[] {
		if( id && this.feedback.has(id.toString())) return this.feedback.get(id.toString());

		return null;
	}

	onEditClicked(event: RowActivateEvent)
	{
		this.editClicked.emit(event);
	}

	onViewClicked(event: RowActivateEvent)
	{
		this.viewClicked.emit(event);
	}

	onNameClicked(event: Guid)
	{
		this.nameClicked.emit(event);
	}

	onChangeSort(event: ColumnSortEvent)
	{
		this.columnSort.emit(event);
	}

	onReviewRefresh(event: Guid)
	{
		this.refreshReview.emit(event);
	}
}
