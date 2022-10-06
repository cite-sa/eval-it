import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RankRecalculationTaskStatus } from '@app/core/enum/rank-recalculation-task-status.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { RankRecalculationTaskStatusPipe } from '@app/core/formatting/pipes/rank-recalculation-task-status.pipe';
import { AppUser } from '@app/core/model/app-user/app-user.model';
import { RankRecalculationTask } from '@app/core/model/rank-recalculation-task/rank-recalculation-task.model';
import { AppUserLookup } from '@app/core/query/app-user.lookup';
import { RankRecalculationTaskLookup } from '@app/core/query/rank-recalculation-task.lookup';
import { AppUserService } from '@app/core/services/http/app-user.service';
import { RankRecalculationTaskService } from '@app/core/services/http/rank-recalculation-task.service';
import { AuthService } from '@app/core/services/ui/auth.service';
import { QueryParamsService } from '@app/core/services/ui/query-params.service';
import { BaseListingComponent } from '@common/base/base-listing-component';
import { PipeService } from '@common/formatting/pipe.service';
import { DataTableDateTimeFormatPipe } from '@common/formatting/pipes/date-time-format.pipe';
import { QueryResult } from '@common/model/query-result';
import { HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { ColumnDefinition, ColumnsChangedEvent, PageLoadEvent } from '@common/modules/listing/listing.component';
import { UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { Guid } from '@common/types/guid';
import { IsActive } from '@idp-service/core/enum/is-active.enum';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';

@Component({
	templateUrl: './rank-recalculation-task-listing.component.html',
	styleUrls: ['./rank-recalculation-task-listing.component.scss']
})
export class RankRecalculationTaskListingComponent extends BaseListingComponent<RankRecalculationTask, RankRecalculationTaskLookup> implements OnInit {
	
	@ViewChild('RankRecalculationTaskControlTemplate', {static: true}) rankRecalculationTaskControlTemplate: TemplateRef<any>;
	@ViewChild('RequestingUserTemplate', {static: true}) requestingUserTemplate: TemplateRef<any>;
  
	publish = false;
	userSettingsKey = { key: 'RankRecalculationTaskListingUserSettings' };
	propertiesAvailableForOrder: ColumnDefinition[];

  	statusType = RankRecalculationTaskStatus;
	userMap = new Map<Guid,AppUser>();

	constructor(
		protected router: Router,
		protected route: ActivatedRoute,
		protected uiNotificationService: UiNotificationService,
		protected httpErrorHandlingService: HttpErrorHandlingService,
		protected queryParamsService: QueryParamsService,
		private rankRecalculationTaskService: RankRecalculationTaskService,
		private userService: AppUserService,
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



	protected initializeLookup(): RankRecalculationTaskLookup {
		const lookup = new RankRecalculationTaskLookup();
		lookup.metadata = { countAll: true };
		lookup.page = { offset: 0, size: this.ITEMS_PER_PAGE };
		lookup.isActive = [IsActive.Active];
		lookup.order = { items: [this.toDescSortField(nameof<AppUser>(x => x.createdAt))] };
		this.updateOrderUiFields(lookup.order);

		this.propsToFields[nameof<RankRecalculationTask>(x => x.id)] = nameof<RankRecalculationTask>(x => x.id);
		this.propsToFields[nameof<RankRecalculationTask>(x => x.successfulReviewRankings)] = nameof<RankRecalculationTask>(x => x.successfulReviewRankings);
		this.propsToFields[nameof<RankRecalculationTask>(x => x.failedReviewRankings)] = nameof<RankRecalculationTask>(x => x.failedReviewRankings);
		this.propsToFields[nameof<RankRecalculationTask>(x => x.reviewRankingsToCalculate)] = nameof<RankRecalculationTask>(x => x.reviewRankingsToCalculate);
		this.propsToFields[nameof<RankRecalculationTask>(x => x.successfulObjectRankings)] = nameof<RankRecalculationTask>(x => x.successfulObjectRankings);
		this.propsToFields[nameof<RankRecalculationTask>(x => x.failedObjectRankings)] = nameof<RankRecalculationTask>(x => x.failedObjectRankings);
		this.propsToFields[nameof<RankRecalculationTask>(x => x.objectRankingsToCalculate)] = nameof<RankRecalculationTask>(x => x.objectRankingsToCalculate);
		this.propsToFields[nameof<RankRecalculationTask>(x => x.isActive)] = nameof<RankRecalculationTask>(x => x.isActive);
		this.propsToFields[nameof<RankRecalculationTask>(x => x.taskStatus)] = nameof<RankRecalculationTask>(x => x.taskStatus);
		this.propsToFields[nameof<RankRecalculationTask>(x => x.requestingUserId)] = nameof<RankRecalculationTask>(x => x.requestingUserId);
		this.propsToFields[nameof<RankRecalculationTask>(x => x.hash)] = nameof<RankRecalculationTask>(x => x.hash);
		this.propsToFields[nameof<RankRecalculationTask>(x => x.createdAt)] = nameof<RankRecalculationTask>(x => x.createdAt);
		this.propsToFields[nameof<RankRecalculationTask>(x => x.updatedAt)] = nameof<RankRecalculationTask>(x => x.updatedAt);
		this.propsToFields[nameof<RankRecalculationTask>(x => x.finishedAt)] = nameof<RankRecalculationTask>(x => x.finishedAt);
		this.propsToFields[nameof<RankRecalculationTask>(x => x.user)] = "User." + nameof<AppUser>(x => x.name);
    
		lookup.project = {
			fields: [
				this.propsToFields[nameof<RankRecalculationTask>(x => x.id)],
				this.propsToFields[nameof<RankRecalculationTask>(x => x.successfulReviewRankings)],
				this.propsToFields[nameof<RankRecalculationTask>(x => x.failedReviewRankings)],
				this.propsToFields[nameof<RankRecalculationTask>(x => x.reviewRankingsToCalculate)],
				this.propsToFields[nameof<RankRecalculationTask>(x => x.successfulObjectRankings)],
				this.propsToFields[nameof<RankRecalculationTask>(x => x.failedObjectRankings)],
				this.propsToFields[nameof<RankRecalculationTask>(x => x.objectRankingsToCalculate)],
				this.propsToFields[nameof<RankRecalculationTask>(x => x.isActive)],
				this.propsToFields[nameof<RankRecalculationTask>(x => x.taskStatus)],
				this.propsToFields[nameof<RankRecalculationTask>(x => x.requestingUserId)],
				this.propsToFields[nameof<RankRecalculationTask>(x => x.createdAt)],
				this.propsToFields[nameof<RankRecalculationTask>(x => x.updatedAt)],
				this.propsToFields[nameof<RankRecalculationTask>(x => x.finishedAt)],
				this.propsToFields[nameof<RankRecalculationTask>(x => x.hash)],
				this.propsToFields[nameof<RankRecalculationTask>(x => x.user)]
			]
		};

		return lookup;
	}

	protected setupColumns() {
		this.gridColumns.push(...[{
			languageName: 'APP.RANK-RECALCULATION-TASK-LISTING.FIELDS.REQUESTING-USER',
			prop: nameof<RankRecalculationTask>(x => x.user.name),
			alwaysShown: true
		},{
			prop: nameof<RankRecalculationTask>(x => x.successfulReviewRankings),
			sortable: true,
			languageName: 'APP.RANK-RECALCULATION-TASK-LISTING.FIELDS.SUCCESSFUL-REVIEW-RANKINGS'
		}, {
      		prop: nameof<RankRecalculationTask>(x => x.failedReviewRankings),
			sortable: true,
			languageName: 'APP.RANK-RECALCULATION-TASK-LISTING.FIELDS.FAILED-REVIEW-RANKINGS'
		}, {
      		prop: nameof<RankRecalculationTask>(x => x.reviewRankingsToCalculate),
			sortable: true,
			languageName: 'APP.RANK-RECALCULATION-TASK-LISTING.FIELDS.REVIEW-ITEMS-TO-CALCULATE'
		}, {
			prop: nameof<RankRecalculationTask>(x => x.successfulObjectRankings),
			sortable: true,
			languageName: 'APP.RANK-RECALCULATION-TASK-LISTING.FIELDS.SUCCESSFUL-OBJECT-RANKINGS'
		}, {
      		prop: nameof<RankRecalculationTask>(x => x.failedObjectRankings),
			sortable: true,
			languageName: 'APP.RANK-RECALCULATION-TASK-LISTING.FIELDS.FAILED-OBJECT-RANKINGS'
		}, {
      		prop: nameof<RankRecalculationTask>(x => x.objectRankingsToCalculate),
			sortable: true,
			languageName: 'APP.RANK-RECALCULATION-TASK-LISTING.FIELDS.OBJECT-ITEMS-TO-CALCULATE'
		}, {
      		prop: nameof<RankRecalculationTask>(x => x.taskStatus),
			sortable: true,
			languageName: 'APP.RANK-RECALCULATION-TASK-LISTING.FIELDS.TASK-STATUS',
			pipe: this.pipeService.getPipe<RankRecalculationTaskStatusPipe>(RankRecalculationTaskStatusPipe)
		}, {
			prop: nameof<RankRecalculationTask>(x => x.createdAt),
			sortable: true,
			languageName: 'APP.RANK-RECALCULATION-TASK-LISTING.FIELDS.CREATED-AT',
			pipe: this.pipeService.getPipe<DataTableDateTimeFormatPipe>(DataTableDateTimeFormatPipe).withFormat('short')
		}, {
			prop: nameof<RankRecalculationTask>(x => x.finishedAt),
			sortable: true,
			languageName: 'APP.RANK-RECALCULATION-TASK-LISTING.FIELDS.FINISHED-AT',
      		pipe: this.pipeService.getPipe<DataTableDateTimeFormatPipe>(DataTableDateTimeFormatPipe).withFormat('short')
		}, {
			languageName: 'APP.RANK-RECALCULATION-TASK-LISTING.FIELDS.CONTROL',
			cellTemplate: this.rankRecalculationTaskControlTemplate,
			alwaysShown: true
		}]);
    this.propertiesAvailableForOrder = this.gridColumns.filter(x => x.sortable);
	}

  public startTask() {
	let fields = [
		nameof<RankRecalculationTask>(x => x.id)
	]
	this.rankRecalculationTaskService.start(fields).subscribe(x => this.onPageLoad({ offset: 0 } as PageLoadEvent));
  }

  public cancelTask(taskId: Guid) {
	let fields = [
		nameof<RankRecalculationTask>(x => x.id)
	]
    this.rankRecalculationTaskService.cancel(taskId, fields).subscribe(x => this.onPageLoad({ offset: 0 } as PageLoadEvent));
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
				this.propsToFields[nameof<RankRecalculationTask>(x => x.id)],
				...columns.map(c => this.propsToFields[c])
			]
		};
		this.onPageLoad({ offset: 0 } as PageLoadEvent);
	}

	protected loadListing(): Observable<QueryResult<RankRecalculationTask>> {
		return this.rankRecalculationTaskService.query(this.lookup);
		// pipe(repeatWhen(x => x.pipe(delay(5000))), takeUntil(this._destroyed));
	}
}
