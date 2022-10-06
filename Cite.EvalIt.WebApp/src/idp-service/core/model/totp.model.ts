export interface TotpKeyInfo {
	provisionSecret: string;
	provisionUrl: string;
	overrideSecret: string;
	issuer: string;
	identity: string;
	signature: string;
}

export interface TotpValidationInfo {
	isValid: boolean;
	serverTime: Date;
	toleranceSeconds: number;
	digits: number;
}
