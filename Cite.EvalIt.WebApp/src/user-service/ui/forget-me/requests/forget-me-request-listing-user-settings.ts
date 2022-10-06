import { Serializable } from '@common/types/json/serializable';
import { Lookup } from '@common/model/lookup';
import { ForgetMeRequestState } from '@user-service/core/enum/forget-me-request-state.enum';
import { ForgetMeRequestValidation } from '@user-service/core/enum/forget-me-request-validation.enum';
import { IsActive } from '@user-service/core/enum/is-active.enum';
import { ForgetMeRequest } from '@user-service/core/model/forget-me.model';
import { UserSettingsInformation, UserSettingsLookupBuilder } from '@user-service/core/model/user-settings.model';
import { ForgetMeRequestLookup } from '@user-service/core/query/forget-me-request.lookup';
import { nameof } from 'ts-simple-nameof';

export class ForgetMeRequestUserSettings implements Serializable<ForgetMeRequestUserSettings>, UserSettingsLookupBuilder<ForgetMeRequestLookup> {

	private like: string;
	private isActive: IsActive[];
	private state: ForgetMeRequestState[];
	private isValidated: ForgetMeRequestValidation[];
	private order: Lookup.Ordering = { items: ['-' + nameof<ForgetMeRequest>(x => x.createdAt)] };
	private project: Lookup.FieldDirectives = {
		fields: [
			nameof<ForgetMeRequest>(x => x.id),
			nameof<ForgetMeRequest>(x => x.user.id),
			nameof<ForgetMeRequest>(x => x.user.name),
			nameof<ForgetMeRequest>(x => x.isActive),
			nameof<ForgetMeRequest>(x => x.isValidated),
			nameof<ForgetMeRequest>(x => x.state),
			nameof<ForgetMeRequest>(x => x.hash),
			nameof<ForgetMeRequest>(x => x.createdAt),
			nameof<ForgetMeRequest>(x => x.expiresAt)
		]
	};

	static getUserSettingsInformation(): UserSettingsInformation<ForgetMeRequestUserSettings> {
		return {
			key: 'ForgetMeRequestUserSettings',
			type: ForgetMeRequestUserSettings
		};
	}

	public fromJSONObject(item: any): ForgetMeRequestUserSettings {
		this.like = item.like;
		this.isActive = item.isActive;
		this.state = item.state;
		this.isValidated = item.isValidated;
		this.order = item.order;
		this.project = item.project;
		return this;
	}

	update(lookup: ForgetMeRequestLookup) {
		this.like = lookup.like;
		this.isActive = lookup.isActive;
		this.state = lookup.state;
		this.isValidated = lookup.isValidated;
		this.order = lookup.order;
		this.project = lookup.project;
	}

	apply(lookup: ForgetMeRequestLookup): ForgetMeRequestLookup {
		lookup.like = this.like;
		lookup.isActive = this.isActive;
		lookup.state = this.state;
		lookup.isValidated = this.isValidated;
		lookup.order = this.order;
		lookup.project = this.project;
		return lookup;
	}
}
