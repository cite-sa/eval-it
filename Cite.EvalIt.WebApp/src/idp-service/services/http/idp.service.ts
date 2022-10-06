import { HttpHeaders, HttpParameterCodec, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthenticationToken, AuthService } from '@app/core/services/ui/auth.service';
import { BaseHttpService } from '@common/base/base-http.service';
import { BaseService } from '@common/base/base.service';
import { BaseHttpParams } from '@common/http/base-http-params';
import { InterceptorType } from '@common/http/interceptors/interceptor-type';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { Guid } from '@common/types/guid';
import { SignUpMode } from '@idp-service/core/enum/sign-up-mode.enum';
import { DirectLinkRegistrationInfo } from '@idp-service/core/model/direct-link-registration-info';
import { AuthenticationInfo, Credential, SignUpInfo } from '@idp-service/core/model/idp.model';
import { TransientRegistrationInfo } from '@idp-service/core/model/transient-registration-info';
import { ConsentSelection } from '@idp-service/ui/user-consents/editor/user-consents-editor.component';
import { CookieService } from 'ngx-cookie-service';
import { Observable, throwError } from 'rxjs';

@Injectable()
export class IdpService extends BaseService {

	private get apiBase(): string { return `${this.installationConfiguration.idpServiceAddress}`; }

	constructor(
		private installationConfiguration: InstallationConfigurationService,
		private http: BaseHttpService,
		private authService: AuthService,
		private cookieService: CookieService) {
		super();
	}

	private static getRegistrationModeParameterName(mode: SignUpMode): string {
		let parameter: string;
		switch (mode) {
			case SignUpMode.Register:
				parameter = 'signup-register';
				break;
			case SignUpMode.Invitation:
				parameter = 'signup-invitation';
				break;
			default:
				parameter = null;
				break;
		}
		return parameter;
	}

	private static extractSignUpModeParameter<SignUpPayloadType>(info: SignUpInfo<SignUpPayloadType>): { name: string, value: string } {
		return {
			name: this.getRegistrationModeParameterName(info.mode),
			value: info.mode === SignUpMode.Invitation ? info.invitationCode : 'true'
		};
	}

	public login(credential: Credential, tenantId: Guid, totp?: string): Observable<boolean> {
		this.cookieService.deleteAll();
		let params = new HttpParams()
			.set('grant_type', this.installationConfiguration.authGrantType)
			.set('client_id', this.installationConfiguration.authClientId)
			.set('scope', this.installationConfiguration.authScope)
			.set('username', credential.username)
			.set('password', credential.password)
			.set('client_secret', this.installationConfiguration.authClientSecret);

		if (totp) { params = params.set('totp', totp); }


		let headers = new HttpHeaders();
		headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
		if (this.installationConfiguration.isMultitenant) {
			headers = headers.set(this.installationConfiguration.authTenantHeader, tenantId.toString());
		}

		const url = `${this.apiBase}connect/token`;
		return this.authService.prepareAuthRequest(this.http.post<AuthenticationToken>(url, params, { headers: headers, withCredentials: true }));
	}

	public loginDirectLink(credential: Credential, tenantId: Guid): Observable<boolean> {
		this.authService.clear();

		const params = new HttpParams({ encoder: new CustomEncoder() })
			.set('grant_type', 'direct_link')
			.set('client_id', this.installationConfiguration.authClientId)
			.set('scope', this.installationConfiguration.authScope)
			.set('link_key', credential.password)
			.set('client_secret', this.installationConfiguration.authClientSecret);

		let headers = new HttpHeaders();
		headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
		if (this.installationConfiguration.isMultitenant) {
			headers = headers.set(this.installationConfiguration.authTenantHeader, tenantId.toString());
		}

		const url = `${this.apiBase}connect/token`;
		return this.authService.prepareAuthRequest(this.http.post<AuthenticationToken>(url, params, { headers: headers, withCredentials: true }));

	}

