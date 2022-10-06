import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { IsActive } from '@app/core/enum/is-active.enum';
import { AppPermission } from '@app/core/enum/permission.enum';
import { AppUser } from '@app/core/model/app-user/app-user.model';
import { DataObjectType } from '@app/core/model/data-object-type/data-object-type.model';
import { AbsoluteIntegerEvaluationOption, BaseEvaluationOption, ScaleEvaluationOption, SelectionEvaluationOption } from '@app/core/model/data-object-type/evaluation-configuration.model';
import { AbsoluteDecimalInputOption, RegistrationInformationInputOption, ScaleInputOption, SelectionInputOption } from '@app/core/model/data-object-type/registration-information.model';
import { AbsoluteDecimalAttribute, DataObjectAttribute } from '@app/core/model/data-object/data-object-attribute.model';
import { DataObjectReviewFeedback, FeedbackData } from '@app/core/model/data-object/data-object-review-feedback.model';
import { AbsoluteIntegerEvaluation, DataObjectReview, ReviewEvaluation } from '@app/core/model/data-object/data-object-review.model';
import { DataObject } from '@app/core/model/data-object/data-object.model';
import { AppUserLookup } from '@app/core/query/app-user.lookup';
import { DataObjectReviewFeedbackLookup } from '@app/core/query/data-object-review-feedback.lookup';
import { DataObjectReviewLookup } from '@app/core/query/data-object-review.lookup';
import { DataObjectLookup } from '@app/core/query/data-object.lookup';
import { AppUserService } from '@app/core/services/http/app-user.service';
import { DataObjectReviewFeedbackService } from '@app/core/services/http/data-object-review-feedback.service';
import { DataObjectReviewService } from '@app/core/services/http/data-object-review.service';
import { DataObjectService } from '@app/core/services/http/data-object.service';
import { AuthService } from '@app/core/services/ui/auth.service';
import { QueryParamsService } from '@app/core/services/ui/query-params.service';
import { RowActivateEvent } from '@common/modules/listing/listing.component';
import { Guid } from '@common/types/guid';
import { forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';

@Component({
  selector: 'app-user-public-profile',
  templateUrl: './user-public-profile.component.html',
  styleUrls: ['./user-public-profile.component.scss']
})
export class UserPublicProfileComponent implements OnInit {
                
  SAMPLE_COUNT: number = 3;

	id: Guid;
  user: AppUser;

  reviewCount: number;
  sampleReviews: DataObjectReview[] = [];

  objectCount: number;
  sampleObjects: DataObject[] = [];

	names : Map<string,string> = new Map<string,string>();
	feedback : Map<string,DataObjectReviewFeedback[]> = new Map<string,DataObjectReviewFeedback[]>();

	lookupParams: any;
	private lv = 0;

  constructor(  private userService: AppUserService,
                private dataObjectService: DataObjectService,
                private dataObjectReviewService: DataObjectReviewService,
                private dataObjectReviewFeedbackService: DataObjectReviewFeedbackService,
                private authService: AuthService,
                private router: Router,
                protected route: ActivatedRoute,
                private queryParamsService: QueryParamsService) { }

  ngOnInit(): void {
    this.route.url.pipe(
      switchMap(data => {
        this.id = Guid.parse(data[0].path);
        
        const reviewLookup = new DataObjectReviewLookup();
        reviewLookup.userIds = [this.id];
        reviewLookup.page = { offset: 0, size: this.SAMPLE_COUNT};
        reviewLookup.metadata = { countAll: true };
        reviewLookup.isActive = [IsActive.Active];
        reviewLookup.order = {
          items: ['-' + nameof<DataObjectReview>(x => x.createdAt)]
        };
        const reviewEvalStr = "ReviewEvaluation.";
        const typeStr = "DataObjectType.";
        const userStr = "User.";
        const objectTypeConfigStr = "EvaluationConfiguration.";
        reviewLookup.project.fields = [
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
            nameof<DataObjectReview>(x => x.hash),
            nameof<DataObjectReview>(x => x.canEdit),

            userStr + nameof<AppUser>(x => x.id),
            userStr + nameof<AppUser>(x => x.name),
        
            reviewEvalStr + nameof<ReviewEvaluation>(x => x.optionId),
            reviewEvalStr + nameof<ReviewEvaluation>(x => x.evaluationType),
            reviewEvalStr + nameof<AbsoluteIntegerEvaluation>(x => x.values),
        
            typeStr + nameof<DataObjectType>(x => x.id),
            typeStr + nameof<DataObjectType>(x => x.name),
            typeStr + nameof<DataObjectType>(x => x.config),
            typeStr + nameof<DataObjectType>(x => x.updatedAt),
            typeStr + objectTypeConfigStr + nameof<BaseEvaluationOption>(x => x.isActive),
            typeStr + objectTypeConfigStr + nameof<BaseEvaluationOption>(x => x.isMandatory),
            typeStr + objectTypeConfigStr + nameof<BaseEvaluationOption>(x => x.label),
            typeStr + objectTypeConfigStr + nameof<BaseEvaluationOption>(x => x.optionType),
            typeStr + objectTypeConfigStr + nameof<BaseEvaluationOption>(x => x.optionId),
        
            typeStr + objectTypeConfigStr + nameof<AbsoluteIntegerEvaluationOption>(x => x.measurementUnit),
            typeStr + objectTypeConfigStr + nameof<SelectionEvaluationOption>(x => x.evaluationSelectionOptions),
            typeStr + objectTypeConfigStr + nameof<ScaleEvaluationOption>(x => x.evaluationScale)
          ];


        const objectLookup = new DataObjectLookup();
        objectLookup.userIds = [this.id];
        objectLookup.page = { offset: 0, size: this.SAMPLE_COUNT};
        objectLookup.metadata = { countAll: true };
        objectLookup.isActive = [IsActive.Active];
        objectLookup.order = {
          items: ['-' + nameof<DataObjectReview>(x => x.createdAt)]
        };
        const attrStr = "DataObjectAttributeData.";
        const infoStr = "RegistrationInformation.";
        objectLookup.project.fields = [
            nameof<DataObject>(x => x.id),
            nameof<DataObject>(x => x.title),
            nameof<DataObject>(x => x.description),
            nameof<DataObject>(x => x.userDefinedIds),
            nameof<DataObject>(x => x.userId),
            nameof<DataObject>(x => x.dataObjectTypeId),
            nameof<DataObject>(x => x.attributeData),
            nameof<DataObject>(x => x.isActive),
            nameof<DataObject>(x => x.createdAt),
            nameof<DataObject>(x => x.updatedAt),
            attrStr + nameof<DataObjectAttribute>(x => x.attributeType),
            attrStr + nameof<DataObjectAttribute>(x => x.optionId),
            attrStr + nameof<AbsoluteDecimalAttribute>(x => x.values),
            typeStr + nameof<DataObjectType>(x => x.name),
            typeStr + nameof<DataObjectType>(x => x.id),
            typeStr + nameof<DataObjectType>(x => x.updatedAt),
            typeStr + infoStr + nameof<RegistrationInformationInputOption>(x => x.optionId),
            typeStr + infoStr + nameof<RegistrationInformationInputOption>(x => x.optionType),
            typeStr + infoStr + nameof<RegistrationInformationInputOption>(x => x.label),
            typeStr + infoStr + nameof<RegistrationInformationInputOption>(x => x.multiValue),
            typeStr + infoStr + nameof<RegistrationInformationInputOption>(x => x.isMandatory),
            typeStr + infoStr + nameof<RegistrationInformationInputOption>(x => x.isActive),

            typeStr + infoStr + nameof<AbsoluteDecimalInputOption>(x => x.measurementUnit),
            typeStr + infoStr + nameof<AbsoluteDecimalInputOption>(x => x.validationRegexp),
            typeStr + infoStr + nameof<ScaleInputOption>(x => x.inputScale),
            typeStr + infoStr + nameof<SelectionInputOption>(x => x.inputSelectionOptions),
          ]

        let reviewObs = this.dataObjectReviewService.query(reviewLookup);
        let objectObs = this.dataObjectService.query(objectLookup);
        
        return forkJoin([reviewObs, objectObs]);
      }), switchMap(data2 => {
      this.reviewCount = data2[0].count;
      this.sampleReviews = data2[0].items;

      this.objectCount = data2[1].count;
      this.sampleObjects = data2[1].items;

      const feedbackLookup = new DataObjectReviewFeedbackLookup();
      feedbackLookup.reviewIds = this.sampleReviews.map(x => x.id);
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
          feedbackStr + nameof<FeedbackData>(x => x.like),
          userStr + nameof<AppUser>(x => x.id),
          userStr + nameof<AppUser>(x => x.name)
        ]

      return this.dataObjectReviewFeedbackService.query(feedbackLookup);
    }), switchMap(data3 => {

      let feedbackMap = new Map<string, DataObjectReviewFeedback[]>();
      data3.items.forEach(f => {
        if( feedbackMap.has(f.dataObjectReviewId.toString()) ) feedbackMap.get(f.dataObjectReviewId.toString()).push(f);
        else feedbackMap.set(f.dataObjectReviewId.toString(), [f])
      });
      this.feedback = feedbackMap;

      const userLookup = new AppUserLookup();
      userLookup.ids = [this.id].concat(data3.items.filter(x => x.userId != null).map(x => x.userId));
      userLookup.metadata = { countAll: true };
      userLookup.isActive = [IsActive.Active];
      userLookup.project.fields = [
        nameof<AppUser>(x => x.id),
        nameof<AppUser>(x => x.name)   
      ]

      return this.userService.query(userLookup);
    })).subscribe(res => {
      let userMap =  new Map<string,string>();
      res.items.forEach(u => userMap.set(u.id.toString(), u.name))
      this.names = userMap;

      this.user = res.items.filter(x => x.id == this.id)[0]
    });

    this.route.queryParamMap.pipe().subscribe((params: ParamMap) => {
			// If lookup is on the query params load it
			if (params.keys.length > 0 && params.has('lookup')) {
				this.lookupParams = this.queryParamsService.deSerializeLookup(params.get('lookup'));
			}
		});
  }

  getFeedbackByReviewId(id: Guid) : DataObjectReviewFeedback[] {
		if( id && this.feedback.has(id.toString())) return this.feedback.get(id.toString());

		return null;
	}

  navigateTo(url: string) {
		this.router.navigate([url], { relativeTo: this.route, queryParams: { 'lookup': this.queryParamsService.serializeLookup(this.lookupParams), 'lv': ++this.lv }});
	}

  onObjectEditClicked(event: RowActivateEvent) {
		if (event && event.type === 'click' && event.row && event.row.id && this.authService.hasPermission(AppPermission.EditDataObject)) {
			this.navigateTo('/data-object/' + event.row.id + "/editor");
		}
  }

  onObjectViewClicked(event: RowActivateEvent) {
    if (event && event.type === 'click' && event.row && event.row.id) {
			this.navigateTo('/data-object/' + event.row.id );
		}
  }

  onReviewEditClicked(event: RowActivateEvent) {
    if (event && event.type === 'click' && event.row && event.row.id && this.authService.hasPermission(AppPermission.EditDataObjectReview)) {
			this.navigateTo('/data-object/' + event.row.dataObjectId + "/review/" + event.row.id + "/editor");
		}
  }

  onReviewViewClicked(event: RowActivateEvent) {
    if (event && event.type === 'click' && event.row && event.row.id) {
			this.navigateTo('/data-object/' + event.row.dataObjectId + "/review/" + event.row.id + "/viewer");
		}
  }
}
