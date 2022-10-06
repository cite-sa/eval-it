import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AuthService } from '@app/core/services/ui/auth.service';
import { TenantConfigurationBaseComponent } from '@common/base/tenant-configuration-editor.component';
import { FormService } from '@common/forms/form-service';
import { LoggingService } from '@common/logging/logging-service';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { CredentialProvider } from '@idp-service/core/enum/credential-provider.enum';
import { IdpServicePermission } from '@idp-service/core/enum/permission.enum';
import { IdpServiceEnumUtils } from '@idp-service/core/formatting/enum-utils.service';
import { CredentialProviderService } from '@idp-service/services/http/credential-provider.service';
import { TenantConfigurationCredentialProvidersEditorModel } from '@idp-service/ui/tenant-configuration/credential-providers/credential-providers-editor.model';
import { TotpService } from '@idp-service/ui/totp/totp.service';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-tenant-configuration-credential-providers-editor',
	templateUrl: './credential-providers-editor.component.html',
	styleUrls: ['./credential-providers-editor.component.scss']
})
export class CredentialProvidersEditorComponent extends TenantConfigurationBaseComponent implements OnInit {

	formGroup: FormGroup;
	editorModel: TenantConfigurationCredentialProvidersEditorModel;
	selectedProviders: CredentialProvider[] = [];
	availableProviders: CredentialProvider[] = [];

	constructor(
		private credentialProviderService: CredentialProviderService,
		private uiNotificationService: UiNotificationService,
		private language: TranslateService,
		private httpErrorHandlingService: HttpErrorHandlingService,
		private authService: AuthService,
		private totpService: TotpService,
		private formService: FormService,
		private logger: LoggingService,
		public idpServiceEnumUtils: IdpServiceEnumUtils
	) {
		super();
	}

	ngOnInit(): void {
		this.getConfiguration();
	}

	getConfiguration() {
		const tenantId = this.authService.tenantId();
		this.credentialProviderService.configurationAll(tenantId)
			.pipe(takeUntil(this._destroyed))
			.subscribe(
				data => {
					try {
						this.availableProviders = data.all().map(provider => provider.credentialProvider);
						this.getExistingSelections();
					} catch {
						this.logger.error('Could not parse Dataset: ' + data);
						this.uiNotificationService.snackBarNotification(this.language.instant('COMMONS.ERRORS.DEFAULT'), SnackBarNotificationLevel.Error);
					}
				},
				error => this.onCallbackError(error)
			);
	}

	getExistingSelections() {
		const tenantId = this.authService.tenantId();
		this.credentialProviderService.configuration(tenantId)
			.pipe(takeUntil(this._destroyed))
			.subscribe(
				data => {
					try {
						this.editorModel = data ? new TenantConfigurationCredentialProvidersEditorModel().fromModel(data) : new TenantConfigurationCredentialProvidersEditorModel();
						this.formGroup = this.editorModel.buildForm(null, !this.authService.hasIdpServicePermission(IdpServicePermission.EditTenantCredentialProvider));
					} catch {
						this.logger.error('Could not parse Dataset: ' + data);
						this.uiNotificationService.snackBarNotification(this.language.instant('COMMONS.ERRORS.DEFAULT'), SnackBarNotificationLevel.Error);
					}
				},
				error => this.onCallbackError(error)
			);
	}

	formSubmit(): void {
		this.clearErrorModel();
		this.formService.touchAllFormFields(this.formGroup);
		if (!this.isFormValid()) { return; }
		this.totpService.askForTotpIfAvailable((totp: string) => {
			this.persist(totp);
		});
	}

	public isFormValid() {
		return this.formGroup.valid;
	}

	private persist(totp?: string) {
		const persistValue = this.formGroup.value;
		this.credentialProviderService.persist(persistValue, totp)
			.pipe(takeUntil(this._destroyed))
			.subscribe(
				response => this.onCallbackSuccess(),
				error => this.onCallbackError(error)
			);
	}