	public renewDirectLink(email: string, tenantId: Guid): Observable<boolean> {
		this.authService.clear();

		const params = new HttpParams({ encoder: new CustomEncoder() })
			.set('grant_type', 'direct_link')
			.set('client_id', this.installationConfiguration.authClientId)
			.set('scope', this.installationConfiguration.authScope)
			.set('auto_create', 'true')
			.set('email', email)
			.set('client_secret', this.installationConfiguration.authClientSecret)
			.set('direct-link-renew', 'true');
		let headers = new HttpHeaders();
		headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
		if (this.installationConfiguration.isMultitenant) {
			headers = headers.set(this.installationConfiguration.authTenantHeader, tenantId.toString());
		}

		const url = `${this.apiBase}connect/token`;
		return this.authService.prepareAuthRequest(this.http.post<AuthenticationToken>(url, params, { headers: headers, withCredentials: true }));
	}


	public loginExternal(info: AuthenticationInfo, tenantId: Guid, totp?: string): Observable<boolean> {
		this.cookieService.deleteAll();
		let params = new HttpParams()
			.set('grant_type', info.provider.grantType)
			.set('external_token', info.token)
			.set('client_id', this.installationConfiguration.authClientId)
			.set('scope', this.installationConfiguration.authScope)
			.set('client_secret', this.installationConfiguration.authClientSecret);

		if (totp) { params = params.set('totp', totp); }
		if (info.enableSignInRegister) { params = params.set('signin-register', 'true'); }

		let headers = new HttpHeaders();
		headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
		if (this.installationConfiguration.isMultitenant) {
			headers = headers.set(this.installationConfiguration.authTenantHeader, tenantId.toString());
		}

		const url = `${this.apiBase}connect/token`;
		return this.authService.prepareAuthRequest(this.http.post<AuthenticationToken>(url, params, { headers: headers, withCredentials: true }));
	}

	public loginExternalOpenIDConnectCode(code: string, idpId: string, tenantId: Guid): Observable<boolean> {
		this.cookieService.deleteAll();
		let params = new HttpParams({ encoder: new CustomEncoder() })
			.set('grant_type', this.installationConfiguration.openIDConnectCodeGrantType)
			.set('scope', this.installationConfiguration.authScope)
			.set('external_token', code)
			.set('idp_id', idpId)
			.set('client_id', this.installationConfiguration.authClientId)
			.set('client_secret', this.installationConfiguration.authClientSecret);

		let headers = new HttpHeaders();
		headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
		if (this.installationConfiguration.isMultitenant) {
			headers = headers.set(this.installationConfiguration.authTenantHeader, tenantId.toString());
		}
		if (this.installationConfiguration.openIDConnectCodeEnableSignInRegister) { params = params.set('signin-register', 'true'); }

		const url = `${this.apiBase}connect/token`;
		return this.authService.prepareAuthRequest(this.http.post<AuthenticationToken>(url, params, { headers: headers, withCredentials: true }));
	}

	public loginExternalSaml(samlAuthResponse: string, idpId: string, binding: string, tenantId: Guid): Observable<boolean> {
		this.cookieService.deleteAll();
		let params = new HttpParams({ encoder: new CustomEncoder() })
			.set('grant_type', this.installationConfiguration.samlGrantType)
			.set('scope', this.installationConfiguration.authScope)
			.set('external_token', samlAuthResponse)
			.set('idp_id', idpId)
			.set('sp_id', this.installationConfiguration.samlSpEntityID)
			.set('client_id', this.installationConfiguration.authClientId)
			.set('saml_binding', binding)
			.set('client_secret', this.installationConfiguration.authClientSecret);

		let headers = new HttpHeaders();
		headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
		if (this.installationConfiguration.isMultitenant) {
			headers = headers.set(this.installationConfiguration.authTenantHeader, tenantId.toString());
		}
		if (this.installationConfiguration.samlEnableSignInRegister) { params = params.set('signin-register', 'true'); }

		const url = `${this.apiBase}connect/token`;
		return this.authService.prepareAuthRequest(this.http.post<AuthenticationToken>(url, params, { headers: headers, withCredentials: true }));
	}

