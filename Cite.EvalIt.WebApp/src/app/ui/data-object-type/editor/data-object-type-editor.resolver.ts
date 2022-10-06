import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { DataObjectType } from '@app/core/model/data-object-type/data-object-type.model';
import { DataObjectTypeService } from '@app/core/services/http/data-object-type.service';
import { BaseEditorResolver } from '@common/base/base-editor.resolver';
import { Guid } from '@common/types/guid';
import { takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';

@Injectable()
export class DataObjectTypeEditorResolver extends BaseEditorResolver{

  constructor(private dataObjectTypeService: DataObjectTypeService) {
    super();
  }

  public static lookupFields(): string[]{
    const registrationInfoPrefix = "RegistrationInformation.";
	const allInformationFields = "AllInformation";

    const evaluationConfigPrefix = "EvaluationConfiguration.";
	const allEvaluationFields = "AllEvaluation";

    const strategyConfigPrefix = "ObjectRankRecalculationStrategyConfiguration.";
	const allStrategyFields = "AllStrategy";

	const methodologyPrefix = "DataObjectTypeRankingMethodology.";
	const allMethodologyFields = "AllMethodology";

	const profilePrefix = "BaseRankingProfile.";
	const allProfileFields = "AllProfile";

    return [
			...BaseEditorResolver.lookupFields(),
			nameof<DataObjectType>(x => x.name),
			nameof<DataObjectType>(x => x.selectedRankingMethodologyId),
			nameof<DataObjectType>(x => x.multipleReviewOption),

			registrationInfoPrefix + allInformationFields,
			evaluationConfigPrefix + allEvaluationFields,
			strategyConfigPrefix + allStrategyFields,
			methodologyPrefix + allMethodologyFields,
			methodologyPrefix + profilePrefix + allProfileFields
		]
  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    const fields = [
			...DataObjectTypeEditorResolver.lookupFields(),
		];
    return this.dataObjectTypeService.getSingle(Guid.parse(route.paramMap.get('id')), fields ).pipe(takeUntil(this._destroyed));
  }
}
