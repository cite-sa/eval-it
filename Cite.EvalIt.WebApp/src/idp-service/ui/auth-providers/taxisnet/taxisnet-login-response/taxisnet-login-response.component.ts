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
import { AuthenticationProvider } from '@idp-service/core/model/authentication-configuration.model';
import { AuthenticationInfo, SignUpInfo } from '@idp-service/core/model/idp.model';
import { AuthProviderService } from '@idp-service/services/auth-provider.service';
import { IdpService } from '@idp-service/services/http/idp.service';
import { TaxisnetLoginService } from '@idp-service/services/taxisnet-login.service';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';

@Component({
	template: ''
})
export class TaxisnetLoginResponseComponent extends BaseComponent implements OnInit {

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private uiNotificationService: UiNotificationService,
		private loggingService: LoggingService,
		private zone: NgZone,
		private language: TranslateService,
		private httpErrorHandlingService: HttpErrorHandlingService,
		private idpService: IdpService,
		public taxisnetLoginService: TaxisnetLoginService,
		private authProviderService: AuthProviderService,
		private installationConfiguration: InstallationConfigurationService
	) { super(); }

	ngOnInit() {
		this.route.queryParams
			// .filter(params => params.SAMLart)
			.pipe(takeUntil(this._destroyed))
			.subscribe(routeParams => {
				if (routeParams.code) {
					const mode = this.taxisnetLoginService.resolveSignUpMode(routeParams.state);
					const invitationCode = this.taxisnetLoginService.resolveInvitationCode(routeParams.state);
					const consentSelections = this.taxisnetLoginService.resolveConsentSelections(routeParams.state);
					const tenantId = this.taxisnetLoginService.resolveTenantId(routeParams.state);
					this.authProviderService.getAuthenticationProviderManager(tenantId)
						.pipe(takeUntil(this._destroyed))
						.subscribe(x => {
							const taxisnetProvider = x.taxisnetProvider();
							if (mode !== undefined) {
								this.idpService.signUpExternal(this.buildSignUpInfo(tenantId, routeParams.code, mode, invitationCode, taxisnetProvider), consentSelections)
									.pipe(takeUntil(this._destroyed))
									.subscribe((account) => this.onAuthenticateSuccess(), (error) => this.onAuthenticateError(error));

							} else {
								this.idpService.loginExternal({ provider: taxisnetProvider, token: routeParams.code, enableSignInRegister: this.installationConfiguration.taxisnetEnableSignInRegister }, tenantId)
									.pipe(takeUntil(this._destroyed))
									.subscribe((account) => this.onAuthenticateSuccess(), (error) => this.onAuthenticateError(error));
							}
						});
				} else {
					this.onAuthenticateError(routeParams.error ? routeParams.error : '');
				}
			});
	}

	private buildSignUpInfo(tenantId: Guid,token: string, mode: SignUpMode, invitationCode: string, provider: AuthenticationProvider): SignUpInfo<AuthenticationInfo> {
		const signUpInfo: SignUpInfo<AuthenticationInfo> = {
			mode: mode,
			payload: {
				provider: provider,
				token: token,
				enableSignInRegister: this.installationConfiguration.taxisnetEnableSignInRegister
			},
			tenantId: tenantId
		};
		if (mode === SignUpMode.Invitation) { signUpInfo.invitationCode = invitationCode; }
		return signUpInfo;
	}

	onAuthenticateSuccess(): void {
		this.loggingService.info('Successful Login');
		this.uiNotificationService.snackBarNotification(this.language.instant('GENERAL.SNACK-BAR.SUCCESSFUL-LOGIN'), SnackBarNotificationLevel.Success);
		this.zone.run(() => this.router.navigate(['/']));
	}

	onAuthenticateError(errorResponse: HttpErrorResponse) {
		const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
		this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
		this.zone.run(() => this.router.navigate(['/']));
	}
}


