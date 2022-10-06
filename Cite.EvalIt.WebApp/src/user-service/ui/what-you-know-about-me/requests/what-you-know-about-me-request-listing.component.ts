import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { IsActive } from '@app/core/enum/is-active.enum';
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
import { TotpService } from '@idp-service/ui/totp/totp.service';
import { TranslateService } from '@ngx-translate/core';
import { UserServicePermission } from '@user-service/core/enum/permission.enum';
import { WhatYouKnowAboutMeRequestState } from '@user-service/core/enum/what-you-know-about-me-request-state.enum';
import { WhatYouKnowAboutMeRequestValidation } from '@user-service/core/enum/what-you-know-about-me-request-validation.enum';
import { WhatYouKnowAboutMeStatePipe } from '@user-service/core/formatting/pipes/what-you-know-about-me-state.pipe';
import { WhatYouKnowAboutMeValidationPipe } from '@user-service/core/formatting/pipes/what-you-know-about-me-validation.pipe';
import { UserServiceUser } from '@user-service/core/model/user.model';
import { WhatYouKnowAboutMeRequest, WhatYouKnowAboutMeStamp } from '@user-service/core/model/what-you-know-about-me.model';
import { WhatYouKnowAboutMeRequestLookup } from '@user-service/core/query/what-you-know-about-me-request.lookup';
import { WhatYouKnowAboutMeService } from '@user-service/services/http/what-you-know-about-me.service';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';

@Component({
	templateUrl: './what-you-know-about-me-request-listing.component.html',
	styleUrls: ['./what-you-know-about-me-request-listing.component.scss']
})
export class WhatYouKnowAboutMeRequestListingComponent extends BaseListingComponent<WhatYouKnowAboutMeRequest, WhatYouKnowAboutMeRequestLookup> implements OnInit {

	@ViewChild('responseTemplate', { static: true }) responseTemplate: TemplateRef<any>;

	publish = false;
	userSettingsKey = { key: 'WhatYouKnowAboutMeRequestUserSettings' };
	propertiesAvailableForOrder: ColumnDefinition[];

	constructor(
		protected router: Router,
		protected route: ActivatedRoute,
		protected uiNotificationService: UiNotificationService,
		protected httpErrorHandlingService: HttpErrorHandlingService,
		protected queryParamsService: QueryParamsService,
		private whatYouKnowAboutMeService: WhatYouKnowAboutMeService,
		public authService: AuthService,
		private dataTableHeaderFormattingService: DataTableHeaderFormattingService,
		private pipeService: PipeService,
		private totpService: TotpService,
		public enumUtils: AppEnumUtils,
		private language: TranslateService,
		private dialog: MatDialog
	) {
		super(router, route, uiNotificationService, httpErrorHandlingService, queryParamsService);
		// Lookup setup
		// Default lookup values are defined in the user settings class.
		this.lookup = this.initializeLookup();
	}

	ngOnInit() {
		super.ngOnInit();
	}

	protected initializeLookup(): WhatYouKnowAboutMeRequestLookup {
		const lookup = new WhatYouKnowAboutMeRequestLookup();
		lookup.metadata = { countAll: true };
		lookup.page = { offset: 0, size: this.ITEMS_PER_PAGE };
		lookup.isActive = [IsActive.Active];
		lookup.order = { items: [this.toDescSortField(nameof<WhatYouKnowAboutMeRequest>(x => x.createdAt))] };
		this.updateOrderUiFields(lookup.order);

		lookup.project = {
			fields: [
				nameof<WhatYouKnowAboutMeRequest>(x => x.id),
				nameof<WhatYouKnowAboutMeRequest>(x => x.user) + '.' + nameof<UserServiceUser>(x => x.id),
				nameof<WhatYouKnowAboutMeRequest>(x => x.state),
				nameof<WhatYouKnowAboutMeRequest>(x => x.isValidated),
				nameof<WhatYouKnowAboutMeRequest>(x => x.updatedAt),
				nameof<WhatYouKnowAboutMeRequest>(x => x.createdAt),
				nameof<WhatYouKnowAboutMeRequest>(x => x.hash),
				nameof<WhatYouKnowAboutMeRequest>(x => x.isActive)
			]
		};

		return lookup;
	}

