import { Guid } from "@common/types/guid";
import { BaseEntity, BaseEntityPersist } from '@common/base/base-entity.model';
import { RankingProfileType } from "@app/core/enum/ranking-profile-type.enum";
import { UpperBoundType } from "@app/core/enum/upper-bound-type.enum";
import { IsActive } from "@app/core/enum/is-active.enum";


export interface DataObjectTypeRankingMethodology extends BaseEntity {
	name: string,
    config: RankingConfiguration
}

export interface RankingConfiguration {
    rankingProfiles: BaseRankingProfile[]
}

export interface BaseRankingProfile {
	optionId?: Guid;
	optionWeight: number;
    mappedUserValues: number[];
    mappedNormalizedValues: number[];
    profileType: RankingProfileType;
    isActive: IsActive;
}

export interface AbsoluteIntegerRankingProfile extends BaseRankingProfile {
    mappedRangeBounds: BoundedType<number>[];
}

export interface AbsoluteDecimalRankingProfile extends BaseRankingProfile {
    mappedRangeBounds: BoundedType<number>[];
}

export interface PercentageRankingProfile extends BaseRankingProfile {
    mappedRangeBounds: BoundedType<number>[];
}

export interface ScaleRankingProfile extends BaseRankingProfile {
}

export interface SelectionRankingProfile extends BaseRankingProfile {
}


export interface DataObjectTypeRankingMethodologyPersist extends BaseEntityPersist {
	name: string,
    dataObjectTypeId: Guid,
    config: RankingConfigurationPersist
}

export interface RankingConfigurationPersist {
    rankingProfiles: BaseRankingProfilePersist[]
}

export interface BaseRankingProfilePersist {
	optionId?: Guid;
	optionWeight: number;
    mappedUserValues: number[];
    profileType: RankingProfileType;
    isActive: IsActive;
}

export interface AbsoluteIntegerRankingProfilePersist extends BaseRankingProfilePersist {
    mappedRangeBounds: BoundedType<number>[];
}

export interface AbsoluteDecimalRankingProfilePersist extends BaseRankingProfilePersist {
    mappedRangeBounds: BoundedType<number>[];
}

export interface PercentageRankingProfilePersist extends BaseRankingProfilePersist {
    mappedRangeBounds: BoundedType<number>[];
}

export interface ScaleRankingProfilePersist extends BaseRankingProfilePersist {
}

export interface SelectionRankingProfilePersist extends BaseRankingProfilePersist {
}

export interface BoundedType<Type> {
    value: Type;
    upperBoundType: UpperBoundType;
}