import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { AppUser } from '@app/core/model/app-user/app-user.model';
import { AuthService } from '@app/core/services/ui/auth.service';
import { QueryParamsService } from '@app/core/services/ui/query-params.service';
import { BaseListingComponent } from '@common/base/base-listing-component';
import { PipeService } from '@common/formatting/pipe.service';
import { QueryResult } from '@common/model/query-result';
import { HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { ColumnDefinition, ColumnsChangedEvent, PageLoadEvent, RowActivateEvent } from '@common/modules/listing/listing.component';
import { UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { IsActive } from '@app/core/enum/is-active.enum';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';
import { DataObject } from '@app/core/model/data-object/data-object.model';
import { DataObjectService } from '@app/core/services/http/data-object.service';
import { AbsoluteIntegerEvaluation, DataObjectReview, ReviewEvaluation } from '@app/core/model/data-object/data-object-review.model';
import { DataObjectReviewLookup } from '@app/core/query/data-object-review.lookup';
import { DataTableDateTimeFormatPipe } from '@common/formatting/pipes/date-time-format.pipe';
import { AppPermission } from '@app/core/enum/permission.enum';
import { AppUserService } from '@app/core/services/http/app-user.service';
import { DataObjectType } from '@app/core/model/data-object-type/data-object-type.model';
import { AbsoluteIntegerEvaluationOption, BaseEvaluationOption, ScaleEvaluationOption, SelectionEvaluationOption } from '@app/core/model/data-object-type/evaluation-configuration.model';
import { Guid } from '@common/types/guid';
import { DataObjectReviewFeedbackLookup } from '@app/core/query/data-object-review-feedback.lookup';
import { DataObjectReviewFeedback, FeedbackData } from '@app/core/model/data-object/data-object-review-feedback.model';
import { DataObjectReviewService } from '@app/core/services/http/data-object-review.service';
import { DataObjectReviewFeedbackService } from '@app/core/services/http/data-object-review-feedback.service';

@Component({
	selector: './app-data-object-review-listing',
	templateUrl: './data-object-review-listing.component.html',
	styleUrls: ['./data-object-review-listing.component.scss']
})
export class DataObjectReviewListingComponent extends BaseListingComponent<DataObjectReview, DataObjectReviewLookup> implements OnInit {
	
	@Input() object : DataObject;

	publish = false;
	userSettingsKey = { key: 'DataObjectListingUserSettings' };
	propertiesAvailableForOrder: ColumnDefinition[];
	lookupParams: any;

	feedback : Map<string,DataObjectReviewFeedback[]> = new Map<string,DataObjectReviewFeedback[]>();

	constructor(
		protected router: Router,
		protected route: ActivatedRoute,
		protected uiNotificationService: UiNotificationService,
		protected httpErrorHandlingService: HttpErrorHandlingService,
		protected queryParamsService: QueryParamsService,
		private dataObjectService: DataObjectService,
		private dataObjectReviewService: DataObjectReviewService,
		private dataObjectReviewFeedbackService: DataObjectReviewFeedbackService,
		public authService: AuthService,
		private pipeService: PipeService,
		public enumUtils: AppEnumUtils
		// private language: TranslateService,
		// private dialog: MatDialog
	) {
		super(router, route, uiNotificationService, httpErrorHandlingService, queryParamsService );
		// Lookup setup
		// Default lookup values are defined in the user settings class.
	}

	ngOnInit() {
		this.lookup = this.initializeLookup();		
		this.setupColumns();
		this.route.queryParamMap.pipe().subscribe((params: ParamMap) => {
			// If lookup is on the query params load it
			if (params.keys.length > 0 && params.has('lookup')) {
				this.lookupParams = this.queryParamsService.deSerializeLookup(params.get('lookup'));
				this.onPageLoad({ offset: this.lookup.page.offset / this.lookup.page.size } as PageLoadEvent);
			}
			else {
				this.changeSetting(this.lookup);
			}
		});
	}

	protected initializeLookup(): DataObjectReviewLookup {
		const lookup = new DataObjectReviewLookup();
		lookup.metadata = { countAll: true };
		lookup.page = { offset: 0, size: this.ITEMS_PER_PAGE };
		lookup.isActive = [IsActive.Active];
		lookup.objectIds = [this.object.id]
		this.updateOrderUiFields(lookup.order);
		var reviewEvalStr = "ReviewEvaluation.";
		var objectTypeStr = "DataObjectType.";
		var userStr = "User.";
		var objectTypeConfigStr = "EvaluationConfiguration.";
		lookup.project = {
			fields: [
			  nameof<DataObjectReview>(x => x.id),
			  nameof<DataObjectReview>(x => x.anonymity),
			  nameof<DataObjectReview>(x => x.visibility),
			  nameof<DataObjectReview>(x => x.evaluationData),
			  nameof<DataObjectReview>(x => x.isActive),
			  nameof<DataObjectReview>(x => x.createdAt),
			  nameof<DataObjectReview>(x => x.updatedAt),
			  nameof<DataObjectReview>(x => x.userId),
			  nameof<DataObjectReview>(x => x.userIdHash),
			  nameof<DataObjectReview>(x => x.dataObjectId),
			  nameof<DataObjectReview>(x => x.rankScore),
			  nameof<DataObjectReview>(x => x.hash),
			  nameof<DataObjectReview>(x => x.canEdit),
			  nameof<DataObjectReview>(x => x.isMine),

			  userStr + nameof<AppUser>(x => x.id),
			  userStr + nameof<AppUser>(x => x.name),

			  reviewEvalStr + nameof<ReviewEvaluation>(x => x.optionId),
			  reviewEvalStr + nameof<ReviewEvaluation>(x => x.evaluationType),
			  reviewEvalStr + nameof<AbsoluteIntegerEvaluation>(x => x.values),
		
			  objectTypeStr + nameof<DataObjectType>(x => x.id),
			  objectTypeStr + nameof<DataObjectType>(x => x.name),
			  objectTypeStr + nameof<DataObjectType>(x => x.config),
			  objectTypeStr + nameof<DataObjectType>(x => x.updatedAt),
			  objectTypeStr + objectTypeConfigStr + nameof<BaseEvaluationOption>(x => x.isActive),
			  objectTypeStr + objectTypeConfigStr + nameof<BaseEvaluationOption>(x => x.isMandatory),
			  objectTypeStr + objectTypeConfigStr + nameof<BaseEvaluationOption>(x => x.label),
			  objectTypeStr + objectTypeConfigStr + nameof<BaseEvaluationOption>(x => x.optionType),
			  objectTypeStr + objectTypeConfigStr + nameof<BaseEvaluationOption>(x => x.optionId),
		
			  objectTypeStr + objectTypeConfigStr + nameof<AbsoluteIntegerEvaluationOption>(x => x.measurementUnit),
			  objectTypeStr + objectTypeConfigStr + nameof<SelectionEvaluationOption>(x => x.evaluationSelectionOptions),
			  objectTypeStr + objectTypeConfigStr + nameof<ScaleEvaluationOption>(x => x.evaluationScale)
			]};

		return lookup;
	}

	protected setupColumns() {
		this.gridColumns.push(...[{
			prop: nameof<DataObjectReview>(x => x.createdAt),
			sortable: false,
			languageName: 'APP.DATA-OBJECT-REVIEW-LISTING.FIELDS.CREATED-AT',
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
				nameof<AppUser>(x => x.id),
				...columns
			]
		};
		this.onPageLoad({ offset: 0 } as PageLoadEvent);
	}

	protected loadListing(): Observable<QueryResult<DataObjectReview>> {
		return this.dataObjectReviewService.query(this.lookup).pipe(tap(data => {

			const feedbackLookup: DataObjectReviewFeedbackLookup = new DataObjectReviewFeedbackLookup();
			feedbackLookup.reviewIds = data.items.map(x => x.id);
			feedbackLookup.isActive = [IsActive.Active];
			const feedbackStr = "FeedbackData.";
			const userStr = "User.";
			feedbackLookup.project.fields = [
				nameof<DataObjectReviewFeedback>(x => x.id),
				nameof<DataObjectReviewFeedback>(x => x.dataObjectReviewId),
				nameof<DataObjectReviewFeedback>(x => x.canEdit),
				nameof<DataObjectReviewFeedback>(x => x.isMine),
				nameof<DataObjectReviewFeedback>(x => x.userId),
				nameof<DataObjectReviewFeedback>(x => x.hash),
				userStr + nameof<AppUser>(x => x.id),
				userStr + nameof<AppUser>(x => x.name),
				feedbackStr + nameof<FeedbackData>(x => x.like)
			];

			this.dataObjectReviewFeedbackService.query(feedbackLookup).subscribe(data => {
				let feedbackMap = new Map<string, DataObjectReviewFeedback[]>();
				data.items.forEach(f => {
					if( feedbackMap.has(f.dataObjectReviewId.toString()) ) feedbackMap.get(f.dataObjectReviewId.toString()).push(f);
					else feedbackMap.set(f.dataObjectReviewId.toString(), [f])
				});
				this.feedback = feedbackMap;
			});
		}));
	}

	onNewItem() {
		this.navigateTo('./review/new/editor');
	}

	onEditClicked(event: RowActivateEvent) {
		if (event && event.type === 'click' && event.row && event.row.id && this.authService.hasPermission(AppPermission.EditDataObjectReview)) {
			this.navigateTo('./review/' + event.row.id + "/editor");
		}
	}

	onViewClicked(event: RowActivateEvent) {
		if (event && event.type === 'click' && event.row && event.row.id) {
			this.navigateTo('./review/' + event.row.id + "/viewer");
		}
	}

	onNameClicked(userId: Guid) {
		this.lookup.objectIds = undefined;
		this.navigateTo('/user-public-profile/' + userId);
	}

	onRefreshReview(reviewId: Guid) {
		this.onPageLoad({ offset: 0 } as PageLoadEvent);
	}
}
