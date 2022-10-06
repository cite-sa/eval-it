export interface EmailResetRequest {
	email: string;
}

export interface ResetUserEmail {
	token: string;
}

export interface UserEmailResetDecline {
	token: string;
	text: string;
}
