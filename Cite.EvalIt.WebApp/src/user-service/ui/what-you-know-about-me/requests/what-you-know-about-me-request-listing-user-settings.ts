import { Serializable } from '@common/types/json/serializable';
import { Lookup } from '@common/model/lookup';
import { IsActive } from '@user-service/core/enum/is-active.enum';
import { WhatYouKnowAboutMeRequestState } from '@user-service/core/enum/what-you-know-about-me-request-state.enum';
import { WhatYouKnowAboutMeRequestValidation } from '@user-service/core/enum/what-you-know-about-me-request-validation.enum';
import { UserSettingsInformation, UserSettingsLookupBuilder } from '@user-service/core/model/user-settings.model';
import { UserServiceUser } from '@user-service/core/model/user.model';
import { WhatYouKnowAboutMeRequest } from '@user-service/core/model/what-you-know-about-me.model';
import { WhatYouKnowAboutMeRequestLookup } from '@user-service/core/query/what-you-know-about-me-request.lookup';
import { nameof } from 'ts-simple-nameof';

export class WhatYouKnowAboutMeRequestUserSettings implements Serializable<WhatYouKnowAboutMeRequestUserSettings>, UserSettingsLookupBuilder<WhatYouKnowAboutMeRequestLookup> {

	private like: string;
	private isActive: IsActive[];
	private state: WhatYouKnowAboutMeRequestState[];
	private isValidated: WhatYouKnowAboutMeRequestValidation[];
	private order: Lookup.Ordering = { items: ['-' + nameof<WhatYouKnowAboutMeRequest>(x => x.createdAt)] };
	private project: Lookup.FieldDirectives = {
		fields: [
			nameof<WhatYouKnowAboutMeRequest>(x => x.id),
			nameof<WhatYouKnowAboutMeRequest>(x => x.user) + '.' + nameof<UserServiceUser>(x => x.id),
			nameof<WhatYouKnowAboutMeRequest>(x => x.user) + '.' + nameof<UserServiceUser>(x => x.name),
			nameof<WhatYouKnowAboutMeRequest>(x => x.isActive),
			nameof<WhatYouKnowAboutMeRequest>(x => x.isValidated),
			nameof<WhatYouKnowAboutMeRequest>(x => x.state),
			nameof<WhatYouKnowAboutMeRequest>(x => x.hash),
			nameof<WhatYouKnowAboutMeRequest>(x => x.createdAt),
			nameof<WhatYouKnowAboutMeRequest>(x => x.expiresAt)
		]
	};

	static getUserSettingsInformation(): UserSettingsInformation<WhatYouKnowAboutMeRequestUserSettings> {
		return {
			key: 'WhatYouKnowAboutMeRequestUserSettings',
			type: WhatYouKnowAboutMeRequestUserSettings
		};
	}

	public fromJSONObject(item: any): WhatYouKnowAboutMeRequestUserSettings {
		this.like = item.like;
		this.isActive = item.isActive;
		this.state = item.state;
		this.isValidated = item.isValidated;
		this.order = item.order;
		this.project = item.project;
		return this;
	}

	update(lookup: WhatYouKnowAboutMeRequestLookup) {
		this.like = lookup.like;
		this.isActive = lookup.isActive;
		this.state = lookup.state;
		this.isValidated = lookup.isValidated;
		this.order = lookup.order;
		this.project = lookup.project;
	}

	apply(lookup: WhatYouKnowAboutMeRequestLookup): WhatYouKnowAboutMeRequestLookup {
		lookup.like = this.like;
		lookup.isActive = this.isActive;
		lookup.state = this.state;
		lookup.isValidated = this.isValidated;
		lookup.order = this.order;
		lookup.project = this.project;
		return lookup;
	}
}
