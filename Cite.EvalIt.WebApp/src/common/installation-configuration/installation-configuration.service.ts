
import { Injectable } from '@angular/core';
import { LanguageType } from '@app/core/enum/language-type.enum';
import { ThemeType } from '@app/core/enum/theme-type.enum';
import { BaseHttpService } from '@common/base/base-http.service';
import { BaseComponent } from '@common/base/base.component';
import { BaseHttpParams } from '@common/http/base-http-params';
import { InterceptorType } from '@common/http/interceptors/interceptor-type';
import { LogLevel } from '@common/logging/logging-service';
import { Observable, throwError } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';

@Injectable()
export class InstallationConfigurationService extends BaseComponent {

	constructor(private http: BaseHttpService) { super(); }

	private _version: string;
	get version(): string {
		return this._version;
	}

	private _infrastructure: string;
	get infrastructure(): string {
		return this._infrastructure;
	}

	private _isMultitenant: string;
	get isMultitenant(): string {
		return this._isMultitenant;
	}

	private _defaultTheme: ThemeType;
	get defaultTheme(): ThemeType {
		return this._defaultTheme || ThemeType.Blue;
	}

	private _defaultLanguage: LanguageType;
	get defaultLanguage(): LanguageType {
		return this._defaultLanguage || LanguageType.English;
	}

	private _defaultCulture: string;
	get defaultCulture(): string {
		return this._defaultCulture || 'en-US';
	}

	private _defaultTimezone: string;
	get defaultTimezone(): string {
		return this._defaultTimezone || 'UTC';
	}

	private _adminServiceAddress: string;
	get adminServiceAddress(): string {
		return this._adminServiceAddress || './';
	}

	private _idpServiceAddress: string;
	get idpServiceAddress(): string {
		return this._idpServiceAddress || './';
	}

	private _userServiceAddress: string;
	get userServiceAddress(): string {
		return this._userServiceAddress || './';
	}

	private _notificationServiceAddress: string;
	get notificationServiceAddress(): string {
		return this._notificationServiceAddress || './';
	}

	private _appServiceAddress: string;
	get appServiceAddress(): string {
		return this._appServiceAddress || './';
	}

	private _authClientId: string;
	get authClientId(): string {
		return this._authClientId;
	}

	private _authScope: string;
	get authScope(): string {
		return this._authScope;
	}

	private _authClientSecret: string;
	get authClientSecret(): string {
		return this._authClientSecret;
	}

	private _authTenantHeader: string;
	get authTenantHeader(): string {
		return this._authTenantHeader;
	}

	private _authAntiforgeryHeaderName: string;
	get authAntiforgeryHeaderName(): string {
		return this._authAntiforgeryHeaderName;
	}

	private _authAntiforgeryCookieName: string;
	get authAntiforgeryCookieName(): string {
		return this._authAntiforgeryCookieName;
	}

	private _authTotpHeader: string;
	get authTotpHeader(): string {
		return this._authTotpHeader;
	}

	private _authGrantType: string;
	get authGrantType(): string {
		return this._authGrantType;
	}

	private _authGoogleClientId: string;
	get authGoogleClientId(): string {
		return this._authGoogleClientId;
	}

	private _authFacebookClientId: string;
	get authFacebookClientId(): string {
		return this._authFacebookClientId;
	}

	private _authTaxisnetClientId: string;
	get authTaxisnetClientId(): string {
		return this._authTaxisnetClientId;
	}

	private _authTaxisnetLoginUrl: string;
	get authTaxisnetLoginUrl(): string {
		return this._authTaxisnetLoginUrl;
	}

	private _authTaxisnetCallbackUrl: string;
	get authTaxisnetCallbackUrl(): string {
		return this._authTaxisnetCallbackUrl;
	}

	private _authTaxisnetResponseType: string;
	get authTaxisnetResponseType(): string {
		return this._authTaxisnetResponseType;
	}

	private _authTaxisnetScope: string;
	get authTaxisnetScope(): string {
		return this._authTaxisnetScope;
	}

	private _authTaxisnetGrantType: string;
	get authTaxisnetGrantType(): string {
		return this._authTaxisnetGrantType;
	}

	private _samlGrantType: string;
	get samlGrantType(): string {
		return this._samlGrantType;
	}

	private _samlSpEntityID: string;
	get samlSpEntityID(): string {
		return this._samlSpEntityID;
	}

	private _samlAssertionConsumerServiceUrl: string;
	get samlAssertionConsumerServiceUrl(): string {
		return this._samlAssertionConsumerServiceUrl;
	}

	private _samlEnableSignInRegister: boolean;
	get samlEnableSignInRegister(): boolean {
		return this._samlEnableSignInRegister;
	}

	private _openIDConnectCodeGrantType: string;
	get openIDConnectCodeGrantType(): string {
		return this._openIDConnectCodeGrantType;
	}

