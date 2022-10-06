
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AppPermission } from '@app/core/enum/permission.enum';
import { RoleType } from '@app/core/enum/role-type.enum';
import { AppAccount } from '@app/core/model/auth/principal.model';
import { PrincipalService as AppPrincipalService } from '@app/core/services/http/principal.service';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { Guid } from '@common/types/guid';
import { CredentialProvider } from '@idp-service/core/enum/credential-provider.enum';
import { IdpServicePermission } from '@idp-service/core/enum/permission.enum';
import { IdpServiceAccount } from '@idp-service/core/model/principal.model';
import { PrincipalService as IdpPrincipalService } from '@idp-service/services/http/principal.service';
import { NotificationServicePermission } from '@notification-service/core/enum/permission.enum';
import { NotificationServiceAccount } from '@notification-service/core/model/principal.model';
import { PrincipalService as NotificationPrincipalService } from '@notification-service/services/http/principal.service';
import { UserServicePermission } from '@user-service/core/enum/permission.enum';
import { TentativeUserProfile } from '@user-service/core/enum/tentative-user-profile.enum';
import { UserServiceAccount } from '@user-service/core/model/principal.model';
import { PrincipalService as UserPrincipalService } from '@user-service/services/http/principal.service';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { exhaustMap, map } from 'rxjs/operators';

export interface ResolutionContext {
	roles: RoleType[];
	permissions: AppPermission[];
}

export interface AuthenticationToken {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token: string;
	scope: string;
	state?: string;
}

export interface AuthenticationState {
	loginStatus: LoginStatus;
}

export enum LoginStatus {
	LoggedIn = 0,
	LoggingOut = 1,
	LoggedOut = 2
}

@Injectable()
export class AuthService {

	public authenticationStateSubject: Subject<AuthenticationState>;
	public permissionEnum = AppPermission;
	public idpServicePermissionEnum = IdpServicePermission;
	public userServicePermissionEnum = UserServicePermission;
	public notificationServicePermissionEnum = NotificationServicePermission;
	private accessToken: String;
	private appAccount: AppAccount;
	private idpServiceAccount: IdpServiceAccount;
	private userServiceAccount: UserServiceAccount;
	private notificationServiceAccount: NotificationServiceAccount;

	private _authState: boolean; // Boolean to indicate if a user if authorized. It's also used to sync the auth state across different tabs, using local storage.

	constructor(
		private installationConfiguration: InstallationConfigurationService,
		private appPrincipalService: AppPrincipalService,
		private idpPrincipalService: IdpPrincipalService,
		private notificationPrincipalService: NotificationPrincipalService,
		private userPrincipalService: UserPrincipalService,
		private router: Router
	) {
		// this.account = this.currentAccount();
		this.authenticationStateSubject = new Subject<AuthenticationState>();

		window.addEventListener('storage', (event: StorageEvent) => {
			// Logout if we receive event that logout action occurred in a different tab.
			if (event.key && event.key === 'authState' && event.newValue === 'false' && this._authState) {
				this.clear();
				this.router.navigate(['/unauthorized'], { queryParams: { returnUrl: this.router.url } });
			}
		});
	}

	public getAuthenticationStateObservable(): Observable<AuthenticationState> {
		return this.authenticationStateSubject.asObservable();
	}

	public beginLogOutProcess(): void {
		this.authenticationStateSubject.next({ loginStatus: LoginStatus.LoggingOut });
	}

	public clear(): void {
		this.authState(false);
		this.accessToken = undefined;
		this.appAccount = undefined;
		this.idpServiceAccount = undefined;
		this.userServiceAccount = undefined;
		this.notificationServiceAccount = undefined;
	}

	private authState(authState?: boolean): boolean {
		if (authState !== undefined) {
			this._authState = authState;
			localStorage.setItem('authState', authState ? 'true' : 'false');
			if (authState) {
				this.authenticationStateSubject.next({ loginStatus: LoginStatus.LoggedIn });
			} else {
				this.authenticationStateSubject.next({ loginStatus: LoginStatus.LoggedOut });
			}
		}
		if (this._authState === undefined) {
			this._authState = localStorage.getItem('authState') === 'true' ? true : false;
		}
		return this._authState;
	}

