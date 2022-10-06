import { PersistentIDType } from '@app/core/enum/persistent-id-type.enum';
import { AppUser } from '@app/core/model/app-user/app-user.model';
import { DataObjectType, DataObjectTypePersist } from '@app/core/model/data-object-type/data-object-type.model';
import { DataObjectAttributeData, DataObjectAttributeDataPersist } from '@app/core/model/data-object/data-object-attribute.model';
import { DataObjectReview } from '@app/core/model/data-object/data-object-review.model';
import { Tag } from '@app/core/model/tag/tag.model';
import { BaseEntity, BaseEntityPersist } from '@common/base/base-entity.model';
import { Guid } from '@common/types/guid';


export interface DataObject extends BaseEntity  {
	title: string;
	description: string;
	userDefinedIds: PersistentID[];
	userId: Guid;
	user: AppUser;
	dataObjectTypeId?: Guid;
	dataObjectType: DataObjectType;
	attributeData: DataObjectAttributeData;
	reviews: DataObjectReview[];
	rankScore?: number;
	assignedTagIds: Tag[];
	canWriteReview: boolean;
	canEdit: boolean;
}

export interface DataObjectPersist extends BaseEntityPersist {
	title: string;
	description: string;
	userDefinedIds: PersistentID[];
	userId: Guid;
	dataObjectType: DataObjectTypePersist,
	dataObjectTypeId?: Guid;
	attributeData: DataObjectAttributeDataPersist;
}

export interface PersistentID {
	type: PersistentIDType,
	key: string,
	value: string
}