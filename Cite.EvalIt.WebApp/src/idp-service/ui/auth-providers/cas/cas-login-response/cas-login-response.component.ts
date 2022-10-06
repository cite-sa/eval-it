import { HttpErrorResponse } from '@angular/common/http';
import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '@common/base/base.component';
import { LoggingService } from '@common/logging/logging-service';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { Guid } from '@common/types/guid';
import { SignUpMode } from '@idp-service/core/enum/sign-up-mode.enum';
import { CASAuthenticationProvider } from '@idp-service/core/model/authentication-configuration.model';
import { AuthenticationInfo, SignUpInfo } from '@idp-service/core/model/idp.model';
import { AuthProviderService } from '@idp-service/services/auth-provider.service';
import { IdpService } from '@idp-service/services/http/idp.service';
import { CASLoginService } from '@idp-service/services/cas-login.service';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';

@Component({
	template: ''
})
export class CASResponseLoginComponent extends BaseComponent implements OnInit {

	constructor(
		private route: ActivatedRoute,
		private casLoginService: CASLoginService,
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
			.pipe(takeUntil(this._destroyed))
			.subscribe(routeParams => {
				if (routeParams.ticket) {
					const tenantId = this.casLoginService.resolveTenantId(routeParams.relayState);
					const mode = this.casLoginService.resolveSignUpMode(routeParams.relayState);
					const invitationCode = this.casLoginService.resolveInvitationCode(routeParams.relayState);
					const consentSelections = this.casLoginService.resolveConsentSelections(routeParams.relayState);
					const idpId = this.casLoginService.resolveIdp(routeParams.relayState);
					this.authProviderService.getAuthenticationProviderManager(tenantId)
						.pipe(takeUntil(this._destroyed))
						.subscribe(x => {
							const casProvider = x.casProviders().filter(provider => provider.options && provider.options.idpEntityId === idpId)[0];
							if (mode !== undefined) {

								this.idpService.signUpExternalCAS(idpId, this.casLoginService.getCASService(tenantId, idpId, mode, invitationCode, consentSelections), this.buildSignUpInfo(tenantId, routeParams.ticket, mode, invitationCode, casProvider), consentSelections)
									.pipe(takeUntil(this._destroyed))
									.subscribe((result) => this.onAuthenticateSuccess(), (error) => this.onAuthenticateError(error));

							} else {
								this.idpService.loginExternalCAS(routeParams.ticket, this.casLoginService.getCASService(tenantId, idpId, mode, invitationCode, consentSelections), idpId, tenantId)
									.pipe(takeUntil(this._destroyed))
									.subscribe((result) => this.onAuthenticateSuccess(), (error) => this.onAuthenticateError(error));
							}
						});
				}
			});
	}

	private buildSignUpInfo(tenantId: Guid, token: string, mode: SignUpMode, invitationCode: string, casProvider: CASAuthenticationProvider): SignUpInfo<AuthenticationInfo> {
		const signUpInfo: SignUpInfo<AuthenticationInfo> = {
			mode: mode,
			payload: {
				provider: casProvider,
				token: token,
				enableSignInRegister: this.installationConfiguration.casEnableSignInRegister
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


