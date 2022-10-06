import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AppUser } from '@app/core/model/app-user/app-user.model';
import { DataObjectType } from '@app/core/model/data-object-type/data-object-type.model';
import { AbsoluteIntegerEvaluationOption, BaseEvaluationOption, ScaleEvaluationOption, SelectionEvaluationOption } from '@app/core/model/data-object-type/evaluation-configuration.model';
import { AbsoluteIntegerEvaluation, DataObjectReview, ReviewEvaluation } from '@app/core/model/data-object/data-object-review.model';
import { DataObject } from '@app/core/model/data-object/data-object.model';
import { DataObjectService } from '@app/core/services/http/data-object.service';
import { BaseEditorResolver } from '@common/base/base-editor.resolver';
import { Guid } from '@common/types/guid';
import { takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';

@Injectable()
export class DataObjectReviewEditorResolver extends BaseEditorResolver{

  constructor(private dataObjectService: DataObjectService) {
    super();
  }

  public static lookupFields(): string[]{
    var reviewStr = "DataObjectReview.";
    var reviewEvalStr = "ReviewEvaluation.";
    var objectTypeStr = "DataObjectType.";
    var objectTypeConfigStr = "EvaluationConfiguration.";
    var userStr = "User.";

    return [
			...BaseEditorResolver.lookupFields(),
			nameof<DataObject>(x => x.title),
			nameof<DataObject>(x => x.dataObjectTypeId),
      reviewStr + nameof<DataObjectReview>(x => x.id),
      reviewStr + nameof<DataObjectReview>(x => x.anonymity),
      reviewStr + nameof<DataObjectReview>(x => x.visibility),
      reviewStr + nameof<DataObjectReview>(x => x.evaluationData),
      reviewStr + nameof<DataObjectReview>(x => x.canEdit),
      reviewStr + nameof<DataObjectReview>(x => x.isActive),
      reviewStr + nameof<DataObjectReview>(x => x.createdAt),
      reviewStr + nameof<DataObjectReview>(x => x.updatedAt),
      reviewStr + nameof<DataObjectReview>(x => x.userId),
      reviewStr + nameof<DataObjectReview>(x => x.userIdHash),
      reviewStr + nameof<DataObjectReview>(x => x.hash),

      reviewStr + userStr + nameof<AppUser>(x => x.id),
      reviewStr + userStr + nameof<AppUser>(x => x.name),

      reviewStr + reviewEvalStr + nameof<ReviewEvaluation>(x => x.optionId),
      reviewStr + reviewEvalStr + nameof<ReviewEvaluation>(x => x.evaluationType),
      reviewStr + reviewEvalStr + nameof<AbsoluteIntegerEvaluation>(x => x.values),

      reviewStr + objectTypeStr + nameof<DataObjectType>(x => x.id),
      reviewStr + objectTypeStr + nameof<DataObjectType>(x => x.name),
      reviewStr + objectTypeStr + nameof<DataObjectType>(x => x.config),
      reviewStr + objectTypeStr + nameof<DataObjectType>(x => x.updatedAt),
      reviewStr + objectTypeStr + objectTypeConfigStr + nameof<BaseEvaluationOption>(x => x.isActive),
      reviewStr + objectTypeStr + objectTypeConfigStr + nameof<BaseEvaluationOption>(x => x.isMandatory),
      reviewStr + objectTypeStr + objectTypeConfigStr + nameof<BaseEvaluationOption>(x => x.label),
      reviewStr + objectTypeStr + objectTypeConfigStr + nameof<BaseEvaluationOption>(x => x.optionType),
      reviewStr + objectTypeStr + objectTypeConfigStr + nameof<BaseEvaluationOption>(x => x.optionId),

      reviewStr + objectTypeStr + objectTypeConfigStr + nameof<AbsoluteIntegerEvaluationOption>(x => x.measurementUnit),
      reviewStr + objectTypeStr + objectTypeConfigStr + nameof<AbsoluteIntegerEvaluationOption>(x => x.upperBound),
      reviewStr + objectTypeStr + objectTypeConfigStr + nameof<AbsoluteIntegerEvaluationOption>(x => x.lowerBound),
      reviewStr + objectTypeStr + objectTypeConfigStr + nameof<SelectionEvaluationOption>(x => x.evaluationSelectionOptions),
      reviewStr + objectTypeStr + objectTypeConfigStr + nameof<ScaleEvaluationOption>(x => x.evaluationScale),
      reviewStr + objectTypeStr + objectTypeConfigStr + nameof<ScaleEvaluationOption>(x => x.scaleDisplayOption)
		]
  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    const fields = [
			...DataObjectReviewEditorResolver.lookupFields(),
		];
    return this.dataObjectService.getSingle(Guid.parse(route.paramMap.get('id1')), fields ).pipe(takeUntil(this._destroyed));
  }
}
