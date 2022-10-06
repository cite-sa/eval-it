import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '@app/core/services/ui/auth.service';
import { TenantConfigurationBaseComponent } from '@common/base/tenant-configuration-editor.component';
import { FormService } from '@common/forms/form-service';
import { LoggingService } from '@common/logging/logging-service';
import { ConfirmationDialogComponent } from '@common/modules/confirmation-dialog/confirmation-dialog.component';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { TotpService } from '@idp-service/ui/totp/totp.service';
import { TranslateService } from '@ngx-translate/core';
import { IsActive } from '@notification-service/core/enum/is-active.enum';
import { NotificationServicePermission } from '@notification-service/core/enum/permission.enum';
import { TenantConfigurationType } from '@notification-service/core/enum/tenant-configuration-type.enum';
import { EmailClientConfigurationDataContainer, TenantConfiguration } from '@notification-service/core/model/tenant-configuration.model';
import { TenantConfigurationLookup } from '@notification-service/core/query/tenant-configuration.lookup';
import { TenantConfigurationService } from '@notification-service/services/http/tenant-configuration.service';
import { TenantConfigurationEmailClientEditorModel } from '@notification-service/ui/tenant-configuration/email-client/email-client-editor.model';
import { takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';

@Component({
	selector: 'app-tenant-configuration-email-client-editor',
	templateUrl: './email-client-editor.component.html',
	styleUrls: ['./email-client-editor.component.scss']
})
export class EmailClientEditorComponent extends TenantConfigurationBaseComponent implements OnInit {

	formGroup: FormGroup;
	editorModel: TenantConfigurationEmailClientEditorModel;

	constructor(
		private tenantConfigurationService: TenantConfigurationService,
		private uiNotificationService: UiNotificationService,
		private language: TranslateService,
		private httpErrorHandlingService: HttpErrorHandlingService,
		private authService: AuthService,
		private dialog: MatDialog,
		private formService: FormService,
		private logger: LoggingService,
		private totpService: TotpService
	) {
		super();
	}

	ngOnInit(): void {
		this.getConfiguration();
	}

	getConfiguration() {
		const lookup = new TenantConfigurationLookup();
		lookup.type = [TenantConfigurationType.EmailClientConfiguration];
		lookup.isActive = [IsActive.Active];
		lookup.project = {
			fields: [
				nameof<TenantConfiguration>(x => x.id),
				nameof<TenantConfiguration>(x => x.hash),
				nameof<TenantConfiguration>(x => x.type),
				nameof<TenantConfiguration>(x => x.createdAt),
				nameof<TenantConfiguration>(x => x.emailClientData) + '.' + nameof<EmailClientConfigurationDataContainer>(x => x.requiresCredentials),
				nameof<TenantConfiguration>(x => x.emailClientData) + '.' + nameof<EmailClientConfigurationDataContainer>(x => x.enableSSL),
				nameof<TenantConfiguration>(x => x.emailClientData) + '.' + nameof<EmailClientConfigurationDataContainer>(x => x.hostServer),
				nameof<TenantConfiguration>(x => x.emailClientData) + '.' + nameof<EmailClientConfigurationDataContainer>(x => x.hostPortNo),
				nameof<TenantConfiguration>(x => x.emailClientData) + '.' + nameof<EmailClientConfigurationDataContainer>(x => x.emailAddress),
				nameof<TenantConfiguration>(x => x.emailClientData) + '.' + nameof<EmailClientConfigurationDataContainer>(x => x.emailUsername),
				nameof<TenantConfiguration>(x => x.emailClientData) + '.' + nameof<EmailClientConfigurationDataContainer>(x => x.emailPassword),
			]
		};
		this.tenantConfigurationService.query(lookup)
			.pipe(takeUntil(this._destroyed))
			.subscribe(
				data => {
					try {
						this.editorModel = data.items.length > 0 ? new TenantConfigurationEmailClientEditorModel().fromModel(data.items[0]) : new TenantConfigurationEmailClientEditorModel();
						this.formGroup = this.editorModel.buildForm(null, !this.authService.hasNotificationServicePermission(NotificationServicePermission.EditTenantConfiguration));
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
		this.tenantConfigurationService.persistEmailClientConfiguration(this.formGroup.value, totp)
			.pipe(takeUntil(this._destroyed))
			.subscribe(
				response => this.onCallbackSuccess(),
				error => this.onCallbackError(error)
			);
	}

	public delete() {
		const value = this.formGroup.value;
		if (value.id) {
			const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
				maxWidth: '300px',
				data: {
					message: this.language.instant('COMMONS.CONFIRMATION-DIALOG.DELETE-ITEM'),
					confirmButton: this.language.instant('COMMONS.CONFIRMATION-DIALOG.ACTIONS.CONFIRM'),
					cancelButton: this.language.instant('COMMONS.CONFIRMATION-DIALOG.ACTIONS.CANCEL')
				}
			});
			dialogRef.afterClosed().pipe(takeUntil(this._destroyed)).subscribe(result => {
				if (result) {
					this.totpService.askForTotpIfAvailable((totp: string) => {
						this.tenantConfigurationService.delete(value.id, totp).pipe(takeUntil(this._destroyed))
						.subscribe(
							complete => this.onCallbackSuccess(),
							error => this.onCallbackError(error)
						);
					});
				}
			});
		}
	}

	onCallbackSuccess(): void {
		this.uiNotificationService.snackBarNotification(this.language.instant('COMMONS.SNACK-BAR.SUCCESSFUL-UPDATE'), SnackBarNotificationLevel.Success);
		this.shouldShowEditSecret.clear(); //Clear any secret state
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
