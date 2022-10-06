import { TagAppliesTo } from '@app/core/enum/tag-applies-to.enum';
import { TagType } from '@app/core/enum/tag-type.enum';
import { AppUser } from '@app/core/model/app-user/app-user.model';
import { DataObject } from '@app/core/model/data-object/data-object.model';
import { BaseEntity, BaseEntityPersist } from '@common/base/base-entity.model';
import { Guid } from '@common/types/guid';

export interface Tag extends BaseEntity  {
	label: string;
	type: TagType;
	appliesTo: TagAppliesTo;
	associatedUsers: AppUser[];
	associatedDataObjects: DataObject[];
}

export interface TagPersist extends BaseEntityPersist {
	label: string;
	type: TagType;
	appliesTo: TagAppliesTo;
}
