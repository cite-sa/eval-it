export enum IdpServicePermission {
	//Persisted Grants
	BrowsePersistedGrant = 'BrowsePersistedGrant',
	DeletePersistedGrant = 'DeletePersistedGrant',
	//Tenant
	BrowseTenant = 'BrowseTenant',
	EditTenant = 'EditTenant',
	DeleteTenant = 'DeleteTenant',
	//Tenant Credential Provider
	EditTenantCredentialProvider = 'EditTenantCredentialProvider',
	//User
	BrowseUser = 'BrowseUser',
	EditUserPerson = 'EditUserPerson',
	EditUserService = 'EditUserService',
	DeleteUserPerson = 'DeleteUserPerson',
	DeleteUserService = 'DeleteUserService',
	ResetUserCredential = 'ResetUserCredential',
	BrowseUserCredential = 'BrowseUserCredential',
	BrowseUserClaim = 'BrowseUserClaim',
	CreateApiKeyCredential = 'CreateApiKeyCredential',
	CreateTotpKeyCredential = 'CreateTotpKeyCredential',
	//Consent
	BrowseConsent = 'BrowseConsent',
	BrowseUserConsent = 'BrowseUserConsent',
	BrowseUserConsentHistory = 'BrowseUserConsent',
	BrowseUserProfile = 'BrowseUserProfile',
	//Registration Invitation
	CreateRegistrationInvitation = 'CreateRegistrationInvitation',
	BrowseRegistrationInvitation = 'BrowseRegistrationInvitation',
	EditRegistrationInvitation = 'EditRegistrationInvitation',
	DeleteRegistrationInvitation = 'DeleteRegistrationInvitation',
	//Credential Reset Token
	BrowseCredentialResetToken = 'BrowseCredentialResetToken',
	EditCredentialResetToken = 'EditCredentialResetToken',
	DeleteCredentialResetToken = 'DeleteCredentialResetToken',
	//ForgetMe
	BrowseForgetMe = 'BrowseForgetMe',
	EditForgetMe = 'EditForgetMe',
	DeleteForgetMe = 'DeleteForgetMe',
	//ForgetMe
	BrowseWhatYouKnowAboutMe = 'BrowseWhatYouKnowAboutMe',
	EditWhatYouKnowAboutMe = 'EditWhatYouKnowAboutMe',
	DeleteWhatYouKnowAboutMe = 'DeleteWhatYouKnowAboutMe',
	//Totp Validate Info
	ValidateOthersTotpInfo = 'ValidateOthersTotpInfo',
}