	public currentAccountIsAuthenticated(): boolean {
		return this.idpServiceAccount && this.idpServiceAccount.isAuthenticated;
	}

	//Should this be name @isAuthenticated@ instead?
	public hasAccessToken(): boolean { return Boolean(this.currentAuthenticationToken()); }

	public currentAuthenticationToken(accessToken?: String): String {
		if (accessToken) {
			this.accessToken = accessToken;
		}
		return this.accessToken;
	}

	//
	//
	// Account data
	//
	//
	public userId(): Guid {
		if (this.idpServiceAccount && this.idpServiceAccount.principal && this.idpServiceAccount.principal.subject) { return this.idpServiceAccount.principal.subject; }
		return null;
	}

	public tenantId(): Guid {
		if (this.idpServiceAccount && this.idpServiceAccount.profile && this.idpServiceAccount.profile.tenant) { return this.idpServiceAccount.profile.tenant; }
		return null;
	}

	public consentsRequireAttention(): boolean {
		if (this.idpServiceAccount && this.idpServiceAccount.consentInfo && this.idpServiceAccount.consentInfo.requireAttention) { return this.idpServiceAccount.consentInfo.requireAttention; }
		return false;
	}

	public getPrincipalName(): string {
		if (this.userServiceAccount && this.userServiceAccount.principal) { return this.userServiceAccount.principal.name; }
		if (this.idpServiceAccount && this.idpServiceAccount.principal) { return this.idpServiceAccount.principal.name; }
		return null;
	}

	public getUserProfileLanguage(): string {
		if (this.userServiceAccount && this.userServiceAccount.profile) { return this.userServiceAccount.profile.language; }
		return null;
	}

	public getUserProfileCulture(): string {
		if (this.userServiceAccount && this.userServiceAccount.profile) { return this.userServiceAccount.profile.culture; }
		return null;
	}

	public getUserProfileTimezone(): string {
		if (this.userServiceAccount && this.userServiceAccount.profile) { return this.userServiceAccount.profile.timezone; }
		return null;
	}

	public isAdmin(): boolean {
		return this.hasRole(RoleType.Admin);
	}

	public isProfileTentative(): boolean {
		if (this.userServiceAccount && this.userServiceAccount.profile) { return this.userServiceAccount.profile.isTentative === TentativeUserProfile.Tentative; }
		return false;
	}

	public hasTotp(): boolean {
		if (this.idpServiceAccount && this.idpServiceAccount.credentials && this.idpServiceAccount.credentials.providers) { return this.idpServiceAccount.credentials.providers.includes(CredentialProvider.Totp); }
		return false;
	}

	public isTransientUser(): boolean {
		return (this.idpServiceAccount && this.idpServiceAccount.credentials && this.idpServiceAccount.credentials.providers && this.idpServiceAccount.credentials.providers.length === 1 && this.idpServiceAccount.credentials.providers[0] === CredentialProvider.Transient);
	}

	public getUserProfilePictureUrl(): string {
		if (this.idpServiceAccount && this.idpServiceAccount.claims && this.idpServiceAccount.claims.other && this.idpServiceAccount.claims.other.map(claim => claim.name).includes('x-profilepicture')) { return this.idpServiceAccount.claims.other.filter(claim => claim.name === 'x-profilepicture')[0].value; }
		return null;
	}

	public getUserProfilePictureRef(): string {
		if (this.userServiceAccount && this.userServiceAccount.profile) { return this.userServiceAccount.profile.profilePictureRef; }
		return null;
	}

