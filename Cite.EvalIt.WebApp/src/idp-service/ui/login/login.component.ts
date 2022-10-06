import { HttpErrorResponse } from '@angular/common/http';
import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TenantService } from '@app/core/services/http/tenant.service';
import { BaseComponent } from '@common/base/base.component';
import { LoggingService } from '@common/logging/logging-service';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { Guid } from '@common/types/guid';
import { CredentialProvider } from '@idp-service/core/enum/credential-provider.enum';
import { AuthenticationInfo } from '@idp-service/core/model/idp.model';
import { AuthProviderService } from '@idp-service/services/auth-provider.service';
import { IdpService } from '@idp-service/services/http/idp.service';
import { ExternalAuthProvidersComponentConfiguration } from '@idp-service/ui/auth-providers/auth-providers.component';
import { AuthProviderManager } from '@idp-service/ui/auth-providers/manager/auth-provider-manager';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { AuthenticationProvider } from '@idp-service/core/model/authentication-configuration.model';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';

export enum LoginComponentMode {
	Basic = 0,
	DirectLinkMail = 1,
}

@Component({
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
})
export class LoginComponent extends BaseComponent implements OnInit {
	returnUrl: string;
	tenantId: Guid;
	loginComponentMode = LoginComponentMode.Basic;
	loginComponentModeEnum = LoginComponentMode;

	//Totp
	totpKey: string;
	needsTotpVerification = false;
	authInfoPendingTotp: AuthenticationInfo;

	public providerManager: AuthProviderManager;

	public externalProvidersComponentConfig: ExternalAuthProvidersComponentConfiguration = {
		showHeader: false
	};

	constructor(
		private zone: NgZone,
		private route: ActivatedRoute,
		private router: Router,
		private idpService: IdpService,
		private language: TranslateService,
		private uiNotificationService: UiNotificationService,
		private loggingService: LoggingService,
		private httpErrorHandlingService: HttpErrorHandlingService,
		private tenantService: TenantService,
		private authProviderService: AuthProviderService,
		public installationConfiguration: InstallationConfigurationService
	) {
		super();
	}

	ngOnInit() {
		// get return url from route parameters or default to '/'
		this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
		this.route.paramMap.pipe(takeUntil(this._destroyed)).subscribe((paramMap) => {
			if (paramMap.has('tenantCode')) {
				this.getTenantId(paramMap.get('tenantCode'));
			}
		});

		if (!this.installationConfiguration.isMultitenant) { this.getAuthManager(null); }
	}

	public doExternalLogin(info: AuthenticationInfo) {
		this.zone.run(() => {
			if (this.totpIsRequired(info)) {
				this.needsTotpVerification = true;
				this.authInfoPendingTotp = info;
			} else {
				this.proceedToLogin(info);
			}
		});
	}

	public cancelTotp() {
		this.resetTotp();
	}

	public continueTotp() {
		this.proceedToLogin(this.authInfoPendingTotp, this.totpKey);
	}

	private proceedToLogin(info: AuthenticationInfo, totp?: string) {
		this.idpService.loginExternal(info, this.tenantId, totp).pipe(takeUntil(this._destroyed)).subscribe((account) => this.onAuthenticateSuccess(), (error) => this.onAuthenticateError(error));
	}

	private totpIsRequired(info: AuthenticationInfo): boolean {
		return info.provider.auxiliaries && info.provider.auxiliaries.includes(CredentialProvider.Totp) && this.providerManager.supportsTotp();
	}

	onAuthenticateSuccess(): void {
		this.loggingService.info('Successful Login');
		this.uiNotificationService.snackBarNotification(this.language.instant('COMMONS.SNACK-BAR.SUCCESSFUL-LOGIN'), SnackBarNotificationLevel.Success);
		this.zone.run(() => this.router.navigate([this.returnUrl]));
	}

	onAuthenticateError(errorResponse: HttpErrorResponse) {
		this.zone.run(() => {
			const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
			this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
		});
	}

	signInWithDidrectLinkMailMode(enable) {
		this.loginComponentMode = LoginComponentMode.DirectLinkMail;
	}

	private resetTotp() {
		this.totpKey = undefined;
		this.needsTotpVerification = false;
		this.authInfoPendingTotp = undefined;
	}

	private getTenantId(tenantCode: string) {
		this.tenantService.getSingle(tenantCode).pipe(takeUntil(this._destroyed)).subscribe(x => {
			this.tenantId = x.id;
			this.getAuthManager(this.tenantId);
		}, () => {
			this.router.navigate(['/login']);
			this.uiNotificationService.snackBarNotification(this.language.instant('IDP-SERVICE.AUTHENTICATION.MESSAGES.TENANT-NOT-FOUND'), SnackBarNotificationLevel.Error);
		});
	}

	private getAuthManager(tenantId: Guid) {
		this.authProviderService.getAuthenticationProviderManager(tenantId)
			.pipe(takeUntil(this._destroyed))
			.subscribe(x => {
				this.providerManager = x;
			});
	}

	public updateSelectedProvider(provider: AuthenticationProvider) {
		if (provider.credentialProvider === CredentialProvider.DirectLink) {
			this.loginComponentMode = LoginComponentMode.DirectLinkMail;
		} else {
			this.loginComponentMode = LoginComponentMode.Basic;
		}
	}
}