	public loginExternalCAS(casAuthResponse: string, service: string, idpId: string, tenantId: Guid): Observable<boolean> {
		this.cookieService.deleteAll();
		let params = new HttpParams({ encoder: new CustomEncoder() })
			.set('grant_type', this.installationConfiguration.casGrantType)
			.set('scope', this.installationConfiguration.authScope)
			.set('external_token', casAuthResponse)
			.set('idp_id', idpId)
			.set('service', service)
			.set('client_id', this.installationConfiguration.authClientId)
			.set('client_secret', this.installationConfiguration.authClientSecret);

		if (this.installationConfiguration.samlEnableSignInRegister) { params = params.set('signin-register', 'true'); }

		let headers = new HttpHeaders();
		headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
		if (this.installationConfiguration.isMultitenant) {
			headers = headers.set(this.installationConfiguration.authTenantHeader, tenantId.toString());
		}

		const url = `${this.apiBase}connect/token`;
		return this.authService.prepareAuthRequest(this.http.post<AuthenticationToken>(url, params, { headers: headers, withCredentials: true }));
	}

	public signUpInternal(info: SignUpInfo<Credential>, signupConsents: ConsentSelection[]): Observable<boolean> {
		this.authService.clear();

		const signUpModeParameter = IdpService.extractSignUpModeParameter(info);
		let params = new HttpParams()
			.set('grant_type', this.installationConfiguration.authGrantType)
			.set('client_id', this.installationConfiguration.authClientId)
			.set('scope', this.installationConfiguration.authScope)
			.set('username', info.payload.username)
			.set('password', info.payload.password)
			.set('client_secret', this.installationConfiguration.authClientSecret)
			.set(signUpModeParameter.name, signUpModeParameter.value)
			.set('signup-consent', JSON.stringify(signupConsents));

		if (info.payload.recaptcha) { params = params.set('recaptcha', info.payload.recaptcha); }

		let headers = new HttpHeaders();
		headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
		if (this.installationConfiguration.isMultitenant) {
			headers = headers.set(this.installationConfiguration.authTenantHeader, info.tenantId.toString());
		}

		const url = `${this.apiBase}connect/token`;
		return this.authService.prepareAuthRequest(this.http.post<AuthenticationToken>(url, params, { headers: headers, withCredentials: true }));
	}

	public signUpDirectLink(info: SignUpInfo<DirectLinkRegistrationInfo>, signupConsents: ConsentSelection[]): Observable<boolean> {
		this.authService.clear();

		const signUpModeParameter = IdpService.extractSignUpModeParameter(info);
		let params = new HttpParams({ encoder: new CustomEncoder() })
			.set('grant_type', 'direct_link')
			.set('client_id', this.installationConfiguration.authClientId)
			.set('scope', this.installationConfiguration.authScope)
			.set('username', info.payload.username)
			.set('auto_create', 'true')
			.set('email', info.payload.email)
			.set('client_secret', this.installationConfiguration.authClientSecret)
			.set(signUpModeParameter.name, signUpModeParameter.value)
			.set('signup-consent', JSON.stringify(signupConsents));

		if (info.payload.recaptcha) { params = params.set('recaptcha', info.payload.recaptcha); }

		let headers = new HttpHeaders();
		headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
		if (this.installationConfiguration.isMultitenant) {
			headers = headers.set(this.installationConfiguration.authTenantHeader, info.tenantId.toString());
		}

		const url = `${this.apiBase}connect/token`;
		return this.authService.prepareAuthRequest(this.http.post<AuthenticationToken>(url, params, { headers: headers, withCredentials: true }));
	}

