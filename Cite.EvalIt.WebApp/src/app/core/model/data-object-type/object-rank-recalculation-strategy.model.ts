import { ActivityTimeUnit } from "@app/core/enum/activity-time-unit.enum";
import { IsActive } from "@app/core/enum/is-active.enum";
import { ObjectRankRecalculationStrategyType } from "@app/core/enum/object-rank-recalculation-strategy-type.enum";
import { StrategyRangeInterpretation } from "@app/core/enum/strategy-range-interpretation.enum";
import { BoundedType } from "@app/core/model/data-object-type/ranking-methodology.model";
import { Guid } from "@common/types/guid";


export interface ObjectRankRecalculationStrategyConfiguration{
	strategies: BaseObjectRankRecalculationStrategy[];
}

export interface BaseObjectRankRecalculationStrategy {
    id?: Guid;
    strategyType: ObjectRankRecalculationStrategyType;
    strategyWeight: number;
    isActive: IsActive;
}

export interface AllEqualObjectRankRecalculationStrategy extends BaseObjectRankRecalculationStrategy
{ }

export interface LikedObjectRankRecalculationStrategy extends BaseObjectRankRecalculationStrategy
{
    likePartition: RangePartition<number>;
}

export interface NetworkPopularityObjectRankRecalculationStrategy extends BaseObjectRankRecalculationStrategy
{
    networkPopularityPartition: RangePartition<number>;
}

export interface NetworkTrustObjectRankRecalculationStrategy extends BaseObjectRankRecalculationStrategy
{
    networkTrustPartition: RangePartition<number>;
}

export interface ReviewDisciplineVisibilityObjectRankRecalculationStrategy extends BaseObjectRankRecalculationStrategy
{
    reviewDisciplinePartition: RangePartition<number>;
}

export interface AuthorDisciplineVisibilityObjectRankRecalculationStrategy extends BaseObjectRankRecalculationStrategy
{
    authorTrustDisciplinePartition: RangePartition<number>;
    authorFollowDisciplinePartition: RangePartition<number>;
}

export interface AuthorActivityObjectRankRecalculationStrategy extends BaseObjectRankRecalculationStrategy
{
    timeUnitCount: number;
    timeUnit: ActivityTimeUnit;

    authorObjectActivityPartition: RangePartition<number>;
    authorReviewActivityPartition: RangePartition<number>;
}


export interface ObjectRankRecalculationStrategyConfigurationPersist{
    dataObjectTypeId: Guid;
    strategies: BaseObjectRankRecalculationStrategyPersist[];
}

export interface BaseObjectRankRecalculationStrategyPersist {
    id?: Guid;
    strategyType: ObjectRankRecalculationStrategyType;
    strategyWeight: number;
    isActive: IsActive;
}

export interface AllEqualObjectRankRecalculationStrategyPersist extends BaseObjectRankRecalculationStrategyPersist
{ }

export interface LikedObjectRankRecalculationStrategyPersist extends BaseObjectRankRecalculationStrategyPersist
{
    likePartition: RangePartition<number>;
}

export interface NetworkPopularityObjectRankRecalculationStrategyPersist extends BaseObjectRankRecalculationStrategyPersist
{
    networkPopularityPartition: RangePartition<number>;
}

export interface NetworkTrustObjectRankRecalculationStrategyPersist extends BaseObjectRankRecalculationStrategyPersist
{
    networkTrustPartition: RangePartition<number>;
}

export interface ReviewDisciplineVisibilityObjectRankRecalculationStrategyPersist extends BaseObjectRankRecalculationStrategyPersist
{
    reviewDisciplinePartition: RangePartition<number>;
}

export interface AuthorDisciplineVisibilityObjectRankRecalculationStrategyPersist extends BaseObjectRankRecalculationStrategyPersist
{
    authorTrustDisciplinePartition: RangePartition<number>;
    authorFollowDisciplinePartition: RangePartition<number>;
}

export interface AuthorActivityObjectRankRecalculationStrategyPersist extends BaseObjectRankRecalculationStrategyPersist
{
    timeUnitCount: number;
    timeUnit: ActivityTimeUnit;

    authorObjectActivityPartition: RangePartition<number>;
    authorReviewActivityPartition: RangePartition<number>;
}

export interface RangePartition<T>
{
    rangeInterpretation: StrategyRangeInterpretation;
    rangeBounds: BoundedType<T>[];
    rangeValues: T[];
}