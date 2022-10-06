import { Injectable } from '@angular/core';
import { EvaluationConfigurationType } from '@app/core/enum/evaluation-configuration-type.enum';
import { IsActive } from '@app/core/enum/is-active.enum';
import { LanguageType } from '@app/core/enum/language-type.enum';
import { ObjectRankRecalculationStrategyType } from '@app/core/enum/object-rank-recalculation-strategy-type.enum';
import { RankRecalculationTaskStatus } from '@app/core/enum/rank-recalculation-task-status.enum';
import { RegistrationInformationType } from '@app/core/enum/registration-information-type.enum';
import { RoleType } from '@app/core/enum/role-type.enum';
import { TagAppliesTo } from '@app/core/enum/tag-applies-to.enum';
import { TagType } from '@app/core/enum/tag-type.enum';
import { UserNetworkRelationship } from '@app/core/enum/user-network-relationship.enum';
import { BaseEnumUtilsService } from '@common/base/base-enum-utils.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class AppEnumUtils extends BaseEnumUtilsService {
	constructor(private language: TranslateService) { super(); }

	public toRoleTypeString(value: RoleType): string {
		switch (value) {
			case RoleType.Admin: return this.language.instant('APP.TYPES.APP-ROLE.ADMIN');
			case RoleType.ConfigurationAdmin: return this.language.instant('APP.TYPES.APP-ROLE.CONFIGURATION-ADMIN');
			case RoleType.UserValidator: return this.language.instant('APP.TYPES.APP-ROLE.USER-VALIDATOR');
			case RoleType.ObjectUploader: return this.language.instant('APP.TYPES.APP-ROLE.OBJECT-UPLOADER');
			case RoleType.Reviewer: return this.language.instant('APP.TYPES.APP-ROLE.REVIEWER');
			case RoleType.User: return this.language.instant('APP.TYPES.APP-ROLE.USER');
			default: return '';
		}
	}

	public toIsActiveString(value: IsActive): string {
		switch (value) {
			case IsActive.Active: return this.language.instant('APP.TYPES.IS-ACTIVE.ACTIVE');
			case IsActive.Inactive: return this.language.instant('APP.TYPES.IS-ACTIVE.INACTIVE');
			default: return '';
		}
	}

	public toLanguageTypeString(value: LanguageType): string {
		switch (value) {
			case LanguageType.English: return this.language.instant('APP.TYPES.LANGUAGE-TYPE.ENGLISH');
			case LanguageType.Greek: return this.language.instant('APP.TYPES.LANGUAGE-TYPE.GREEK');
			default: return '';
		}
	}

	public toTagAppliesString(value: TagAppliesTo): string {
		switch (value) {
			case TagAppliesTo.User: return this.language.instant('APP.TYPES.TAG-APPLIES-TO.USER');
			case TagAppliesTo.Object: return this.language.instant('APP.TYPES.TAG-APPLIES-TO.OBJECT');
			case TagAppliesTo.All: return this.language.instant('APP.TYPES.TAG-APPLIES-TO.ALL');
			default: return '';
		}
	}

	public toTagTypeString(value: TagType): string {
		switch (value) {
			case TagType.Discipline: return this.language.instant('APP.TYPES.TAG-TYPE.DISCIPLINE');
			case TagType.Hashtag: return this.language.instant('APP.TYPES.TAG-TYPE.HASHTAG');
			default: return '';
		}
	}

	public toUserNetworkRelationshipString(value: UserNetworkRelationship): string {
		switch (value) {
			case UserNetworkRelationship.Follow : return this.language.instant('APP.TYPES.USER-NETWORK-RELATIONSHIP.FOLLOW');
			case UserNetworkRelationship.Trust : return this.language.instant('APP.TYPES.USER-NETWORK-RELATIONSHIP.TRUST');
			default: return '';
		}
	}

	public toRegistrationInformationTypeString(value: RegistrationInformationType): string {
		switch (value) {
			case RegistrationInformationType.AbsoluteDecimalInputOption : return this.language.instant('APP.TYPES.REGISTRATION-INFORMATION.ABSOLUTE-DECIMAL');
			case RegistrationInformationType.AbsoluteIntegerInputOption : return this.language.instant('APP.TYPES.REGISTRATION-INFORMATION.ABSOLUTE-INTEGER');
			case RegistrationInformationType.PercentageInputOption : return this.language.instant('APP.TYPES.REGISTRATION-INFORMATION.PERCENTAGE');
			case RegistrationInformationType.TextInputOption : return this.language.instant('APP.TYPES.REGISTRATION-INFORMATION.TEXT');
			case RegistrationInformationType.ScaleInputOption : return this.language.instant('APP.TYPES.REGISTRATION-INFORMATION.SCALE');
			case RegistrationInformationType.SelectionInputOption : return this.language.instant('APP.TYPES.REGISTRATION-INFORMATION.SELECTION');
			default: return '';
		}
	}

	public toEvaluationConfigurationTypeString(value: EvaluationConfigurationType): string {
		switch (value) {
			case EvaluationConfigurationType.AbsoluteDecimalEvaluationOption : return this.language.instant('APP.TYPES.EVALUATION-CONFIGURATION.ABSOLUTE-DECIMAL');
			case EvaluationConfigurationType.AbsoluteIntegerEvaluationOption : return this.language.instant('APP.TYPES.EVALUATION-CONFIGURATION.ABSOLUTE-INTEGER');
			case EvaluationConfigurationType.PercentageEvaluationOption : return this.language.instant('APP.TYPES.EVALUATION-CONFIGURATION.PERCENTAGE');
			case EvaluationConfigurationType.TextEvaluationOption : return this.language.instant('APP.TYPES.EVALUATION-CONFIGURATION.TEXT');
			case EvaluationConfigurationType.ScaleEvaluationOption : return this.language.instant('APP.TYPES.EVALUATION-CONFIGURATION.SCALE');
			case EvaluationConfigurationType.SelectionEvaluationOption : return this.language.instant('APP.TYPES.EVALUATION-CONFIGURATION.SELECTION');
			default: return '';
		}
	}

	public toObjectRankRecalculationStrategyTypeString(value: ObjectRankRecalculationStrategyType): string {
		switch (value) {
			case ObjectRankRecalculationStrategyType.AllEqual : return this.language.instant('APP.TYPES.OBJECT-RANK-RECALCULATION-STRATEGY.ALL-EQUAL');
			case ObjectRankRecalculationStrategyType.Liked : return this.language.instant('APP.TYPES.OBJECT-RANK-RECALCULATION-STRATEGY.LIKED');
			case ObjectRankRecalculationStrategyType.NetworkPopularity : return this.language.instant('APP.TYPES.OBJECT-RANK-RECALCULATION-STRATEGY.NETWORK-POPULARITY');
			case ObjectRankRecalculationStrategyType.NetworkTrust : return this.language.instant('APP.TYPES.OBJECT-RANK-RECALCULATION-STRATEGY.NETWORK-TRUST');
			case ObjectRankRecalculationStrategyType.ReviewDisciplineVisibility : return this.language.instant('APP.TYPES.OBJECT-RANK-RECALCULATION-STRATEGY.REVIEW-DISCIPLINE-VISIBILITY');
			case ObjectRankRecalculationStrategyType.AuthorDisciplineVisibility : return this.language.instant('APP.TYPES.OBJECT-RANK-RECALCULATION-STRATEGY.AUTHOR-DISCIPLINE-VISIBILITY');
			case ObjectRankRecalculationStrategyType.AuthorActivity : return this.language.instant('APP.TYPES.OBJECT-RANK-RECALCULATION-STRATEGY.AUTHOR-ACTIVITY');
			default: return '';
		}
	}

	public toRankRecalculationTaskStatusString(value: RankRecalculationTaskStatus): string {
		switch (value) {
			case RankRecalculationTaskStatus.Pending : return this.language.instant('APP.TYPES.RANK-RECALCULATION-TASK-STATUS.PENDING');
			case RankRecalculationTaskStatus.Processing : return this.language.instant('APP.TYPES.RANK-RECALCULATION-TASK-STATUS.PROCESSING');
			case RankRecalculationTaskStatus.Successful : return this.language.instant('APP.TYPES.RANK-RECALCULATION-TASK-STATUS.SUCCESSFUL');
			case RankRecalculationTaskStatus.Error : return this.language.instant('APP.TYPES.RANK-RECALCULATION-TASK-STATUS.ERROR');
			case RankRecalculationTaskStatus.Cancelled : return this.language.instant('APP.TYPES.RANK-RECALCULATION-TASK-STATUS.CANCELLED');
			case RankRecalculationTaskStatus.Aborted : return this.language.instant('APP.TYPES.RANK-RECALCULATION-TASK-STATUS.ABORTED');
			default: return '';
		}
	}
}
