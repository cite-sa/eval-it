import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TenantLocator } from 'tenant/core/model/tenant-locator';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { BrokerService } from 'tenant/services/broker-service';
import { BaseComponent } from '@common/base/base.component';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-tenant-selection',
	templateUrl: './tenant-selection.component.html',
	styleUrls: ['./tenant-selection.component.scss']
})
export class TenantSelectionComponent extends BaseComponent implements OnInit {

	returnUrl: string;
	tenant: string;
	errorMessage: string;
	customErrorStateMatcher: ErrorStateMatcher = {
		isErrorState: (control: FormControl | null) => {
			if (control) {
				const hasInteraction = control.dirty || control.touched;
				const isInvalid = control.invalid || this.errorMessage;

				return !!(hasInteraction && isInvalid);
			}

			return false;
		}
	};

	constructor(
		private brokerService: BrokerService,
		private router: Router,
		private route: ActivatedRoute,
		private httpErrorHandlingService: HttpErrorHandlingService,
		private installationConfiguration: InstallationConfigurationService
	) { super(); }

	ngOnInit() {
		this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
	}

	tenantLookup() {
		if (this.tenant && this.tenant.length === 0) { return; }
		this.errorMessage = null;

		this.brokerService.get(this.tenant).pipe(takeUntil(this._destroyed)).subscribe(
			success => this.onSuccess(success),
			error => this.onError(error)
		);
	}

	private onSuccess(tenantLocatorModel: TenantLocator): void {
		if (tenantLocatorModel.infrastructure === this.installationConfiguration.infrastructure) {
			if (this.returnUrl !== '/') {
				this.router.navigate([tenantLocatorModel.tenantCode], { relativeTo: this.route, queryParams: { returnUrl: this.returnUrl } });
			} else {
				this.router.navigate([tenantLocatorModel.tenantCode], { relativeTo: this.route });
			}
		} else {
			window.location.href = tenantLocatorModel.domain + '/t/' + tenantLocatorModel.tenantCode;
		}
	}

	private onError(errorResponse: HttpErrorResponse) {
		const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
		this.errorMessage = error.getMessagesString();
	}
}