	protected setupColumns() {
		this.gridColumns.push(...[{
			prop: nameof<WhatYouKnowAboutMeRequest>(x => x.user) + '.' + nameof<UserServiceUser>(x => x.name),
			languageName: 'USER-SERVICE.WHAT-YOU-KNOW-ABOUT-ME-REQUEST-LISTING.FIELDS.USER'
		}, {
			languageName: 'USER-SERVICE.WHAT-YOU-KNOW-ABOUT-ME-REQUEST-LISTING.FIELDS.IS-ACTIVE',
			sortable: true,
			prop: nameof<WhatYouKnowAboutMeRequest>(x => x.isActive),
			pipe: this.pipeService.getPipe<IsActiveTypePipe>(IsActiveTypePipe)
		}, {
			languageName: 'USER-SERVICE.WHAT-YOU-KNOW-ABOUT-ME-REQUEST-LISTING.FIELDS.IS-VALIDATED',
			sortable: true,
			prop: nameof<WhatYouKnowAboutMeRequest>(x => x.isValidated),
			pipe: this.pipeService.getPipe<WhatYouKnowAboutMeValidationPipe>(WhatYouKnowAboutMeValidationPipe)
		}, {
			languageName: 'USER-SERVICE.WHAT-YOU-KNOW-ABOUT-ME-REQUEST-LISTING.FIELDS.STATE',
			sortable: true,
			prop: nameof<WhatYouKnowAboutMeRequest>(x => x.state),
			pipe: this.pipeService.getPipe<WhatYouKnowAboutMeStatePipe>(WhatYouKnowAboutMeStatePipe)
		}, {
			languageName: 'USER-SERVICE.WHAT-YOU-KNOW-ABOUT-ME-REQUEST-LISTING.FIELDS.CREATED-AT',
			sortable: true,
			prop: nameof<WhatYouKnowAboutMeRequest>(x => x.createdAt),
			pipe: this.dataTableHeaderFormattingService.getDataTableDateTimeFormatPipe().withFormat('short')
		}, {
			languageName: 'USER-SERVICE.WHAT-YOU-KNOW-ABOUT-ME-REQUEST-LISTING.FIELDS.EXPIRES-AT',
			sortable: true,
			prop: nameof<WhatYouKnowAboutMeRequest>(x => x.expiresAt),
			pipe: this.dataTableHeaderFormattingService.getDataTableDateTimeFormatPipe().withFormat('short')
		}
		]);

		if (this.authService.hasUserServicePermission(UserServicePermission.StampWhatYouKnowAboutMeRequest)) {
			this.gridColumns.push({
				languageName: 'USER-SERVICE.WHAT-YOU-KNOW-ABOUT-ME-REQUEST-LISTING.FIELDS.RESPONSE',
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
				nameof<WhatYouKnowAboutMeRequest>(x => x.id),
				nameof<WhatYouKnowAboutMeRequest>(x => x.user) + '.' + nameof<UserServiceUser>(x => x.id),
				nameof<WhatYouKnowAboutMeRequest>(x => x.state),
				nameof<WhatYouKnowAboutMeRequest>(x => x.isValidated),
				...columns]
		};
		this.onPageLoad({ offset: 0 } as PageLoadEvent);
	}

	protected loadListing() : Observable<QueryResult<WhatYouKnowAboutMeRequest>> {
		return this.whatYouKnowAboutMeService.query(this.lookup);
	}

	private refreshPage() {
		this.onPageLoad({ offset: 0 } as PageLoadEvent);
	}

	canApproveOrDeclineRequest(request: WhatYouKnowAboutMeRequest): boolean {
		return request.isValidated === WhatYouKnowAboutMeRequestValidation.Validated && request.state === WhatYouKnowAboutMeRequestState.Pending;
	}

	approveRequest(request: WhatYouKnowAboutMeRequest) {
		const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
			data: {
				message: this.language.instant('USER-SERVICE.WHAT-YOU-KNOW-ABOUT-ME-REQUEST-LISTING.APPROVE-CONFIRMATION-MESSAGE'),
				confirmButton: this.language.instant('COMMONS.CONFIRMATION-DIALOG.ACTIONS.CONFIRM'),
				cancelButton: this.language.instant('COMMONS.CONFIRMATION-DIALOG.ACTIONS.CANCEL')
			}
		});
		dialogRef.afterClosed().pipe(takeUntil(this._destroyed)).subscribe(result => {
			if (result) {
				this.totpService.askForTotpIfAvailable((totp: string) => {
					const item: WhatYouKnowAboutMeStamp = {
						id: request.id,
						state: WhatYouKnowAboutMeRequestState.Approved
					};
					this.whatYouKnowAboutMeService.stamp(item, totp)
						.pipe(takeUntil(this._destroyed))
						.subscribe(
							complete => this.onActionCallbackSuccess(),
							error => this.onCallbackError(error)
						);
				});
			}
		});
	}

	declineRequest(request: WhatYouKnowAboutMeRequest) {
		const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
			data: {
				message: this.language.instant('USER-SERVICE.WHAT-YOU-KNOW-ABOUT-ME-REQUEST-LISTING.DECLINE-CONFIRMATION-MESSAGE'),
				confirmButton: this.language.instant('COMMONS.CONFIRMATION-DIALOG.ACTIONS.CONFIRM'),
				cancelButton: this.language.instant('COMMONS.CONFIRMATION-DIALOG.ACTIONS.CANCEL')
			}
		});
		dialogRef.afterClosed().pipe(takeUntil(this._destroyed)).subscribe(result => {
			if (result) {
				this.totpService.askForTotpIfAvailable((totp: string) => {
					const item: WhatYouKnowAboutMeStamp = {
						id: request.id,
						state: WhatYouKnowAboutMeRequestState.Denied
					};
					this.whatYouKnowAboutMeService.stamp(item, totp)
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
