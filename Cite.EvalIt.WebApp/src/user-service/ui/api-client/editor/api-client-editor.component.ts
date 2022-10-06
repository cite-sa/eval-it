import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@app/core/services/ui/auth.service';
import { QueryParamsService } from '@app/core/services/ui/query-params.service';
import { BaseEditor } from '@common/base/base-editor';
import { FormService } from '@common/forms/form-service';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { LoggingService } from '@common/logging/logging-service';
import { ConfirmationDialogComponent } from '@common/modules/confirmation-dialog/confirmation-dialog.component';
import { HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { FilterService } from '@common/modules/text-filter/filter-service';
import { Guid } from '@common/types/guid';
import { TranslateService } from '@ngx-translate/core';
import { IsActive } from '@user-service/core/enum/is-active.enum';
import { UserServicePermission } from '@user-service/core/enum/permission.enum';
import { UserType } from '@user-service/core/enum/user-type.enum';
import { UserServiceEnumUtils } from '@user-service/core/formatting/enum-utils.service';
import { UserServiceUser } from '@user-service/core/model/user.model';
import { UserService } from '@user-service/services/http/user.service';
import { LanguageService } from '@user-service/services/language.service';
import { ApiClientEditorModel } from '@user-service/ui/api-client/editor/api-client-editor.model';
import { ApiClientEditorResolver } from '@user-service/ui/api-client/editor/api-client-editor.resolver';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-api-client-editor',
	templateUrl: './api-client-editor.component.html',
	styleUrls: ['./api-client-editor.component.scss']
})

export class ApiClientEditorComponent extends BaseEditor<ApiClientEditorModel, UserServiceUser> implements OnInit {

	isNew = true;
	isDeleted = false;
	formGroup: FormGroup = null;

	constructor(
		public authService: AuthService,
		public enumUtils: UserServiceEnumUtils,
		protected dialog: MatDialog,
		protected userService: UserService,
		protected route: ActivatedRoute,
		protected router: Router,
		protected language: TranslateService,
		protected formService: FormService,
		protected uiNotificationService: UiNotificationService,
		protected logger: LoggingService,
		protected httpErrorHandlingService: HttpErrorHandlingService,
		protected installationConfiguration: InstallationConfigurationService,
		protected languageService: LanguageService,
		protected filterService: FilterService,
		protected datePipe: DatePipe,
		protected queryParamsService: QueryParamsService,
	) {
		super(dialog, language, formService, router, uiNotificationService, httpErrorHandlingService, filterService, datePipe, route, queryParamsService);
	}

	ngOnInit(): void {
		super.ngOnInit();
	}

	buildForm(): void {
		this.formGroup = this.editorModel.buildForm(this.installationConfiguration, this.languageService, null, this.isDeleted || !this.authService.hasUserServicePermission(UserServicePermission.EditUserService));
	}

	formSubmit(): void {
		this.formService.touchAllFormFields(this.formGroup);
		if (!this.isFormValid()) { return; }
		this.persistEntity();
	}

	persistEntity(onSuccess?: (response: any) => void): void {
		this.userService.persist(this.formGroup.value)
			.pipe(takeUntil(this._destroyed))
			.subscribe(
				complete => this.onCallbackSuccess(),
				error => this.onCallbackError(error)
			);
	}
	getItem(itemId: Guid, successFunction: (item: UserServiceUser) => void): void {
		this.userService.getSingle(itemId, [
			...ApiClientEditorResolver.lookupFields()
		]).pipe(takeUntil(this._destroyed))
			.subscribe(
				data => successFunction(data),
				error => this.onCallbackError(error)
			);
	}
	prepareForm(data: UserServiceUser): void {
		try {
			if (data.type !== UserType.Service) {
				this.uiNotificationService.snackBarNotification(this.language.instant('USER-SERVICE.API-CLIENT-EDITOR.INCOMPATIBLE-USER-TYPE'), SnackBarNotificationLevel.Error);
				return;
			}
			this.editorModel = new ApiClientEditorModel().fromModel(data);
			this.isDeleted = data.isActive === IsActive.Inactive;
			this.buildForm();
			return;
		} catch {
			this.logger.error('Could not parse ApiClient: ' + data);
			this.uiNotificationService.snackBarNotification(this.language.instant('COMMONS.ERRORS.DEFAULT'), SnackBarNotificationLevel.Error);
		}
	}
	refreshData(): void {
		this.getItem(this.editorModel.id, (data: UserServiceUser) => this.prepareForm(data));
	}
	refreshOnNavigateToData(id?: Guid): void {
		if (this.isNew) {
			this.formGroup.markAsPristine();
			this.router.navigate(['/api-clients/' + (id ? id : this.editorModel.id)], { queryParams: { 'lookup': this.queryParamsService.serializeLookup(this.lookupParams), 'lv': ++this.lv }, replaceUrl: true });
		} else { this.internalRefreshData(); }
	}
	delete(): void {
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
			dialogRef.afterClosed()
				.pipe(takeUntil(this._destroyed))
				.subscribe(result => {
					if (result) {
						this.userService.delete(value.id).pipe(takeUntil(this._destroyed))
							.subscribe(
								complete => this.onCallbackSuccess(),
								error => this.onCallbackError(error)
							);
					}
				});
		}
	}

	getKeyPlaceHolder() {
		return '*******************************';
	}

	onCallbackSuccess(): void {
		this.uiNotificationService.snackBarNotification(this.isNew ? this.language.instant('COMMONS.SNACK-BAR.SUCCESSFUL-CREATION') : this.language.instant('COMMONS.SNACK-BAR.SUCCESSFUL-UPDATE'), SnackBarNotificationLevel.Success);
		this.router.navigate(['/api-clients']);
	}

}
