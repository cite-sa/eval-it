import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { LanguageType } from '@app/core/enum/language-type.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { AuthService } from '@app/core/services/ui/auth.service';
import { TenantConfigurationBaseComponent } from '@common/base/tenant-configuration-editor.component';
import { FormService } from '@common/forms/form-service';
import { LoggingService } from '@common/logging/logging-service';
import { ConfirmationDialogComponent } from '@common/modules/confirmation-dialog/confirmation-dialog.component';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { TotpService } from '@idp-service/ui/totp/totp.service';
import { TranslateService } from '@ngx-translate/core';
import { UserServicePermission } from '@user-service/core/enum/permission.enum';
import { TenantConfigurationType } from '@user-service/core/enum/tenant-configuration-type.enum';
import { DefaultUserLocaleConfigurationDataContainer, TenantConfiguration } from '@user-service/core/model/tenant-configuration.model';
import { TenantConfigurationLookup } from '@user-service/core/query/tenant-configuration.lookup';
import { CultureInfo, CultureService } from '@user-service/services/culture.service';
import { TenantConfigurationService } from '@user-service/services/http/tenant-configuration.service';
import { LanguageService } from '@user-service/services/language.service';
import { TimezoneService } from '@user-service/services/timezone.service';
import { TenantConfigurationUserLocaleEditorModel } from '@user-service/ui/tenant-configuration/user-locale/user-locale-editor.model';
import { takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';

@Component({
	selector: 'app-tenant-configuration-user-locale-editor',
	templateUrl: './user-locale-editor.component.html',
	styleUrls: ['./user-locale-editor.component.scss']
})
export class UserLocaleEditorComponent extends TenantConfigurationBaseComponent implements OnInit {

	formGroup: FormGroup;
	editorModel: TenantConfigurationUserLocaleEditorModel;

	cultureValues = new Array<CultureInfo>();
	timezoneValues = new Array<string>();
	languageTypeValues: Array<LanguageType>;
	filteredCultures = new Array<CultureInfo>();
	filteredTimezones = new Array<string>();

	constructor(
		private tenantConfigurationService: TenantConfigurationService,
		private uiNotificationService: UiNotificationService,
		private language: TranslateService,
		private httpErrorHandlingService: HttpErrorHandlingService,
		private authService: AuthService,
		private dialog: MatDialog,
		private formService: FormService,
		private logger: LoggingService,
		private cultureService: CultureService,
		private timezoneService: TimezoneService,
		public languageService: LanguageService,
		public appEnumUtils: AppEnumUtils,
		private totpService: TotpService
	) {
		super();
	}

	ngOnInit(): void {
		this.cultureValues = this.cultureService.getCultureValues();
		this.timezoneValues = this.timezoneService.getTimezoneValues();
		this.languageTypeValues = this.appEnumUtils.getEnumValues(LanguageType);

		this.getConfiguration();
	}

	getConfiguration() {
		const lookup = new TenantConfigurationLookup();
		lookup.type = [TenantConfigurationType.DefaultUserLocale];
		lookup.project = {
			fields: [
				nameof<TenantConfiguration>(x => x.id),
				nameof<TenantConfiguration>(x => x.hash),
				nameof<TenantConfiguration>(x => x.type),
				nameof<TenantConfiguration>(x => x.createdAt),
				nameof<TenantConfiguration>(x => x.defaultUserLocaleData) + '.' + nameof<DefaultUserLocaleConfigurationDataContainer>(x => x.language),
				nameof<TenantConfiguration>(x => x.defaultUserLocaleData) + '.' + nameof<DefaultUserLocaleConfigurationDataContainer>(x => x.culture),
				nameof<TenantConfiguration>(x => x.defaultUserLocaleData) + '.' + nameof<DefaultUserLocaleConfigurationDataContainer>(x => x.timezone),
			]
		};
		this.tenantConfigurationService.query(lookup)
			.pipe(takeUntil(this._destroyed))
			.subscribe(
				data => {
					try {
						if (data.items.length === 0) {
							this.getDefaultUserLocale();
						} else {
							this.editorModel = new TenantConfigurationUserLocaleEditorModel().fromModel(data.items[0]);
							this.formGroup = this.editorModel.buildForm(null, !this.authService.hasUserServicePermission(UserServicePermission.EditTenantConfiguration));
							this.registerChangeListeners();
						}

					} catch {
						this.logger.error('Could not parse Dataset: ' + data);
						this.uiNotificationService.snackBarNotification(this.language.instant('COMMONS.ERRORS.DEFAULT'), SnackBarNotificationLevel.Error);
					}
				},
				error => this.onCallbackError(error)
			);
	}

	getDefaultUserLocale() {
		this.tenantConfigurationService.defaultUserLocale().pipe(takeUntil(this._destroyed))
			.subscribe(defaultLocale => {
				this.editorModel = new TenantConfigurationUserLocaleEditorModel();
				this.editorModel.culture = defaultLocale.culture;
				this.editorModel.language = defaultLocale.language;
				this.editorModel.timezone = defaultLocale.timezone;
				this.formGroup = this.editorModel.buildForm(null, !this.authService.hasUserServicePermission(UserServicePermission.EditTenantConfiguration));
				this.registerChangeListeners();
			});
	}

	registerChangeListeners() {
		this.filteredCultures = this.cultureValues.filter((culture) => culture.name === this.editorModel.culture);
		this.filteredTimezones = this.timezoneValues.filter((zone) => zone === this.editorModel.timezone);

		// set change listeners
		this.formGroup.get('timezone').valueChanges
			.pipe(takeUntil(this._destroyed))
			.subscribe((text) => {
				const searchText = text.toLowerCase();
				const result = this.timezoneValues.filter((zone) => zone.toLowerCase().indexOf(searchText) >= 0);
				this.filteredTimezones = result;
			});

		this.formGroup.get('culture').valueChanges
			.pipe(takeUntil(this._destroyed))
			.subscribe((text) => {
				const searchText = text.toLowerCase();
				const result = this.cultureValues.filter((culture) =>
					culture.name.toLowerCase().indexOf(searchText) >= 0 ||
					culture.nativeName.toLowerCase().indexOf(searchText) >= 0 ||
					culture.displayName.toLowerCase().indexOf(searchText) >= 0
				);
				this.filteredCultures = result;
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
		this.tenantConfigurationService.persistUserLocale(this.formGroup.value, totp)
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
					this.tenantConfigurationService.delete(value.id).pipe(takeUntil(this._destroyed))
						.subscribe(
							complete => this.onCallbackSuccess(),
							error => this.onCallbackError(error)
						);
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
}
