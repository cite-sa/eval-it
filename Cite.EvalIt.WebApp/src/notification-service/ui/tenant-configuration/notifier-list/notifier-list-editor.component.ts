import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '@app/core/services/ui/auth.service';
import { BaseComponent } from '@common/base/base.component';
import { FormService } from '@common/forms/form-service';
import { LoggingService } from '@common/logging/logging-service';
import { ConfirmationDialogComponent } from '@common/modules/confirmation-dialog/confirmation-dialog.component';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { TotpService } from '@idp-service/ui/totp/totp.service';
import { TranslateService } from '@ngx-translate/core';
import { ContactType } from '@notification-service/core/enum/contact-type.enum';
import { IsActive } from '@notification-service/core/enum/is-active.enum';
import { NotificationType } from '@notification-service/core/enum/notification-type.enum';
import { NotificationServicePermission } from '@notification-service/core/enum/permission.enum';
import { TenantConfigurationType } from '@notification-service/core/enum/tenant-configuration-type.enum';
import { NotificationServiceEnumUtils } from '@notification-service/core/formatting/enum-utils.service';
import { NotifierListConfigurationDataContainer, TenantConfiguration } from '@notification-service/core/model/tenant-configuration.model';
import { NotifierListLookup } from '@notification-service/core/query/notifier-list.lookup';
import { TenantConfigurationLookup } from '@notification-service/core/query/tenant-configuration.lookup';
import { TenantConfigurationService } from '@notification-service/services/http/tenant-configuration.service';
import { TenantConfigurationNotifierListEditorModel } from '@notification-service/ui/tenant-configuration/notifier-list/notifier-list-editor.model';
import { takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';

@Component({
	selector: 'app-tenant-configuration-notifier-list-editor',
	templateUrl: './notifier-list-editor.component.html',
	styleUrls: ['./notifier-list-editor.component.scss']
})
export class NotifierListEditorComponent extends BaseComponent implements OnInit {

	formGroup: FormGroup;
	editorModel: TenantConfigurationNotifierListEditorModel;
	availableNotifiers: { [key: string]: ContactType[] } = {};
	availableNotifiersKeys: NotificationType[];

	constructor(
		private tenantConfigurationService: TenantConfigurationService,
		private uiNotificationService: UiNotificationService,
		private language: TranslateService,
		private httpErrorHandlingService: HttpErrorHandlingService,
		private authService: AuthService,
		private dialog: MatDialog,
		private formService: FormService,
		private logger: LoggingService,
		public notificationServiceEnumUtils: NotificationServiceEnumUtils,
		private totpService: TotpService
	) {
		super();
	}

	ngOnInit(): void {
		this.getConfiguration();
	}

	getConfiguration() {
		this.formGroup = null;
		this.tenantConfigurationService.getNotifierList(new NotifierListLookup())
			.pipe(takeUntil(this._destroyed))
			.subscribe(
				data => {
					try {
						this.availableNotifiers = data.notifiers;
						this.availableNotifiersKeys = Object.keys(this.availableNotifiers) as NotificationType[];
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
		const lookup = new TenantConfigurationLookup();
		lookup.type = [TenantConfigurationType.NotifierList];
		lookup.isActive = [IsActive.Active];
		lookup.project = {
			fields: [
				nameof<TenantConfiguration>(x => x.id),
				nameof<TenantConfiguration>(x => x.hash),
				nameof<TenantConfiguration>(x => x.type),
				nameof<TenantConfiguration>(x => x.createdAt),
				nameof<TenantConfiguration>(x => x.notifierListData) + '.' + nameof<NotifierListConfigurationDataContainer>(x => x.notifiers)
			]
		};
		this.tenantConfigurationService.query(lookup)
			.pipe(takeUntil(this._destroyed))
			.subscribe(
				data => {
					try {
						if (data.items.length > 0) { this.orderAvailableItemsbasedOnExistingSelections(data.items[0].notifierListData); };
						this.editorModel = data.items.length > 0 ? new TenantConfigurationNotifierListEditorModel().fromModel(data.items[0]) : new TenantConfigurationNotifierListEditorModel();
						this.formGroup = this.editorModel.buildForm(null, !this.authService.hasNotificationServicePermission(NotificationServicePermission.EditTenantConfiguration), this.availableNotifiersKeys);
					} catch {
						this.logger.error('Could not parse Dataset: ' + data);
						this.uiNotificationService.snackBarNotification(this.language.instant('COMMONS.ERRORS.DEFAULT'), SnackBarNotificationLevel.Error);
					}
				},
				error => this.onCallbackError(error)
			);
	}

	orderAvailableItemsbasedOnExistingSelections(existingSelections: NotifierListConfigurationDataContainer) {
		if (!existingSelections.notifiers) { return; }
		this.availableNotifiersKeys.forEach(key => {
			const orderedList = [];
			orderedList.push(...(existingSelections.notifiers[key] || []).filter(x => this.availableNotifiers[key].includes(x))); // First push the selected ordered values.
			orderedList.push(...this.availableNotifiers[key].filter(x => !orderedList.includes(x))); //Then push the rest items.
			this.availableNotifiers[key] = orderedList;
		});
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
		// Clear empty or null selections.
		Object.keys(persistValue.notifiers).forEach(key => {
			if (persistValue.notifiers[key] == null || persistValue.notifiers[key].length === 0) { delete persistValue.notifiers[key]; }
		});
		this.tenantConfigurationService.persistNotifierListConfiguration(persistValue, totp)
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

	dropped(event: CdkDragDrop<string[]>, type: NotificationType) {
		moveItemInArray(this.availableNotifiers[type], event.previousIndex, event.currentIndex);
		const selectedArray: ContactType[] = this.formGroup.get('notifiers').value[type] || [];
		if (selectedArray.indexOf(this.availableNotifiers[type][event.currentIndex]) >= 0 && selectedArray.indexOf(this.availableNotifiers[type][event.previousIndex]) >= 0) {
			moveItemInArray(this.formGroup.get('notifiers').value[type], selectedArray.indexOf(this.availableNotifiers[type][event.currentIndex]), selectedArray.indexOf(this.availableNotifiers[type][event.previousIndex]));
		}
	}
}