	private _openIDConnectCodeConsumerServiceUrl: string;
	get openIDConnectCodeConsumerServiceUrl(): string {
		return this._openIDConnectCodeConsumerServiceUrl;
	}

	private _openIDConnectCodeEnableSignInRegister: boolean;
	get openIDConnectCodeEnableSignInRegister(): boolean {
		return this._openIDConnectCodeEnableSignInRegister;
	}

	private _casGrantType: string;
	get casGrantType(): string {
		return this._casGrantType;
	}

	private _casloginConsumerUrl: string;
	get casLoginConsumerUrl(): string {
		return this._casloginConsumerUrl;
	}

	private _casEnableSignInRegister: boolean;
	get casEnableSignInRegister(): boolean {
		return this._casEnableSignInRegister;
	}

	private _googleEnableSignInRegister: boolean;
	get googleEnableSignInRegister(): boolean {
		return this._googleEnableSignInRegister;
	}

	private _facebookEnableSignInRegister: boolean;
	get facebookEnableSignInRegister(): boolean {
		return this._facebookEnableSignInRegister;
	}

	private _linkedInEnableSignInRegister: boolean;
	get linkedInEnableSignInRegister(): boolean {
		return this._linkedInEnableSignInRegister;
	}

	private _githubEnableSignInRegister: boolean;
	get githubEnableSignInRegister(): boolean {
		return this._githubEnableSignInRegister;
	}

	private _twitterEnableSignInRegister: boolean;
	get twitterEnableSignInRegister(): boolean {
		return this._twitterEnableSignInRegister;
	}

	private _taxisnetEnableSignInRegister: boolean;
	get taxisnetEnableSignInRegister(): boolean {
		return this._taxisnetEnableSignInRegister;
	}

	private _recaptchaSiteKey: string;
	get recaptchaSiteKey(): string {
		return this._recaptchaSiteKey;
	}

	private _recaptchaSize: string;
	get recaptchaSize(): string {
		return this._recaptchaSize;
	}

	private _recaptchaLanguage: string;
	get recaptchaLanguage(): string {
		return this._recaptchaLanguage;
	}

	private _recaptchaTheme: string;
	get recaptchaTheme(): string {
		return this._recaptchaTheme;
	}

	private _recaptchaType: string;
	get recaptchaType(): string {
		return this._recaptchaType;
	}

	private _userSettingsVersion: string;
	get userSettingsVersion(): string {
		return this._userSettingsVersion;
	}

	private _idpServiceEnabled: boolean;
	get idpServiceEnabled(): boolean {
		return this._idpServiceEnabled;
	}

	private _userServiceEnabled: boolean;
	get userServiceEnabled(): boolean {
		return this._userServiceEnabled;
	}

	private _notificationServiceEnabled: boolean;
	get notificationServiceEnabled(): boolean {
		return this._notificationServiceEnabled;
	}

	private _appServiceEnabled: boolean;
	get appServiceEnabled(): boolean {
		return this._appServiceEnabled;
	}

	private _recaptchaEnabled: boolean;
	get recaptchaEnabled(): boolean {
		return this._recaptchaEnabled;
	}

	private _logging: boolean;
	get logging(): boolean {
		return this._logging;
	}

	private _logLevels: LogLevel[];
	get logLevels(): LogLevel[] {
		return this._logLevels;
	}

	private _globalErrorHandlingTransmitLogs: boolean;
	get globalErrorHandlingTransmitLogs(): boolean {
		return this._globalErrorHandlingTransmitLogs;
	}

	private _globalErrorHandlingAppName: string;
	get globalErrorHandlingAppName(): string {
		return this._globalErrorHandlingAppName;
	}

	private _inAppNotificationsCountInterval: number;
	get inAppNotificationsCountInterval(): number {
		return this._inAppNotificationsCountInterval || 3200;
	}

	private _privacyStatementUrl: string;
	get privacyStatementUrl(): string {
		return this._privacyStatementUrl;
	}

	private _termsOfUseUrl: string;
	get termsOfUseUrl(): string {
		return this._termsOfUseUrl;
	}

	loadInstallationConfiguration(): Promise<any> {
		return new Promise((r, e) => {

			// We need to exclude all interceptors here, for the initial configuration request.
			const params = new BaseHttpParams();
			params.interceptorContext = {
				excludedInterceptors: [InterceptorType.AuthToken,
				InterceptorType.JSONContentType,
				InterceptorType.Locale,
				InterceptorType.ProgressIndication,
				InterceptorType.RequestTiming,
				InterceptorType.UnauthorizedResponse,
				InterceptorType.ErrorHandlerInterceptor]
			};

			this.http.get('./assets/config.json', { params: params }).pipe(catchError((err: any, caught: Observable<any>) => throwError(err)))
				.pipe(takeUntil(this._destroyed))
				.subscribe(
					(content: InstallationConfigurationService) => {
						this.parseResponse(content);
						r(this);
					},
					reason => e(reason));
		});
	}

