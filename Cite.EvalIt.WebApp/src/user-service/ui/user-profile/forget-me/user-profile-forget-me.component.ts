
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BaseComponent } from '@common/base/base.component';
import { ConfirmationDialogComponent } from '@common/modules/confirmation-dialog/confirmation-dialog.component';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { TranslateService } from '@ngx-translate/core';
import { ForgetMeRequestState } from '@user-service/core/enum/forget-me-request-state.enum';
import { ForgetMeRequestValidation } from '@user-service/core/enum/forget-me-request-validation.enum';
import { IsActive } from '@user-service/core/enum/is-active.enum';
import { UserServiceEnumUtils } from '@user-service/core/formatting/enum-utils.service';
import { ForgetMeRequest } from '@user-service/core/model/forget-me.model';
import { ForgetMeRequestLookup } from '@user-service/core/query/forget-me-request.lookup';
import { ForgetMeRequestService } from '@user-service/services/http/forget-me-request.service';
import * as moment from 'moment';
import { takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';

@Component({
	selector: 'app-user-profile-forget-me',
	templateUrl: './user-profile-forget-me.component.html',
	styleUrls: ['./user-profile-forget-me.component.scss']
})
export class UserProfileForgetMeEditorComponent extends BaseComponent implements OnInit {

	returnUrl: string;
	requests: ForgetMeRequest[];
	nextRequest: Date;

	constructor(
		private dialog: MatDialog,
		private forgetMeService: ForgetMeRequestService,
		private route: ActivatedRoute,
		private router: Router,
		private language: TranslateService,
		private enumUtils: UserServiceEnumUtils,
		private uiNotificationService: UiNotificationService,
		private httpErrorHandlingService: HttpErrorHandlingService,
	) {
		super();
	}

	ngOnInit(): void {

		this.route.queryParamMap.pipe(takeUntil(this._destroyed)).subscribe((paramMap: ParamMap) => {
			this.returnUrl = paramMap.get('returnUrl') || '/';
		});

		this.getForgetMeRequests();
	}

	private getForgetMeRequests() {
		const lookup: ForgetMeRequestLookup = new ForgetMeRequestLookup();
		lookup.isActive = [IsActive.Active];
		lookup.order = { items: ['-' + nameof<ForgetMeRequest>(x => x.createdAt)] };
		lookup.project = {
			fields: [
				nameof<ForgetMeRequest>(x => x.id),
				nameof<ForgetMeRequest>(x => x.isValidated),
				nameof<ForgetMeRequest>(x => x.state),
				nameof<ForgetMeRequest>(x => x.hash),
				nameof<ForgetMeRequest>(x => x.createdAt),
				nameof<ForgetMeRequest>(x => x.expiresAt)
			]
		};
		this.forgetMeService.queryMine(lookup)
			.pipe(takeUntil(this._destroyed))
			.subscribe(
				data => {
					this.requests = data.items;
				},
				error => this.onCallbackError(error)
			);

		this.forgetMeService.next()
			.pipe(takeUntil(this._destroyed))
			.subscribe(
				data => this.nextRequest = data,
				error => this.onCallbackError(error)
			);
	}

	requestEnabled(): boolean {
		return this.nextRequest && moment.utc(this.nextRequest) < moment.utc();
	}

	canCancelRequest(request): boolean {
		return request.state === ForgetMeRequestState.Pending;
	}

	deleteRequest(request: ForgetMeRequest) {
		const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
			data: {
				message: this.language.instant('USER-SERVICE.USER-PROFILE-COMPONENT.FORGET-ME.CANCEL-REQUEST-CONFIRMATION-MESSAGE'),
				confirmButton: this.language.instant('COMMONS.CONFIRMATION-DIALOG.ACTIONS.CONFIRM'),
				cancelButton: this.language.instant('COMMONS.CONFIRMATION-DIALOG.ACTIONS.CANCEL')
			}
		});
		dialogRef.afterClosed().pipe(takeUntil(this._destroyed)).subscribe(result => {
			if (result) {
				this.forgetMeService.delete(request.id)
					.pipe(takeUntil(this._destroyed))
					.subscribe(
						complete => this.onCallbackSuccess(),
						error => this.onCallbackError(error)
					);
			}
		});
	}

	requestForgetMe() {
		const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
			data: {
				message: this.language.instant('USER-SERVICE.USER-PROFILE-COMPONENT.FORGET-ME.CONFIRMATION-MESSAGE'),
				confirmButton: this.language.instant('COMMONS.CONFIRMATION-DIALOG.ACTIONS.CONFIRM'),
				cancelButton: this.language.instant('COMMONS.CONFIRMATION-DIALOG.ACTIONS.CANCEL')
			}
		});
		dialogRef.afterClosed().pipe(takeUntil(this._destroyed)).subscribe(result => {
			if (result) {
				this.forgetMeService.request()
					.pipe(takeUntil(this._destroyed))
					.subscribe(
						complete => this.onCallbackSuccess(),
						error => this.onCallbackError(error)
					);
			}
		});
	}

	canRequestToBeForgotten(): boolean {
		return this.requests && this.requests.filter(x => x.state !== ForgetMeRequestState.Completed && x.state !== ForgetMeRequestState.Denied).length === 0;
	}

	getStateText(request: ForgetMeRequest) {
		if (request.isValidated === ForgetMeRequestValidation.Pending) { return this.language.instant('USER-SERVICE.USER-PROFILE-COMPONENT.FORGET-ME.STATE.PENDING-USER-CONFIRMATION'); }
		if (request.state === ForgetMeRequestState.Pending) { return this.language.instant('USER-SERVICE.USER-PROFILE-COMPONENT.FORGET-ME.STATE.PENDING-ADMIN-APPROVAL'); }
		return this.enumUtils.toForgetMeStateString(request.state);
	}

	public cancel(): void {
		this.router.navigate([this.returnUrl]);
	}

	onCallbackSuccess(): void {
		this.getForgetMeRequests();
	}

	onCallbackError(errorResponse: HttpErrorResponse) {
		const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
		this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
	}
}
