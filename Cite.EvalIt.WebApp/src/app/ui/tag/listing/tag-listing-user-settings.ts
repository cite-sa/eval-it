import { Serializable } from '@common/types/json/serializable';
import { IsActive } from '@app/core/enum/is-active.enum';
import { Lookup } from '@common/model/lookup';
import { UserSettingsInformation, UserSettingsLookupBuilder } from '@user-service/core/model/user-settings.model';
import { nameof } from 'ts-simple-nameof';
import { TagLookup } from '@app/core/query/tag.lookup';
import { Tag } from '@app/core/model/tag/tag.model';

export class TagListingUserSettings implements Serializable<TagListingUserSettings>, UserSettingsLookupBuilder<TagLookup> {

	like: string;
	isActive: IsActive[] = [IsActive.Active];
	order: Lookup.Ordering = { items: [nameof<Tag>(x => x.label)] };
	project: Lookup.FieldDirectives = {
		fields: [
			nameof<Tag>(x => x.id),
			nameof<Tag>(x => x.label),
			nameof<Tag>(x => x.createdAt)
		]
	};

	static getUserSettingsInformation(): UserSettingsInformation<TagListingUserSettings> {
		return {
			key: 'TagListingUserSettings',
			type: TagListingUserSettings
		};
	}

	public fromJSONObject(item: any): TagListingUserSettings {
		this.like = item.like;
		this.isActive = item.isActive;
		this.order = item.order;
		this.project = item.project;
		return this;
	}

	update(lookup: TagLookup) {
		this.like = lookup.like;
		this.isActive = lookup.isActive;
		this.order = lookup.order;
		this.project = lookup.project;
	}

	apply(lookup: TagLookup): TagLookup {
		lookup.like = this.like;
		lookup.isActive = this.isActive;
		lookup.order = this.order;
		lookup.project = this.project;
		return lookup;
	}
}
