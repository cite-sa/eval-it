import { QueryResult } from '@common/model/query-result';
import { Guid } from '@common/types/guid';
import { ConsentKind } from '@idp-service/core/enum/consent-kind.enum';
import { ConsentResponse } from '@idp-service/core/enum/consent-response.enum';
import { IsActive } from '@idp-service/core/enum/is-active.enum';
import { IdpServiceUser } from '@idp-service/core/model/user.model';

export interface Consent {
	id: Guid;
	isActive: IsActive;
	title: string;
	titleKey: string;
	description: string;
	descriptionKey: string;
	kind: ConsentKind;
	requestAt: Date;
	effectedBy: Date;
	userConsents: UserConsent[];
	userConsentHistory: UserConsentHistory[];
}

export interface UserConsent {
	user: IdpServiceUser;
	consent: Consent;
	response: ConsentResponse;
	createdAt: Date;
	hash: string;
}

export interface UserConsentHistory {
	id: Guid;
	user: IdpServiceUser;
	consent: Consent;
	response: ConsentResponse;
	createdAt: Date;
	hash: string;
}

export interface UserConsentPersist {
	userId: Guid;
	consentId: Guid;
	response: ConsentResponse;
}

export interface ConsentQueryResult extends QueryResult<Consent> {
	lastRequested: number;
}
