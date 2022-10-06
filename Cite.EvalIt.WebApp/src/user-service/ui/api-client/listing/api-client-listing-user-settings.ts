import { Serializable } from '@common/types/json/serializable';
import { Lookup } from '@common/model/lookup';
import { IsActive } from '@user-service/core/enum/is-active.enum';
import { UserType } from '@user-service/core/enum/user-type.enum';
import { UserSettingsInformation, UserSettingsLookupBuilder } from '@user-service/core/model/user-settings.model';
import { UserServiceUser } from '@user-service/core/model/user.model';
import { UserLookup } from '@user-service/core/query/user.lookup';
import { nameof } from 'ts-simple-nameof';

export class ApiClientListingUserSettings implements Serializable<ApiClientListingUserSettings>, UserSettingsLookupBuilder<UserLookup> {

	private like: string;
	private isActive: IsActive[];
	private type: UserType[] = [UserType.Service];
	private order: Lookup.Ordering = { items: [nameof<UserServiceUser>(x => x.name)] };
	private project: Lookup.FieldDirectives = {
		fields: [
			nameof<UserServiceUser>(x => x.id),
			nameof<UserServiceUser>(x => x.name),
			nameof<UserServiceUser>(x => x.isActive)
		]
	};

	static getUserSettingsInformation(): UserSettingsInformation<ApiClientListingUserSettings> {
		return {
			key: 'ApiClientListingUserSettings',
			type: ApiClientListingUserSettings
		};
	}

	public fromJSONObject(item: any): ApiClientListingUserSettings {
		this.like = item.like;
		this.isActive = item.isActive;
		this.type = item.type;
		this.order = item.order;
		this.project = item.project;
		return this;
	}

	update(lookup: UserLookup) {
		this.like = lookup.like;
		this.isActive = lookup.isActive;
		this.type = lookup.type;
		this.order = lookup.order;
		this.project = lookup.project;
	}

	apply(lookup: UserLookup): UserLookup {
		lookup.like = this.like;
		lookup.isActive = this.isActive;
		lookup.type = this.type;
		lookup.order = this.order;
		lookup.project = this.project;
		return lookup;
	}
}