	public signUpTransient(info: SignUpInfo<TransientRegistrationInfo>, signupConsents: ConsentSelection[]): Observable<boolean> {
		this.authService.clear();

		const signUpModeParameter = IdpService.extractSignUpModeParameter(info);
		let params = new HttpParams({ encoder: new CustomEncoder() })
			.set('grant_type', 'transient')
			.set('client_id', this.installationConfiguration.authClientId)
			.set('scope', this.installationConfiguration.authScope)
			.set('username', info.payload.username)
			.set('auto_create', 'true')
			.set('client_secret', this.installationConfiguration.authClientSecret)
			.set(signUpModeParameter.name, signUpModeParameter.value)
			.set('signup-consent', JSON.stringify(signupConsents));

		if (info.payload.recaptcha) { params = params.set('recaptcha', info.payload.recaptcha); }

		let headers = new HttpHeaders();
		headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
		if (this.installationConfiguration.isMultitenant) {
			headers = headers.set(this.installationConfiguration.authTenantHeader, info.tenantId.toString());
		}

		const url = `${this.apiBase}connect/token`;
		return this.authService.prepareAuthRequest(this.http.post<AuthenticationToken>(url, params, { headers: headers, withCredentials: true }));
	}

	public signUpExternal(info: SignUpInfo<AuthenticationInfo>, signupConsents: ConsentSelection[]): Observable<boolean> {
		this.authService.clear();

		const signUpModeParameter = IdpService.extractSignUpModeParameter(info);
		const params = new HttpParams()
			.set('grant_type', info.payload.provider.grantType)
			.set('external_token', info.payload.token)
			.set('client_id', this.installationConfiguration.authClientId)
			.set('scope', this.installationConfiguration.authScope)
			.set('client_secret', this.installationConfiguration.authClientSecret)
			.set('token', info.mode === SignUpMode.Invitation ? info.invitationCode : null)
			.set(signUpModeParameter.name, signUpModeParameter.value)
			.set('signup-consent', JSON.stringify(signupConsents));

		let headers = new HttpHeaders();
		headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
		if (this.installationConfiguration.isMultitenant) {
			headers = headers.set(this.installationConfiguration.authTenantHeader, info.tenantId.toString());
		}

		const url = `${this.apiBase}connect/token`;
		return this.authService.prepareAuthRequest(this.http.post<AuthenticationToken>(url, params, { headers: headers, withCredentials: true }));
	}

	public signUpExternalSaml(idpId: string, binding: string, info: SignUpInfo<AuthenticationInfo>, signupConsents: ConsentSelection[]): Observable<boolean> {
		this.authService.clear();

		const signUpModeParameter = IdpService.extractSignUpModeParameter(info);
		const params = new HttpParams({ encoder: new CustomEncoder() })
			.set('grant_type', info.payload.provider.grantType)
			.set('external_token', info.payload.token)
			.set('idp_id', idpId)
			.set('sp_id', this.installationConfiguration.samlSpEntityID)
			.set('client_id', this.installationConfiguration.authClientId)
			.set('scope', this.installationConfiguration.authScope)
			.set('saml_binding', binding)
			.set('client_secret', this.installationConfiguration.authClientSecret)
			.set('token', info.mode === SignUpMode.Invitation ? info.invitationCode : null)
			.set(signUpModeParameter.name, signUpModeParameter.value)
			.set('signup-consent', JSON.stringify(signupConsents));

		let headers = new HttpHeaders();
		headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
		if (this.installationConfiguration.isMultitenant) {
			headers = headers.set(this.installationConfiguration.authTenantHeader, info.tenantId.toString());
		}

		const url = `${this.apiBase}connect/token`;
		return this.authService.prepareAuthRequest(this.http.post<AuthenticationToken>(url, params, { headers: headers, withCredentials: true }));
	}

