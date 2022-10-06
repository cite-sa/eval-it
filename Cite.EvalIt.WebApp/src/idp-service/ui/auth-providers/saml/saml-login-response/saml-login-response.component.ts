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
import { SamlAuthenticationProvider } from '@idp-service/core/model/authentication-configuration.model';
import { AuthenticationInfo, SignUpInfo } from '@idp-service/core/model/idp.model';
import { AuthProviderService } from '@idp-service/services/auth-provider.service';
import { IdpService } from '@idp-service/services/http/idp.service';
import { SamlLoginService } from '@idp-service/services/saml-login.service';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';

@Component({
	template: ''
})
export class SamlResponseLoginComponent extends BaseComponent implements OnInit {

	constructor(
		private route: ActivatedRoute,
		private samlLoginService: SamlLoginService,
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
			// .filter(params => params.SAMLart)
			.pipe(takeUntil(this._destroyed))
			.subscribe(routeParams => {
				let samlResponse = null;
				if (routeParams.SAMLart) {
					samlResponse = routeParams.SAMLart;
				} else if (routeParams.SAMResponse) {
					samlResponse = routeParams.SAMResponse;
				}

				if (samlResponse == null) return;

				const tenantId = this.samlLoginService.resolveTenantId(routeParams.RelayState);
				const mode = this.samlLoginService.resolveSignUpMode(routeParams.RelayState);
				const invitationCode = this.samlLoginService.resolveInvitationCode(routeParams.RelayState);
				const consentSelections = this.samlLoginService.resolveConsentSelections(routeParams.RelayState);
				const idpId = this.samlLoginService.resolveIdp(routeParams.RelayState);
				this.authProviderService.getAuthenticationProviderManager(tenantId)
					.pipe(takeUntil(this._destroyed))
					.subscribe(x => {
						const samlProvider = x.samlProviders().filter(provider => provider.options && provider.options.idpEntityId === idpId)[0];
						if (mode !== undefined) {

							this.idpService.signUpExternalSaml(idpId, samlProvider.options.binding, this.buildSignUpInfo(tenantId, samlResponse, mode, invitationCode, samlProvider), consentSelections)
								.pipe(takeUntil(this._destroyed))
								.subscribe((result) => this.onAuthenticateSuccess(), (error) => this.onAuthenticateError(error));

						} else {
							this.idpService.loginExternalSaml(samlResponse, idpId, samlProvider.options.binding, tenantId)
								.pipe(takeUntil(this._destroyed))
								.subscribe((result) => this.onAuthenticateSuccess(), (error) => this.onAuthenticateError(error));
						}
					});
			});
	}

	private buildSignUpInfo(tenantId: Guid, token: string, mode: SignUpMode, invitationCode: string, samlProvider: SamlAuthenticationProvider): SignUpInfo<AuthenticationInfo> {
		const signUpInfo: SignUpInfo<AuthenticationInfo> = {
			mode: mode,
			payload: {
				provider: samlProvider,
				token: token,
				enableSignInRegister: this.installationConfiguration.samlEnableSignInRegister
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


