import { Serializable } from '@common/types/json/serializable';
import { Lookup } from '@common/model/lookup';
import { IsActive } from '@idp-service/core/enum/is-active.enum';
import { UserType } from '@idp-service/core/enum/user-type.enum';
import { UserClaim } from '@idp-service/core/model/user-claim.model';
import { IdpServiceUser } from '@idp-service/core/model/user.model';
import { UserClaimLookup } from '@idp-service/core/query/user-claim.lookup';
import { UserLookup } from '@idp-service/core/query/user.lookup';
import { UserSettingsInformation, UserSettingsLookupBuilder } from '@user-service/core/model/user-settings.model';
import { nameof } from 'ts-simple-nameof';

export class UserRoleAssignmentUserSettings implements Serializable<UserRoleAssignmentUserSettings>, UserSettingsLookupBuilder<UserLookup> {

	private like: string;
	private isActive: IsActive[];
	private type: UserType[] = [UserType.Person];
	private userClaimSubQuery: UserClaimLookup;
	private order: Lookup.Ordering = { items: [nameof<IdpServiceUser>(x => x.name)] };
	private project: Lookup.FieldDirectives = {
		fields: [
			nameof<IdpServiceUser>(x => x.id),
			nameof<IdpServiceUser>(x => x.name),
			nameof<IdpServiceUser>(x => x.hash),
			nameof<IdpServiceUser>(x => x.updatedAt),
			nameof<IdpServiceUser>(x => x.claims) + '.' + nameof<UserClaim>(x => x.claim),
			nameof<IdpServiceUser>(x => x.claims) + '.' + nameof<UserClaim>(x => x.value),
		]
	};

	static getUserSettingsInformation(): UserSettingsInformation<UserRoleAssignmentUserSettings> {
		return {
			key: 'UserRoleAssignmentUserSettings',
			type: UserRoleAssignmentUserSettings
		};
	}

	public fromJSONObject(item: any): UserRoleAssignmentUserSettings {
		this.like = item.like;
		this.isActive = item.isActive;
		this.type = item.type;
		this.userClaimSubQuery = item.userClaimSubQuery;
		this.order = item.order;
		this.project = item.project;
		return this;
	}

	update(lookup: UserLookup) {
		this.like = lookup.like;
		this.isActive = lookup.isActive;
		this.type = lookup.type;
		this.userClaimSubQuery = lookup.userClaimSubQuery;
		this.order = lookup.order;
		this.project = lookup.project;
	}

	apply(lookup: UserLookup): UserLookup {
		lookup.like = this.like;
		lookup.isActive = this.isActive;
		lookup.type = this.type;
		lookup.userClaimSubQuery = this.userClaimSubQuery;
		lookup.order = this.order;
		lookup.project = this.project;
		return lookup;
	}
}
