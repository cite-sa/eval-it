import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, NgZone, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { TenantService } from '@app/core/services/http/tenant.service';
import { BaseComponent } from '@common/base/base.component';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { Guid } from '@common/types/guid';
import { Credential } from '@idp-service/core/model/idp.model';
import { AuthProviderService } from '@idp-service/services/auth-provider.service';
import { IdpService } from '@idp-service/services/http/idp.service';
import { AuthProviderManager } from '@idp-service/ui/auth-providers/manager/auth-provider-manager';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-direct-link-login',
	templateUrl: './direct-link-login.component.html',
	styleUrls: ['./direct-link-login.component.scss']
})
export class DirectLinkLoginComponent extends BaseComponent implements OnInit {

	@Output() onAuthenticateSuccess = new EventEmitter<any>();

	private formBuilder: FormBuilder = new FormBuilder();
	formGroup: FormGroup = null;
	@Input() totpEnabled = false;
	@Input() tenantId: Guid;
	public providerManager: AuthProviderManager;
	private returnUrl: string;
	autoLogin = false;
	checkMail = false;
	originPage: number;
	hasInvalidGrant = false;

	constructor(
		private router: Router,
		private zone: NgZone,
		private route: ActivatedRoute,
		private idpService: IdpService,
		private language: TranslateService,
		private tenantService: TenantService,
		private uiNotificationService: UiNotificationService,
		private authProviderService: AuthProviderService,
		private httpErrorHandlingService: HttpErrorHandlingService
	) { super(); }

	ngOnInit() {
		this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
		this.formGroup = this.buildForm();
		this.route.queryParams
			.pipe(takeUntil(this._destroyed))
			.subscribe(routeParams => {
				this.checkMail = false;

				if (routeParams.check_mail) {
					this.checkMail = routeParams.check_mail;
				}
			});
		this.route.paramMap.pipe(takeUntil(this._destroyed)).subscribe((paramMap) => {
			this.autoLogin = false;
			if (paramMap.has('tenantCode')) {
				this.tenantService.getSingle(paramMap.get('tenantCode')).pipe(takeUntil(this._destroyed)).subscribe(x => {
					this.tenantId = x.id;
					this.getAuthenticationProviderManager(this.tenantId, paramMap);
				});
			} else if (paramMap.has('tenantId')) {
				this.tenantId = Guid.parse(paramMap.get('tenantId'));
				this.getAuthenticationProviderManager(this.tenantId, paramMap);
			}
		});
	}

	private getAuthenticationProviderManager(tenantId: Guid, paramMap: ParamMap) {
		this.authProviderService.getAuthenticationProviderManager(tenantId)
			.pipe(takeUntil(this._destroyed))
			.subscribe(x => {
				this.providerManager = x;
				this.tryAutoLogin(paramMap);
			});
	}

	buildForm(): FormGroup {
		return this.formBuilder.group({
			password: ['', [Validators.required]],
		});
	}

	public isFormValid() {
		return this.formGroup.valid;
	}

	login() {
		if (!this.isFormValid()) { return; }

		const credential: Credential = {
			username: '',
			password: this.formGroup.get('password').value,
			recaptcha: null,
		};
		this.idpService.loginDirectLink(credential, this.tenantId).pipe(takeUntil(this._destroyed)).subscribe(
			account => this.onLoginSuccess(),
			error => this.onLoginError(error)
		);
	}

	tryAutoLogin(paramMap: ParamMap) {
		if (paramMap.has('key')) {
			const key = paramMap.get('key');
			this.autoLogin = true;
			const credential: Credential = {
				username: '',
				password: key,
				recaptcha: null
			};
			this.idpService.loginDirectLink(credential, this.tenantId).pipe(takeUntil(this._destroyed)).subscribe(
				account => this.onLoginSuccess(),
				error => this.onLoginError(error)
			);
		}
	}

	private onLoginSuccess(): void {
		this.onAuthenticateSuccess.emit();
		this.uiNotificationService.snackBarNotification(this.language.instant('COMMONS.SNACK-BAR.SUCCESSFUL-LOGIN'), SnackBarNotificationLevel.Success);
		this.zone.run(() => this.router.navigate([this.returnUrl]));
	}

	private onLoginError(errorResponse: HttpErrorResponse) {
		const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
		this.hasInvalidGrant = true;
		this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
	}


	backUrl() {
		this.zone.run(() => this.router.navigate(['/login'], { queryParams: { returnUrl: this.returnUrl } }));
		//return [(this.authService.isLoggedIn() ? '/' : '/login?returnUrl=' + this.returnUrl)];
	}
}
