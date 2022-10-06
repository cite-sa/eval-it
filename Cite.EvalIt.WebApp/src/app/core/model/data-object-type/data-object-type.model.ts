import { IconIdentifierType } from '@app/core/enum/icon-identifier-type.enum';
import { EvaluationConfiguration, EvaluationConfigurationPersist } from '@app/core/model/data-object-type/evaluation-configuration.model';
import { ObjectRankRecalculationStrategyConfiguration, ObjectRankRecalculationStrategyConfigurationPersist } from '@app/core/model/data-object-type/object-rank-recalculation-strategy.model';
import { DataObjectTypeRankingMethodology } from '@app/core/model/data-object-type/ranking-methodology.model';
import { RegistrationInformation, RegistrationInformationPersist } from '@app/core/model/data-object-type/registration-information.model';
import { BaseEntity, BaseEntityPersist } from '@common/base/base-entity.model';
import { Guid } from '@common/types/guid';


export interface DataObjectType extends BaseEntity  {
	name: string;
	config: EvaluationConfiguration;
	info: RegistrationInformation;
	strategyConfig: ObjectRankRecalculationStrategyConfiguration;
	selectedRankingMethodologyId: Guid;
	multipleReviewOption: boolean;
	rankingMethodologies: DataObjectTypeRankingMethodology[];
}

export interface DataObjectTypePersist extends BaseEntityPersist {
	name: string;
	config: EvaluationConfigurationPersist;
	info: RegistrationInformationPersist;
	selectedRankingMethodologyId?: Guid;
	multipleReviewOption: boolean;
}


export interface InputScaleValueData {
	label: string,
	idType: IconIdentifierType,
	iconIdentifier: string,
	value: number
}

export interface InputSelectionOptionsData {
	key: string,
	value: string
}

export interface EvaluationScaleValueData {
	label: string,
	idType: IconIdentifierType,
	iconIdentifier: string,
	value: number
}

export interface EvaluationSelectionOptionsData {
	key: string,
	value: string
}