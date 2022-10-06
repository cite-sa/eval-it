import { HttpErrorResponse } from '@angular/common/http';
import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '@common/base/base.component';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { LoggingService } from '@common/logging/logging-service';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { Guid } from '@common/types/guid';
import { SignUpMode } from '@idp-service/core/enum/sign-up-mode.enum';
import { OpenIDConnectCodeAuthenticationProvider } from '@idp-service/core/model/authentication-configuration.model';
import { AuthenticationInfo, SignUpInfo } from '@idp-service/core/model/idp.model';
import { AuthProviderService } from '@idp-service/services/auth-provider.service';
import { IdpService } from '@idp-service/services/http/idp.service';
import { OpenIDConnectCodeLoginService } from '@idp-service/services/openid-connect-code-login.service';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';

@Component({
	template: ''
})
export class OpenIDConnectCodeResponseLoginComponent extends BaseComponent implements OnInit {

	constructor(
		private route: ActivatedRoute,
		private openIDConnectCodeLoginService: OpenIDConnectCodeLoginService,
		private router: Router,
		private uiNotificationService: UiNotificationService,
		private loggingService: LoggingService,
		private zone: NgZone,
		private language: TranslateService,
		private httpErrorHandlingService: HttpErrorHandlingService,
		private idpService: IdpService,
		private authProviderService: AuthProviderService,
		private installationConfiguration: InstallationConfigurationService
	) { super(); }

	ngOnInit() {
		this.route.queryParams
			// .filter(params => params.OpenIDConnectCodeart)
			.pipe(takeUntil(this._destroyed))
			.subscribe(routeParams => {
				let code = null;
				if (routeParams.code) {
					code = routeParams.code;
				}
				if (code == null) return;

				const tenantId = this.openIDConnectCodeLoginService.resolveTenantId(routeParams.state);
				const mode = this.openIDConnectCodeLoginService.resolveSignUpMode(routeParams.state);
				const invitationCode = this.openIDConnectCodeLoginService.resolveInvitationCode(routeParams.state);
				const consentSelections = this.openIDConnectCodeLoginService.resolveConsentSelections(routeParams.state);
				const idpId = this.openIDConnectCodeLoginService.resolveIdp(routeParams.state);
				this.authProviderService.getAuthenticationProviderManager(tenantId)
					.pipe(takeUntil(this._destroyed))
					.subscribe(x => {
						const OpenIDConnectCodeProvider = x.openIDConnectCodeProviders().filter(provider => provider.options && provider.options.idpId === idpId)[0];
						if (mode !== undefined) {

							this.idpService.signUpExternalOpenIDConnectCode(idpId, this.buildSignUpInfo(tenantId, code, mode, invitationCode, OpenIDConnectCodeProvider), consentSelections)
								.pipe(takeUntil(this._destroyed))
								.subscribe((result) => this.onAuthenticateSuccess(), (error) => this.onAuthenticateError(error));

						} else {
							this.idpService.loginExternalOpenIDConnectCode(code, idpId, tenantId)
								.pipe(takeUntil(this._destroyed))
								.subscribe((result) => this.onAuthenticateSuccess(), (error) => this.onAuthenticateError(error));
						}
					});
			});
	}

	private buildSignUpInfo(tenantId: Guid, token: string, mode: SignUpMode, invitationCode: string, OpenIDConnectCodeProvider: OpenIDConnectCodeAuthenticationProvider): SignUpInfo<AuthenticationInfo> {
		const signUpInfo: SignUpInfo<AuthenticationInfo> = {
			mode: mode,
			payload: {
				provider: OpenIDConnectCodeProvider,
				token: token,
				enableSignInRegister: this.installationConfiguration.openIDConnectCodeEnableSignInRegister
			},
			tenantId: tenantId
		};
		if (mode === SignUpMode.Invitation) { signUpInfo.invitationCode = invitationCode; }
		return signUpInfo;
	}

	onAuthenticateSuccess(): void {
		this.loggingService.info('Successful Login');
		this.uiNotificationService.snackBarNotification(this.language.instant('COMMONS.SNACK-BAR.SUCCESSFUL-LOGIN'), SnackBarNotificationLevel.Success);
		this.zone.run(() => this.router.navigate(['/']));
	}

	onAuthenticateError(errorResponse: HttpErrorResponse) {
		const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
		this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
		this.zone.run(() => this.router.navigate(['/']));
	}
}


