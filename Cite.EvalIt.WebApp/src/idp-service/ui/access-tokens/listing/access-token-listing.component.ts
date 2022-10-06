import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { AuthService } from '@app/core/services/ui/auth.service';
import { QueryParamsService } from '@app/core/services/ui/query-params.service';
import { BaseListingComponent } from '@common/base/base-listing-component';
import { QueryResult } from '@common/model/query-result';
import { ConfirmationDialogComponent } from '@common/modules/confirmation-dialog/confirmation-dialog.component';
import {  HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { DataTableHeaderFormattingService } from '@common/modules/listing/data-table-header-formatting-service';
import { ColumnDefinition, ColumnsChangedEvent, PageLoadEvent } from '@common/modules/listing/listing.component';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { IdpServicePermission } from '@idp-service/core/enum/permission.enum';
import { PersistedGrantAggregation, PersistedGrantAggregationKey } from '@idp-service/core/model/persisted-grant.model';
import { PersistedGrantLookup } from '@idp-service/core/query/persisted-grant.lookup';
import { TokenService } from '@idp-service/services/http/token.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';

@Component({
	templateUrl: './access-token-listing.component.html',
	styleUrls: ['./access-token-listing.component.scss']
})
export class AccessTokenListingComponent extends BaseListingComponent<PersistedGrantAggregation, PersistedGrantLookup> implements OnInit {

	@ViewChild('deleteColumnTemplate', { static: true }) deleteColumnTemplate: TemplateRef<any>;

	publish = false;
	userSettingsKey = { key: 'AccessTokenListingUserSettings' };
	propertiesAvailableForOrder: ColumnDefinition[];

	constructor(
		protected router: Router,
		protected route: ActivatedRoute,
		protected uiNotificationService: UiNotificationService,
		protected httpErrorHandlingService: HttpErrorHandlingService,
		protected queryParamsService: QueryParamsService,
		private tokenService: TokenService,
		public authService: AuthService,
		public enumUtils: AppEnumUtils,
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

	protected initializeLookup(): PersistedGrantLookup {
		const lookup = new PersistedGrantLookup();
		lookup.metadata = { countAll: true };
		lookup.page = { offset: 0, size: this.ITEMS_PER_PAGE };
		lookup.order = { items: [this.toDescSortField(nameof<PersistedGrantAggregation>(x => x.latestCreatedAt))] };
		this.updateOrderUiFields(lookup.order);

		lookup.project = {
			fields: [
				nameof<PersistedGrantAggregation>(x => x.subjectId),
				nameof<PersistedGrantAggregation>(x => x.clientId),
				nameof<PersistedGrantAggregation>(x => x.type),
				nameof<PersistedGrantAggregation>(x => x.count),
				nameof<PersistedGrantAggregation>(x => x.latestCreatedAt),
				nameof<PersistedGrantAggregation>(x => x.latestExpiresAt),
				nameof<PersistedGrantAggregation>(x => x.userId),
				nameof<PersistedGrantAggregation>(x => x.userName)
			]
		};

		return lookup;
	}

	protected setupColumns() {
		this.gridColumns.push(...[{
			prop: nameof<PersistedGrantAggregation>(x => x.userName),
			sortable: true,
			languageName: 'IDP-SERVICE.ACCESS-TOKEN-LISTING.FIELDS.USERNAME'
		}, {
			prop: nameof<PersistedGrantAggregation>(x => x.clientId),
			sortable: true,
			languageName: 'IDP-SERVICE.ACCESS-TOKEN-LISTING.FIELDS.CLIENT'
		}, {
			prop: nameof<PersistedGrantAggregation>(x => x.type),
			sortable: true,
			languageName: 'IDP-SERVICE.ACCESS-TOKEN-LISTING.FIELDS.TYPE'
		}, {
			prop: nameof<PersistedGrantAggregation>(x => x.latestExpiresAt),
			sortable: true,
			languageName: 'IDP-SERVICE.ACCESS-TOKEN-LISTING.FIELDS.LATEST-EXPIRES-AT',
			pipe: this.dataTableHeaderFormattingService.getDataTableDateTimeFormatPipe('short')
		}, {
			prop: nameof<PersistedGrantAggregation>(x => x.latestCreatedAt),
			sortable: true,
			languageName: 'IDP-SERVICE.ACCESS-TOKEN-LISTING.FIELDS.LATEST-CREATED-AT',
			pipe: this.dataTableHeaderFormattingService.getDataTableDateTimeFormatPipe('short')
		}, {
			prop: nameof<PersistedGrantAggregation>(x => x.count),
			sortable: true,
			languageName: 'IDP-SERVICE.ACCESS-TOKEN-LISTING.FIELDS.COUNT'
		}]);

		if (this.authService.hasIdpServicePermission(IdpServicePermission.DeletePersistedGrant)) {
			this.gridColumns.push({
				languageName: 'IDP-SERVICE.ACCESS-TOKEN-LISTING.FIELDS.ACTION',
				cellTemplate: this.deleteColumnTemplate,
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
				nameof<PersistedGrantAggregation>(x => x.subjectId),
				nameof<PersistedGrantAggregation>(x => x.clientId),
				nameof<PersistedGrantAggregation>(x => x.type),
				...columns
			]
		};
		this.onPageLoad({ offset: 0 } as PageLoadEvent);
	}

	protected loadListing(): Observable<QueryResult<PersistedGrantAggregation>> {
		return this.tokenService.query(this.lookup);
	}
	deleteRow(item: PersistedGrantAggregation) {
		if (item) {
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
					const reqItem: PersistedGrantAggregationKey = {
						subjectId: item.subjectId,
						clientId: item.clientId,
						type: item.type
					};
					this.tokenService.delete(reqItem).pipe(takeUntil(this._destroyed)).subscribe(
						complete => this.onCallbackSuccess(),
						error => this.onCallbackError(error)
					);
				}
			});
		}
	}

	private onCallbackSuccess(): void {
		this.uiNotificationService.snackBarNotification(this.language.instant('COMMONS.SNACK-BAR.SUCCESSFUL-UPDATE'), SnackBarNotificationLevel.Success);
		this.onPageLoad({ offset: 0 } as PageLoadEvent);
	}
}