	public signUpExternalOpenIDConnectCode(idpId: string, info: SignUpInfo<AuthenticationInfo>, signupConsents: ConsentSelection[]): Observable<boolean> {
		this.authService.clear();

		const signUpModeParameter = IdpService.extractSignUpModeParameter(info);
		const params = new HttpParams({ encoder: new CustomEncoder() })
			.set('grant_type', info.payload.provider.grantType)
			.set('external_token', info.payload.token)
			.set('idp_id', idpId)
			.set('client_id', this.installationConfiguration.authClientId)
			.set('scope', this.installationConfiguration.authScope)
			.set('client_secret', this.installationConfiguration.authClientSecret)
			.set('token', info.mode === SignUpMode.Invitation ? info.invitationCode : null)
			.set(signUpModeParameter.name, signUpModeParameter.value)
			.set('signup-consent', JSON.stringify(signupConsents));

		let headers = new HttpHeaders();
		headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
		if (this.installationConfiguration.isMultitenant) {
			headers = headers.set(this.installationConfiguration.authTenantHeader, info.tenantId.toString());
		}

		const url = `${this.apiBase}connect/token`;
		return this.authService.prepareAuthRequest(this.http.post<AuthenticationToken>(url, params, { headers: headers, withCredentials: true }));
	}

	public signUpExternalCAS(idpId: string, service: string, info: SignUpInfo<AuthenticationInfo>, signupConsents: ConsentSelection[]): Observable<boolean> {
		this.authService.clear();

		const signUpModeParameter = IdpService.extractSignUpModeParameter(info);
		const params = new HttpParams({ encoder: new CustomEncoder() })
			.set('grant_type', info.payload.provider.grantType)
			.set('external_token', info.payload.token)
			.set('idp_id', idpId)
			.set('service', service)
			.set('client_id', this.installationConfiguration.authClientId)
			.set('scope', this.installationConfiguration.authScope)
			.set('client_secret', this.installationConfiguration.authClientSecret)
			.set('token', info.mode === SignUpMode.Invitation ? info.invitationCode : null)
			.set(signUpModeParameter.name, signUpModeParameter.value)
			.set('signup-consent', JSON.stringify(signupConsents));

		let headers = new HttpHeaders();
		headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
		if (this.installationConfiguration.isMultitenant) {
			headers = headers.set(this.installationConfiguration.authTenantHeader, info.tenantId.toString());
		}

		const url = `${this.apiBase}connect/token`;
		return this.authService.prepareAuthRequest(this.http.post<AuthenticationToken>(url, params, { headers: headers, withCredentials: true }));
	}

	public refreshToken(): Observable<boolean> {
		let headers = new HttpHeaders();
		headers = headers.append('Content-Type', 'application/x-www-form-urlencoded');

		const antiforgeryHeaderName = this.installationConfiguration.authAntiforgeryHeaderName;
		const antiforgeryCookieName = this.installationConfiguration.authAntiforgeryCookieName;
		if (antiforgeryHeaderName != null && antiforgeryCookieName != null) {
			const xsrfToken = this.cookieService.get(antiforgeryCookieName);
			if (!xsrfToken || xsrfToken.length === 0) { return throwError('Could not load xsrf token from cookie.'); }
			headers = headers.append(antiforgeryHeaderName, xsrfToken);
		}

		const params = new BaseHttpParams();
		params.interceptorContext = {
			excludedInterceptors: [InterceptorType.ProgressIndication]
		};

		const url = `${this.apiBase}api-token-refresh`;
		return this.authService.prepareAuthRequest(this.http.get<AuthenticationToken>(url, { params: params, headers: headers, withCredentials: true }), { params: params });
	}
}

class CustomEncoder implements HttpParameterCodec {
	encodeKey(key: string): string {
		return encodeURIComponent(key);
	}

	encodeValue(value: string): string {
		return encodeURIComponent(value);
	}

	decodeKey(key: string): string {
		return decodeURIComponent(key);
	}

	decodeValue(value: string): string {
		return decodeURIComponent(value);
	}
}
// interceptorParams: [
// 	{
// 		type: InterceptorType.ErrorHandlerInterceptor,
// 		overrideErrorCodes: [150, 180],
// 		serviceEndpoints:[]
// 	}
// ]