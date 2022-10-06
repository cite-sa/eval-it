import { Guid } from '@common/types/guid';

export interface RegistrationInvitationPersist {
	userId?: Guid;
	email?: string;
	mobilePhone?: string;
	data?: RegistrationInvitationDataContainer;
}

export interface RegistrationInvitationDataContainer {
	claims: ClaimDefinition[];
}

export interface ClaimDefinition {
	name: string;
	value: string;
}

export interface RegistrationInvitationDecline {
	token: string;
	text: string;
}
