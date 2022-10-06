import { Serializable } from '@common/types/json/serializable';
import { IsActive } from '@app/core/enum/is-active.enum';
import { Lookup } from '@common/model/lookup';
import { UserSettingsInformation, UserSettingsLookupBuilder } from '@user-service/core/model/user-settings.model';
import { nameof } from 'ts-simple-nameof';
import { DataObjectTypeLookup } from '@app/core/query/data-object-type.lookup';
import { DataObjectType } from '@app/core/model/data-object-type/data-object-type.model';

export class DataObjectTypeListingUserSettings implements Serializable<DataObjectTypeListingUserSettings>, UserSettingsLookupBuilder<DataObjectTypeLookup> {

	like: string;
	isActive: IsActive[] = [IsActive.Active];
	order: Lookup.Ordering = { items: [nameof<DataObjectType>(x => x.name)] };
	project: Lookup.FieldDirectives = {
		fields: [
			nameof<DataObjectType>(x => x.id),
			nameof<DataObjectType>(x => x.name),
			nameof<DataObjectType>(x => x.createdAt)
		]
	};

	static getUserSettingsInformation(): UserSettingsInformation<DataObjectTypeListingUserSettings> {
		return {
			key: 'DataObjectTypeListingUserSettings',
			type: DataObjectTypeListingUserSettings
		};
	}

	public fromJSONObject(item: any): DataObjectTypeListingUserSettings {
		this.like = item.like;
		this.isActive = item.isActive;
		this.order = item.order;
		this.project = item.project;
		return this;
	}

	update(lookup: DataObjectTypeLookup) {
		this.like = lookup.like;
		this.isActive = lookup.isActive;
		this.order = lookup.order;
		this.project = lookup.project;
	}

	apply(lookup: DataObjectTypeLookup): DataObjectTypeLookup {
		lookup.like = this.like;
		lookup.isActive = this.isActive;
		lookup.order = this.order;
		lookup.project = this.project;
		return lookup;
	}
}