	parseResponse(config: any) {
		this._version = config.version;
		this._infrastructure = config.infrastructure;
		this._isMultitenant = config.isMultitenant;
		this._defaultTheme = config.defaultTheme;
		this._defaultLanguage = config.defaultLanguage;
		this._defaultCulture = config.defaultCulture;
		this._defaultTimezone = config.defaultTimezone;

		if (config.admin_service) {
			this._idpServiceEnabled = config.idp_service.enabled;
			this._adminServiceAddress = config.admin_service.address;
		}
		if (config.app_service) {
			this._appServiceEnabled = config.app_service.enabled;
			this._appServiceAddress = config.app_service.address;
		}
		if (config.notification_service) {
			this._notificationServiceEnabled = config.notification_service.enabled;
			this._notificationServiceAddress = config.notification_service.address;
		}
		if (config.user_service) {
			this._userServiceEnabled = config.user_service.enabled;
			this._userServiceAddress = config.user_service.address;
		}

		this._inAppNotificationsCountInterval = config.inAppNotificationsCountInterval;

		if (config.idp_service) {
			this._idpServiceEnabled = config.idp_service.enabled;
			this._idpServiceAddress = config.idp_service.address;
			this._authClientId = config.idp_service.clientId;
			this._authScope = config.idp_service.scope;
			this._authClientSecret = config.idp_service.clientSecret;
			this._authTenantHeader = config.idp_service.tenant_header;
			this._authAntiforgeryHeaderName = config.idp_service.antiforgery_header_name;
			this._authAntiforgeryCookieName = config.idp_service.antiforgery_cookie_name;
			this._authTotpHeader = config.idp_service.totp_header;
			this._authGrantType = config.idp_service.grantType;
			this._authGoogleClientId = config.idp_service.googleClientId;
			this._authFacebookClientId = config.idp_service.facebookClientId;
			this._googleEnableSignInRegister = config.idp_service.googleEnableSignInRegister;
			this._facebookEnableSignInRegister = config.idp_service.facebookEnableSignInRegister;
			this._linkedInEnableSignInRegister = config.idp_service.linkedInEnableSignInRegister;
			this._githubEnableSignInRegister = config.idp_service.githubEnableSignInRegister;
			this._twitterEnableSignInRegister = config.idp_service.twitterEnableSignInRegister;

			this._taxisnetEnableSignInRegister = config.idp_service.taxis_net?.enableSignInRegister;
			this._authTaxisnetClientId = config.idp_service.taxis_net?.clientId;
			this._authTaxisnetLoginUrl = config.idp_service.taxis_net?.loginUrl;
			this._authTaxisnetCallbackUrl = config.idp_service.taxis_net?.callbackUrl;
			this._authTaxisnetResponseType = config.idp_service.taxis_net?.responseType;
			this._authTaxisnetScope = config.idp_service.taxis_net?.scope;
			this._authTaxisnetGrantType = config.idp_service.taxis_net?.grantType;

			if (config.idp_service.saml) {
				this._samlGrantType = config.idp_service.saml.grantType;
				this._samlSpEntityID = config.idp_service.saml.spEntityID;
				this._samlAssertionConsumerServiceUrl = config.idp_service.saml.assertionConsumerServiceUrl;
				this._samlEnableSignInRegister = config.idp_service.saml.enableSignInRegister;
			}

			if (config.idp_service.openIDConnectCode) {
				this._openIDConnectCodeGrantType = config.idp_service.openIDConnectCode.grantType;
				this._openIDConnectCodeConsumerServiceUrl = config.idp_service.openIDConnectCode.consumerServiceUrl;
				this._openIDConnectCodeEnableSignInRegister = config.idp_service.openIDConnectCode.enableSignInRegister;
			}

			if (config.idp_service.cas) {
				this._casGrantType = config.idp_service.cas.grantType;
				this._casloginConsumerUrl = config.idp_service.cas.loginConsumerUrl;
				this._casEnableSignInRegister = config.idp_service.cas.enableSignInRegister;
			}
			this._privacyStatementUrl = config.privacyStatementUrl;
			this._termsOfUseUrl = config.termsOfUseUrl;
		}


		if (config.recaptcha) {
			this._recaptchaEnabled = config.recaptcha.enabled;
			this._recaptchaSiteKey = config.recaptcha.siteKey;
			this._recaptchaSize = config.recaptcha.size;
			this._recaptchaLanguage = config.recaptcha.lang;
			this._recaptchaTheme = config.recaptcha.theme;
			this._recaptchaType = config.recaptcha.type;
		}

		this._logging = config.logging.enabled;
		this._logLevels = config.logging.logLevels;

		this._globalErrorHandlingTransmitLogs = config.globalErrorHandling.transmitLogs;
		this._globalErrorHandlingAppName = config.globalErrorHandling.appName;

		this._userSettingsVersion = config.userSettingsVersion;
	}
}
