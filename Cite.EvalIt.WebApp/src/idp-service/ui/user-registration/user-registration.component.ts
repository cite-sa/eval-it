import { HttpErrorResponse } from '@angular/common/http';
import { Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { TenantService } from '@app/core/services/http/tenant.service';
import { BaseComponent } from '@common/base/base.component';
import { FormService } from '@common/forms/form-service';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { Guid } from '@common/types/guid';
import { CredentialProvider } from '@idp-service/core/enum/credential-provider.enum';
import { SignUpMode } from '@idp-service/core/enum/sign-up-mode.enum';
import { AuthenticationProvider } from '@idp-service/core/model/authentication-configuration.model';
import { AuthenticationInfo, Credential, SignUpInfo, DirectLinkRegistrationInfo } from '@idp-service/core/model/idp.model';
import { AuthProviderService } from '@idp-service/services/auth-provider.service';
import { IdpService } from '@idp-service/services/http/idp.service';
import { ExternalAuthProvidersComponentConfiguration } from '@idp-service/ui/auth-providers/auth-providers.component';
import { AuthProviderManager } from '@idp-service/ui/auth-providers/manager/auth-provider-manager';
import { UserPassRegisterComponentConfiguration } from '@idp-service/ui/auth-providers/user-pass-register/user-pass-register.component';
import { ConsentValidity } from '@idp-service/ui/user-consents/editor/user-consents-editor.component';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { DirectLinkRegisterComponentConfiguration } from '@idp-service/ui/auth-providers/direct-link-register/direct-link-register.component';
import { TransientRegistrationInfo } from '@idp-service/core/model/transient-registration-info';

enum UserRegistrationStep {
	InvitationCode = 0,
	UserConsents = 1,
	ProviderSelection = 2,
	RegistrationFields = 3
}

@Component({
	selector: 'app-user-registration',
	templateUrl: './user-registration.component.html',
	styleUrls: ['./user-registration.component.scss']
})
export class UserRegistrationComponent extends BaseComponent implements OnInit {

	public externalProvidersComponentConfig: ExternalAuthProvidersComponentConfiguration = {
		showHeader: false
	};

	private returnUrl: string;
	public mode: SignUpMode = SignUpMode.Register;
	private step = UserRegistrationStep.InvitationCode;
	private selectedProvider: AuthenticationProvider = null;
	private formBuilder: FormBuilder = new FormBuilder();
	public invitationFormGroup: FormGroup = null;
	public providerManager: AuthProviderManager;
	public tenantId: Guid;
	public consentsValidity: ConsentValidity;
	public lastConsented: number;
	credentialProviderEnum = CredentialProvider;
	private isDirectLinkRequest: boolean;

	constructor(
		private zone: NgZone,
		private router: Router,
		private route: ActivatedRoute,
		private language: TranslateService,
		private idpService: IdpService,
		private formService: FormService,
		private authProviderService: AuthProviderService,
		private uiNotificationService: UiNotificationService,
		private httpErrorHandlingService: HttpErrorHandlingService,
		private tenantService: TenantService,
		public installationConfiguration: InstallationConfigurationService
	) {
		super();
	}

	ngOnInit() {
		this.invitationFormGroup = this.formBuilder.group({
			'code': ['', Validators.required],
		});

		if (this.route.snapshot.queryParamMap.has('last-consented')) {
			this.lastConsented = Number.parseInt(this.route.snapshot.queryParamMap.get('last-consented'));
		}

		const dataHandlerFn = (data) => {
			this.mode = data.mode || SignUpMode.Register;
			this.isDirectLinkRequest = data.directlink || false;
			if (this.mode === SignUpMode.Invitation) {
				this.invitationFormGroup.addControl('recaptcha', new FormControl('', [Validators.required]));
			}
			if (this.mode === SignUpMode.Register && this.step === UserRegistrationStep.InvitationCode) {
				this.moveToStep(UserRegistrationStep.UserConsents);
			}
		};
		this.route.data.pipe(takeUntil(this._destroyed)).subscribe(dataHandlerFn);

		const paramMapHandlerFn = (paramMap: ParamMap) => {
			if (this.mode === SignUpMode.Invitation) {
				this.updateInvitationCodeControl(paramMap.get('invitationCode'));
			}
			if (paramMap.has('tenantCode')) {
				this.tenantService.getSingle(paramMap.get('tenantCode')).pipe(takeUntil(this._destroyed)).subscribe(x => {
					this.tenantId = x.id;
					this.getAuthenticationProviderManager(this.tenantId);
				});
			} else if (paramMap.has('tenantId')) {
				this.tenantId = Guid.parse(paramMap.get('tenantId'));
				this.getAuthenticationProviderManager(this.tenantId);
			}
		};
		this.route.paramMap.pipe(takeUntil(this._destroyed)).subscribe(paramMapHandlerFn);

		const queryParamMapHandlerFn = (paramMap: ParamMap) => {
			this.returnUrl = paramMap.get('returnUrl') || '/';
		};
		this.route.queryParamMap.pipe(takeUntil(this._destroyed)).subscribe(queryParamMapHandlerFn);
	}

	private getAuthenticationProviderManager(tenantId: Guid) {
		this.authProviderService.getAuthenticationProviderManager(tenantId)
			.pipe(takeUntil(this._destroyed))
			.subscribe(x => {
				this.providerManager = x;
			});
	}

	public get allowInvitationCode(): boolean { return this.mode === SignUpMode.Invitation; }

	public get showInvitationCode(): boolean { return this.allowInvitationCode && this.step === UserRegistrationStep.InvitationCode; }

	public submitInvitationCode() {
		this.formService.touchAllFormFields(this.invitationFormGroup);
		if (this.invitationFormGroup.valid) {
			this.moveToStep(UserRegistrationStep.UserConsents);
		}
	}

	public get showProviderSelection(): boolean { return this.step === UserRegistrationStep.ProviderSelection; }

	public get allowRegistrationFields(): boolean { return this.selectedProvider && (this.selectedProvider.credentialProvider === CredentialProvider.UserPass || this.selectedProvider.credentialProvider === CredentialProvider.DirectLink || this.selectedProvider.credentialProvider === CredentialProvider.Transient); }
	public get showRegistrationFields(): boolean { return this.allowRegistrationFields && this.step === UserRegistrationStep.RegistrationFields; }
	public get showUserConsents(): boolean { return this.step === UserRegistrationStep.UserConsents; }

	public allowPreviousStep(): boolean {
		let allow = false;
		switch (this.step) {
			case UserRegistrationStep.ProviderSelection:
				allow = this.allowInvitationCode;
				break;
			case UserRegistrationStep.RegistrationFields:
				allow = true;
				break;
			case UserRegistrationStep.UserConsents:
				allow = this.allowInvitationCode;
				break;
			default:
				break;
		}
		return allow;
	}

	public toPreviousStep() {
		switch (this.step) {
			case UserRegistrationStep.ProviderSelection:
				this.moveToStep(UserRegistrationStep.UserConsents);
				break;
			case UserRegistrationStep.RegistrationFields:
				this.selectedProvider = null;
				if (this.isDirectLinkRequest) {
					this.moveToStep(UserRegistrationStep.UserConsents);
				} else {
					this.moveToStep(UserRegistrationStep.ProviderSelection);
				}
				break;
			case UserRegistrationStep.UserConsents:
				if (this.allowInvitationCode) {
					this.moveToStep(UserRegistrationStep.InvitationCode);
				}
				break;
			default:
				break;
		}
	}

	private moveToStep(step: UserRegistrationStep) {
		this.step = step;
		switch (step) {
			case UserRegistrationStep.ProviderSelection:
				this.selectedProvider = null;
				break;
			default:
				break;
		}
	}

	public acceptConsents() {
		if (this.isDirectLinkRequest) {
			this.updateSelectedProvider(this.getAuthenticationProvider(CredentialProvider.DirectLink) as AuthenticationProvider);
		} else {
			this.moveToStep(UserRegistrationStep.ProviderSelection);
		}
	}

	public updateSelectedProvider(provider: AuthenticationProvider) {
		this.selectedProvider = provider;
		if (provider.credentialProvider === CredentialProvider.UserPass || provider.credentialProvider === CredentialProvider.DirectLink || provider.credentialProvider === CredentialProvider.Transient) {
			this.moveToStep(UserRegistrationStep.RegistrationFields);
		}
	}

	public isDirectLinkProvider(): boolean {
		return this.selectedProvider.credentialProvider === CredentialProvider.DirectLink;
	}

	public isTransientProvider(): boolean {
		return this.selectedProvider.credentialProvider === CredentialProvider.Transient;
	}

	public isUserPassProvider(): boolean {
		return this.selectedProvider.credentialProvider === CredentialProvider.UserPass;
	}

	public registerExternal(info: AuthenticationInfo) {
		this.idpService.signUpExternal(this.buildSignUpInfo(info), this.consentsValidity.userConsents)
			.pipe(takeUntil(this._destroyed))
			.subscribe(() => this.onSignUpSuccess(), (error) => this.onSignUpError(error));
	}

	public registerInternal(credential: Credential) {
		this.idpService.signUpInternal(this.buildSignUpInfo(credential), this.consentsValidity.userConsents)
			.pipe(takeUntil(this._destroyed))
			.subscribe(() => this.onSignUpSuccess(), (error) => this.onSignUpError(error));
	}

	public registerDirectLink(directLinkRegistrationInfo: DirectLinkRegistrationInfo) {
		this.idpService.signUpDirectLink(this.buildSignUpInfo(directLinkRegistrationInfo), this.consentsValidity.userConsents)
			.pipe(takeUntil(this._destroyed))
			.subscribe(() => this.onDirectLinkRegisterSuccess(), (error) => this.onDirectLinkSignUpError(error));
	}

	public registerTransient(transientRegistrationInfo: TransientRegistrationInfo) {
		this.idpService.signUpTransient(this.buildSignUpInfo(transientRegistrationInfo), this.consentsValidity.userConsents)
			.pipe(takeUntil(this._destroyed))
			.subscribe(() => this.onSignUpSuccess(), (error) => this.onSignUpError(error));
	}


	private buildSignUpInfo<SignUpPayloadType>(payload: SignUpPayloadType): SignUpInfo<SignUpPayloadType> {
		const signUpInfo: SignUpInfo<SignUpPayloadType> = {
			mode: this.mode,
			payload: payload,
			tenantId: this.tenantId
		};
		signUpInfo.invitationCode = this.getInvitationCode();
		return signUpInfo;
	}

	onDirectLinkRegisterSuccess(): void {
		this.zone.run(() => this.router.navigate(['/login/direct-link/' + this.tenantId.toString()], { queryParams: { check_mail: true, } }));
	}

	onDirectLinkSignUpError(errorResponse: HttpErrorResponse) {
		if (errorResponse && errorResponse.error && errorResponse.error.code === 104) {
			this.uiNotificationService.snackBarNotification(this.language.instant('COMMONS.SNACK-BAR.INACTIVE-USER-EMAIL-IS-USED'), SnackBarNotificationLevel.Warning, 10000);
		} else if (errorResponse && errorResponse.error && errorResponse.error.code === 152) {
			this.zone.run(() => this.router.navigate(['/login/direct-link/' + this.tenantId.toString()], { queryParams: { check_mail: true, } }));
		} else {
			const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
			this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
		}
	}

	onSignUpSuccess(): void {
		this.uiNotificationService.snackBarNotification(this.language.instant('COMMONS.SNACK-BAR.SUCCESSFUL-LOGIN'), SnackBarNotificationLevel.Success);
		this.zone.run(() => this.router.navigateByUrl(this.returnUrl));
	}

	onSignUpError(errorResponse: HttpErrorResponse) {
		const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
		this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
	}

	getInvitationCode(): string {
		return this.mode === SignUpMode.Invitation ? this.invitationFormGroup.get('code').value : undefined;
	}

	private updateInvitationCodeControl(code: string) {
		code = code || '';
		this.invitationFormGroup.get('code').setValue(code);
		if (code) {
			this.moveToStep(UserRegistrationStep.UserConsents);
		}
	}

	public consentsValidityChanged(consentsValidity: ConsentValidity) {
		this.consentsValidity = consentsValidity;
		if (consentsValidity.consentNotRequired) {
			this.moveToStep(UserRegistrationStep.ProviderSelection);
			return;
		}
	}

	getUserPassRegisterComponentConfiguration(): UserPassRegisterComponentConfiguration {
		return {
			showHeader: false,
			recaptchaEnabled: this.mode === SignUpMode.Register && this.installationConfiguration.recaptchaEnabled
		};
	}

	getDirectLinkRegisterComponentConfiguration(): DirectLinkRegisterComponentConfiguration {
		return {
			showHeader: false,
			recaptchaEnabled: this.mode === SignUpMode.Register && this.installationConfiguration.recaptchaEnabled
		};
	}

	getAuthenticationProvider(credentialProvider: CredentialProvider): AuthenticationProvider | AuthenticationProvider[] {
		if (this.providerManager.supportsProviderForSignupMode(credentialProvider, this.mode)) {
			switch (credentialProvider) {
				case CredentialProvider.UserPass: return this.providerManager.userPassProvider();
				case CredentialProvider.Facebook: return this.providerManager.facebookProvider();
				case CredentialProvider.Twitter: return this.providerManager.twitterProvider();
				case CredentialProvider.LinkedIn: return this.providerManager.linkedInProvider();
				case CredentialProvider.Google: return this.providerManager.googleProvider();
				case CredentialProvider.Taxisnet: return this.providerManager.taxisnetProvider();
				case CredentialProvider.GitHub: return this.providerManager.gitHubProvider();
				case CredentialProvider.DirectLink: return this.providerManager.directLinkProvider();
				case CredentialProvider.Transient: return this.providerManager.transientProvider();
				case CredentialProvider.Saml: return this.providerManager.samlProviders();
				case CredentialProvider.OpenIDConnectCode: return this.providerManager.openIDConnectCodeProviders();
				case CredentialProvider.CAS: return this.providerManager.casProviders();
			}
		}
		return null;
	}
}
