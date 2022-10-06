import { Serializable } from '@common/types/json/serializable';
import { IsActive } from '@app/core/enum/is-active.enum';
import { Lookup } from '@common/model/lookup';
import { UserSettingsInformation, UserSettingsLookupBuilder } from '@user-service/core/model/user-settings.model';
import { nameof } from 'ts-simple-nameof';
import { AppUserLookup } from '@app/core/query/app-user.lookup';
import { AppUser } from '@app/core/model/app-user/app-user.model';

export class AppUserListingUserSettings implements Serializable<AppUserListingUserSettings>, UserSettingsLookupBuilder<AppUserLookup> {

	// like: string;
	isActive: IsActive[] = [IsActive.Active];
	order: Lookup.Ordering = { items: [nameof<AppUser>(x => x.name)] };
	project: Lookup.FieldDirectives = {
		fields: [
			nameof<AppUser>(x => x.id),
			nameof<AppUser>(x => x.name),
			nameof<AppUser>(x => x.createdAt)
		]
	};

	static getUserSettingsInformation(): UserSettingsInformation<AppUserListingUserSettings> {
		return {
			key: 'AppUserListingUserSettings',
			type: AppUserListingUserSettings
		};
	}

	public fromJSONObject(item: any): AppUserListingUserSettings {
		// this.like = item.like;
		this.isActive = item.isActive;
		this.order = item.order;
		this.project = item.project;
		return this;
	}

	update(lookup: AppUserLookup) {
		// this.like = lookup.like;
		this.isActive = lookup.isActive;
		this.order = lookup.order;
		this.project = lookup.project;
	}

	apply(lookup: AppUserLookup): AppUserLookup {
		// lookup.like = this.like;
		lookup.isActive = this.isActive;
		lookup.order = this.order;
		lookup.project = this.project;
		return lookup;
	}
}