	onCallbackSuccess(): void {
		this.uiNotificationService.snackBarNotification(this.language.instant('COMMONS.SNACK-BAR.SUCCESSFUL-UPDATE'), SnackBarNotificationLevel.Success);
		//Clear cached credential providers
		this.credentialProviderService.clearCache();
		this.getConfiguration();
	}

	onCallbackError(errorResponse: HttpErrorResponse) {
		const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
		if (error.statusCode === 400) {
			this.editorModel.validationErrorModel.fromJSONObject(errorResponse.error);
			this.formService.validateAllFormFields(this.formGroup);
		} else {
			this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
		}
	}

	clearErrorModel() {
		this.editorModel.validationErrorModel.clear();
		this.formService.validateAllFormFields(this.formGroup);
	}
}



// extends BaseComponent implements OnInit, OnChanges {

// 	@Input() tenantConfiguration: TenantConfiguration;
// 	@Output() configurationChanged: EventEmitter<void> = new EventEmitter();
// 	selectedProviders: CredentialProvider[] = [];
// 	availableProviders: CredentialProvider[] = [];

// 	constructor(
// 		public idpEnumUtils: IdpServiceEnumUtils,
// 		private tenantConfigurationService: TenantConfigurationService,
// 		private uiNotificationService: UiNotificationService,
// 		private language: TranslateService,
// 		private httpErrorHandlingService: HttpErrorHandlingService,
// 		private credentialProviderService: CredentialProviderService,
// 		private authService: AuthService,
// 		private dialog: MatDialog
// 	) {
// 		super();
// 	}

// 	ngOnInit() {
// 		const tenantId = this.authService.tenantId();
// 		this.credentialProviderService.configurationAll(tenantId)
// 			.pipe(takeUntil(this._destroyed))
// 			.subscribe(x => {
// 				this.availableProviders = x.all().map(provider => provider.credentialProvider);
// 				this.setTenantConfiguration(this.tenantConfiguration);
// 			});
// 	}

// 	ngOnChanges(changes: SimpleChanges) {
// 		if (changes['tenantConfiguration'] && !changes['tenantConfiguration'].isFirstChange()) {
// 			this.setTenantConfiguration(this.tenantConfiguration);
// 		}
// 	}

// 	private setTenantConfiguration(tenantConfiguration: TenantConfiguration) {
// 		if (tenantConfiguration &&
// 			tenantConfiguration.valueCredentialProviders &&
// 			Array.isArray(tenantConfiguration.valueCredentialProviders.providers
// 			)) {
// 			this.selectedProviders = tenantConfiguration.valueCredentialProviders.providers;
// 		} else {
// 			this.selectedProviders = [];
// 		}
// 	}

// 	_save() {
// 		if (this.authService.hasTotp()) {
// 			let dialogRef;
// 			dialogRef = this.dialog.open(TotpDialogComponent);
// 			dialogRef.afterClosed().pipe(takeUntil(this._destroyed)).subscribe(result => {
// 				if (!result) { return; }
// 				this.persist(result);
// 			});
// 		} else {
// 			this.persist();
// 		}
// 	}

// 	private persist(totp?: string) {
// 		const persist: TenantConfigurationCredentialProviderPersist = {
// 			id: this.tenantConfiguration ? this.tenantConfiguration.id : undefined,
// 			hash: this.tenantConfiguration ? this.tenantConfiguration.hash : undefined,
// 			providers: this.selectedProviders
// 		};
// 		this.tenantConfigurationService.persistCredentialProviders(persist, totp)
// 			.pipe(takeUntil(this._destroyed))
// 			.subscribe(
// 				response => this.onCallbackSuccess(response),
// 				error => this.onCallbackError(error)
// 			);
// 	}

// 	private onCallbackSuccess(response: TenantConfiguration): void {
// 		// this.tenantConfiguration.hash = response.hash;
// 		this.configurationChanged.emit();
// 		this.credentialProviderService.clearCache();
// 		this.uiNotificationService.snackBarNotification(this.language.instant('COMMONS.SNACK-BAR.SUCCESSFUL-UPDATE'), SnackBarNotificationLevel.Success);
// 	}

// 	private onCallbackError(errorResponse: HttpErrorResponse) {
// 		const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
// 		this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
// 	}
// }
