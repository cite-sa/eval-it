import { Serializable } from '@common/types/json/serializable';
import { Lookup } from '@common/model/lookup';
import { PersistedGrantAggregation } from '@idp-service/core/model/persisted-grant.model';
import { PersistedGrantLookup } from '@idp-service/core/query/persisted-grant.lookup';
import { UserSettingsInformation, UserSettingsLookupBuilder } from '@user-service/core/model/user-settings.model';
import { nameof } from 'ts-simple-nameof';

export class AccessTokenListingUserSettings implements Serializable<AccessTokenListingUserSettings>, UserSettingsLookupBuilder<PersistedGrantLookup> {

	private like: string;
	private order: Lookup.Ordering = { items: [nameof<PersistedGrantAggregation>(x => x.latestCreatedAt)] };
	private project: Lookup.FieldDirectives = {
		fields: [
			nameof<PersistedGrantAggregation>(x => x.subjectId),
			nameof<PersistedGrantAggregation>(x => x.userId),
			nameof<PersistedGrantAggregation>(x => x.userName),
			nameof<PersistedGrantAggregation>(x => x.clientId),
			nameof<PersistedGrantAggregation>(x => x.type),
			nameof<PersistedGrantAggregation>(x => x.latestExpiresAt),
			nameof<PersistedGrantAggregation>(x => x.latestCreatedAt),
			nameof<PersistedGrantAggregation>(x => x.count)
		]
	};

	static getUserSettingsInformation(): UserSettingsInformation<AccessTokenListingUserSettings> {
		return {
			key: 'AccessTokenListingUserSettings',
			type: AccessTokenListingUserSettings
		};
	}

	public fromJSONObject(item: any): AccessTokenListingUserSettings {
		this.like = item.like;
		this.order = item.order;
		this.project = item.project;
		return this;
	}

	public update(lookup: PersistedGrantLookup) {
		this.like = lookup.like;
		this.order = lookup.order;
		this.project = lookup.project;
	}

	public apply(lookup: PersistedGrantLookup): PersistedGrantLookup {
		lookup.like = this.like;
		lookup.order = this.order;
		lookup.project = this.project;
		return lookup;
	}
}
