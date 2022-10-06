import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { IsActiveTypePipe } from '@app/core/formatting/pipes/is-active-type.pipe';
import { AuthService } from '@app/core/services/ui/auth.service';
import { QueryParamsService } from '@app/core/services/ui/query-params.service';
import { BaseListingComponent } from '@common/base/base-listing-component';
import { PipeService } from '@common/formatting/pipe.service';
import { QueryResult } from '@common/model/query-result';
import { ConfirmationDialogComponent } from '@common/modules/confirmation-dialog/confirmation-dialog.component';
import { HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { DataTableHeaderFormattingService } from '@common/modules/listing/data-table-header-formatting-service';
import { ColumnDefinition, ColumnsChangedEvent, PageLoadEvent } from '@common/modules/listing/listing.component';
import { UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { IsActive } from '@idp-service/core/enum/is-active.enum';
import { TotpService } from '@idp-service/ui/totp/totp.service';
import { TranslateService } from '@ngx-translate/core';
import { ForgetMeRequestState } from '@user-service/core/enum/forget-me-request-state.enum';
import { ForgetMeRequestValidation } from '@user-service/core/enum/forget-me-request-validation.enum';
import { UserServicePermission } from '@user-service/core/enum/permission.enum';
import { ForgetMeStatePipe } from '@user-service/core/formatting/pipes/forget-me-state.pipe';
import { ForgetMeValidationPipe } from '@user-service/core/formatting/pipes/forget-me-validation.pipe';
import { ForgetMeRequest, ForgetMeStamp } from '@user-service/core/model/forget-me.model';
import { ForgetMeRequestLookup } from '@user-service/core/query/forget-me-request.lookup';
import { ForgetMeRequestService } from '@user-service/services/http/forget-me-request.service';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';

@Component({
	templateUrl: './forget-me-request-listing.component.html',
	styleUrls: ['./forget-me-request-listing.component.scss']
})
export class ForgetMeRequestListingComponent extends BaseListingComponent<ForgetMeRequest, ForgetMeRequestLookup> implements OnInit {

	@ViewChild('responseTemplate', { static: true }) responseTemplate: TemplateRef<any>;

	publish = false;
	userSettingsKey = { key: 'ForgetMeRequestUserSettings' };
	propertiesAvailableForOrder: ColumnDefinition[];

	constructor(
		protected router: Router,
		protected route: ActivatedRoute,
		protected uiNotificationService: UiNotificationService,
		protected httpErrorHandlingService: HttpErrorHandlingService,
		protected queryParamsService: QueryParamsService,
		private forgetMeService: ForgetMeRequestService,
		public authService: AuthService,
		private pipeService: PipeService,
		public enumUtils: AppEnumUtils,
		private totpService: TotpService,
		private language: TranslateService,
		private dialog: MatDialog,
		private dataTableHeaderFormattingService: DataTableHeaderFormattingService,
	) {
		super(router, route, uiNotificationService, httpErrorHandlingService, queryParamsService);
		// Lookup setup
		// Default lookup values are defined in the user settings class.
		this.lookup = this.initializeLookup();
	}

	ngOnInit() {
		super.ngOnInit();
	}

	protected initializeLookup(): ForgetMeRequestLookup {
		const lookup = new ForgetMeRequestLookup();
		lookup.metadata = { countAll: true };
		lookup.page = { offset: 0, size: this.ITEMS_PER_PAGE };
		lookup.isActive = [IsActive.Active];
		lookup.order = { items: [this.toDescSortField(nameof<ForgetMeRequest>(x => x.createdAt))] };
		this.updateOrderUiFields(lookup.order);

		lookup.project = {
			fields: [
				nameof<ForgetMeRequest>(x => x.id),
				nameof<ForgetMeRequest>(x => x.user),
				nameof<ForgetMeRequest>(x => x.user.id),
				nameof<ForgetMeRequest>(x => x.isValidated),
				nameof<ForgetMeRequest>(x => x.expiresAt),
				nameof<ForgetMeRequest>(x => x.createdAt),
				nameof<ForgetMeRequest>(x => x.state),
				nameof<ForgetMeRequest>(x => x.hash),
				nameof<ForgetMeRequest>(x => x.isActive)
			]
		};

		return lookup;
	}

	protected setupColumns() {
		this.gridColumns.push(...[{
			prop: nameof<ForgetMeRequest>(x => x.user.name),
			languageName: 'USER-SERVICE.FORGET-ME-REQUEST-LISTING.FIELDS.USER'
		}, {
			languageName: 'USER-SERVICE.FORGET-ME-REQUEST-LISTING.FIELDS.IS-ACTIVE',
			sortable: true,
			prop: nameof<ForgetMeRequest>(x => x.isActive),
			pipe: this.pipeService.getPipe<IsActiveTypePipe>(IsActiveTypePipe)
		}, {
			languageName: 'USER-SERVICE.FORGET-ME-REQUEST-LISTING.FIELDS.IS-VALIDATED',
			sortable: true,
			prop: nameof<ForgetMeRequest>(x => x.isValidated),
			pipe: this.pipeService.getPipe<ForgetMeValidationPipe>(ForgetMeValidationPipe)
		}, {
			languageName: 'USER-SERVICE.FORGET-ME-REQUEST-LISTING.FIELDS.STATE',
			sortable: true,
			prop: nameof<ForgetMeRequest>(x => x.state),
			pipe: this.pipeService.getPipe<ForgetMeStatePipe>(ForgetMeStatePipe)
		}, {
			languageName: 'USER-SERVICE.FORGET-ME-REQUEST-LISTING.FIELDS.CREATED-AT',
			sortable: true,
			prop: nameof<ForgetMeRequest>(x => x.createdAt),
			pipe: this.dataTableHeaderFormattingService.getDataTableDateTimeFormatPipe().withFormat('short')
		}, {
			languageName: 'USER-SERVICE.FORGET-ME-REQUEST-LISTING.FIELDS.EXPIRES-AT',
			sortable: true,
			prop: nameof<ForgetMeRequest>(x => x.expiresAt),
			pipe: this.dataTableHeaderFormattingService.getDataTableDateTimeFormatPipe().withFormat('short')
		}
		]);

		if (this.authService.hasUserServicePermission(UserServicePermission.StampForgetMeRequest)) {
			this.gridColumns.push({
				languageName: 'USER-SERVICE.FORGET-ME-REQUEST-LISTING.FIELDS.RESPONSE',
				cellTemplate: this.responseTemplate,
				alwaysShown: true
			});
		}
		this.propertiesAvailableForOrder = this.gridColumns.filter(x => x.sortable);
	}

	//
	// Listing Component functions
	//
	onColumnsChanged(event: ColumnsChangedEvent) {
		this.onColumnsChangedInternal(event.properties.map(x => x.toString()));
	}

	private onColumnsChangedInternal(columns: string[]) {
		// Here are defined the projection fields that always requested from the api.
		this.lookup.project = {
			fields: [
				nameof<ForgetMeRequest>(x => x.id),
				nameof<ForgetMeRequest>(x => x.user.id),
				nameof<ForgetMeRequest>(x => x.state),
				nameof<ForgetMeRequest>(x => x.isValidated),
				...columns
			]
		};
		this.onPageLoad({ offset: 0 } as PageLoadEvent);
	}

	protected loadListing(): Observable<QueryResult<ForgetMeRequest>> {

		return this.forgetMeService.query(this.lookup);
	}

	private refreshPage() {
		this.onPageLoad({ offset: 0 } as PageLoadEvent);
	}

	canApproveOrDeclineRequest(request: ForgetMeRequest): boolean {
		return request.isValidated === ForgetMeRequestValidation.Validated && request.state === ForgetMeRequestState.Pending;
	}

	approveRequest(request: ForgetMeRequest) {
		const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
			data: {
				message: this.language.instant('USER-SERVICE.FORGET-ME-REQUEST-LISTING.APPROVE-CONFIRMATION-MESSAGE'),
				confirmButton: this.language.instant('COMMONS.CONFIRMATION-DIALOG.ACTIONS.CONFIRM'),
				cancelButton: this.language.instant('COMMONS.CONFIRMATION-DIALOG.ACTIONS.CANCEL')
			}
		});
		dialogRef.afterClosed().pipe(takeUntil(this._destroyed)).subscribe(result => {
			if (result) {
				this.totpService.askForTotpIfAvailable((totp: string) => {
					const item: ForgetMeStamp = {
						id: request.id,
						state: ForgetMeRequestState.Approved
					};
					this.forgetMeService.stamp(item, totp)
						.pipe(takeUntil(this._destroyed))
						.subscribe(
							complete => this.onActionCallbackSuccess(),
							error => this.onCallbackError(error)
						);
				});
			}
		});
	}

	declineRequest(request: ForgetMeRequest) {
		const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
			data: {
				message: this.language.instant('USER-SERVICE.FORGET-ME-REQUEST-LISTING.DECLINE-CONFIRMATION-MESSAGE'),
				confirmButton: this.language.instant('COMMONS.CONFIRMATION-DIALOG.ACTIONS.CONFIRM'),
				cancelButton: this.language.instant('COMMONS.CONFIRMATION-DIALOG.ACTIONS.CANCEL')
			}
		});
		dialogRef.afterClosed().pipe(takeUntil(this._destroyed)).subscribe(result => {
			if (result) {
				this.totpService.askForTotpIfAvailable((totp: string) => {
					const item: ForgetMeStamp = {
						id: request.id,
						state: ForgetMeRequestState.Denied
					};
					this.forgetMeService.stamp(item, totp)
						.pipe(takeUntil(this._destroyed))
						.subscribe(
							complete => this.onActionCallbackSuccess(),
							error => this.onCallbackError(error)
						);
				});
			}
		});
	}

	private onActionCallbackSuccess(): void {
		this.refreshPage();
	}
}