	//
	//
	// Me called on all services to get account data.
	//
	//
	public prepareAuthRequest(observable: Observable<AuthenticationToken>, httpParams?: Object): Observable<boolean> {
		return observable.pipe(
			map((x) => this.currentAuthenticationToken(x.access_token)),
			exhaustMap(() => forkJoin([
				this.installationConfiguration.idpServiceEnabled ? this.idpPrincipalService.me(httpParams) : of(null),
				this.installationConfiguration.userServiceEnabled ? this.userPrincipalService.me(httpParams) : of(null),
				this.installationConfiguration.notificationServiceEnabled ? this.notificationPrincipalService.me(httpParams) : of(null),
				this.installationConfiguration.appServiceEnabled ? this.appPrincipalService.me(httpParams) : of(null)
			])),
			map((item) => {
				this.currentAccount(item[0], item[1], item[2], item[3]);
				return true;
			})
		);
	}

	private currentAccount(idpServiceAccount: IdpServiceAccount, userServiceAccount: UserServiceAccount, notificationServiceAccount: NotificationServiceAccount, appAccount: AppAccount): void {
		this.idpServiceAccount = idpServiceAccount;
		this.userServiceAccount = userServiceAccount;
		this.notificationServiceAccount = notificationServiceAccount;
		this.appAccount = appAccount;
		this.authState(true);
	}

	//
	//
	// Permissions
	//
	//

	public hasPermission(permission: AppPermission): boolean {
		if (!this.installationConfiguration.appServiceEnabled) { return true; } //TODO: maybe reconsider
		return this.evaluatePermission(this.appAccount.permissions, permission);
	}

	public hasIdpServicePermission(permission: IdpServicePermission): boolean {
		if (!this.installationConfiguration.idpServiceEnabled) { return true; } //TODO: maybe reconsider
		return this.evaluatePermission(this.idpServiceAccount.permissions, permission);
	}

	public hasUserServicePermission(permission: UserServicePermission): boolean {
		if (!this.installationConfiguration.userServiceEnabled) { return true; } //TODO: maybe reconsider
		return this.evaluatePermission(this.userServiceAccount.permissions, permission);
	}

	public hasNotificationServicePermission(permission: NotificationServicePermission): boolean {
		if (!this.installationConfiguration.notificationServiceEnabled) { return true; } //TODO: maybe reconsider
		return this.evaluatePermission(this.notificationServiceAccount.permissions, permission);
	}

	private evaluatePermission(availablePermissions: string[], permissionToCheck: string): boolean {
		if (!permissionToCheck) { return false; }
		if (this.hasRole(RoleType.Admin)) { return true; }
		return availablePermissions.map(x => x.toLowerCase()).includes(permissionToCheck.toLowerCase());
	}

	public hasAnyRole(roles: RoleType[]): boolean {
		if (!roles) { return false; }
		return roles.filter((r) => this.hasRole(r)).length > 0;
	}

	public hasRole(role: RoleType): boolean {
		if (role === undefined) { return false; }
		if (!this.idpServiceAccount || !this.idpServiceAccount.claims || !this.idpServiceAccount.claims.roles || this.idpServiceAccount.claims.roles.length === 0) { return false; }
		return this.idpServiceAccount.claims.roles.map(x => x.toLowerCase()).includes(role.toLowerCase());
	}

	public hasAnyPermission(permissions: AppPermission[]): boolean {
		if (!permissions) { return false; }
		return permissions.filter((p) => this.hasPermission(p)).length > 0;
	}

	public authorize(context: ResolutionContext): boolean {

		if (!context || this.hasRole(RoleType.Admin)) { return true; }

		let roleAuthorized = false;
		if (context.roles && context.roles.length > 0) {
			roleAuthorized = this.hasAnyRole(context.roles);
		}

		let permissionAuthorized = false;
		if (context.permissions && context.permissions.length > 0) {
			permissionAuthorized = this.hasAnyPermission(context.permissions);
		}

		if (roleAuthorized || permissionAuthorized) { return true; }

		return false;
	}

	public isLoggedIn(): boolean {
		return this.authState();
	}
}
