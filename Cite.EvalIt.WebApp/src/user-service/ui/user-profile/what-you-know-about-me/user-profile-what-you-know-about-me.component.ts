
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BaseComponent } from '@common/base/base.component';
import { PipeService } from '@common/formatting/pipe.service';
import { DateTimeFormatPipe } from '@common/formatting/pipes/date-time-format.pipe';
import { ConfirmationDialogComponent } from '@common/modules/confirmation-dialog/confirmation-dialog.component';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { TotpService } from '@idp-service/ui/totp/totp.service';
import { TranslateService } from '@ngx-translate/core';
import { IsActive } from '@user-service/core/enum/is-active.enum';
import { WhatYouKnowAboutMeRequestState } from '@user-service/core/enum/what-you-know-about-me-request-state.enum';
import { WhatYouKnowAboutMeRequestValidation } from '@user-service/core/enum/what-you-know-about-me-request-validation.enum';
import { UserServiceEnumUtils } from '@user-service/core/formatting/enum-utils.service';
import { StorageFile } from '@user-service/core/model/storage-file.model';
import { WhatYouKnowAboutMeRequest } from '@user-service/core/model/what-you-know-about-me.model';
import { WhatYouKnowAboutMeRequestLookup } from '@user-service/core/query/what-you-know-about-me-request.lookup';
import { WhatYouKnowAboutMeService } from '@user-service/services/http/what-you-know-about-me.service';
import * as FileSaver from 'file-saver';
import * as moment from 'moment';
import { takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';

@Component({
	selector: 'app-user-profile-what-you-know-about-me',
	templateUrl: './user-profile-what-you-know-about-me.component.html',
	styleUrls: ['./user-profile-what-you-know-about-me.component.scss']
})
export class UserProfileWhatYouKnowAboutMeEditorComponent extends BaseComponent implements OnInit {

	returnUrl: string;
	requests: WhatYouKnowAboutMeRequest[];
	nextRequest: Date;

	constructor(
		private dialog: MatDialog,
		private whatYouKnowAboutMeService: WhatYouKnowAboutMeService,
		private route: ActivatedRoute,
		private router: Router,
		private language: TranslateService,
		private enumUtils: UserServiceEnumUtils,
		private uiNotificationService: UiNotificationService,
		private httpErrorHandlingService: HttpErrorHandlingService,
		private pipeService: PipeService,
		private totpService: TotpService
	) {
		super();
	}

	ngOnInit(): void {

		this.route.queryParamMap.pipe(takeUntil(this._destroyed)).subscribe((paramMap: ParamMap) => {
			this.returnUrl = paramMap.get('returnUrl') || '/';
		});

		this.getWhatYouKnowAboutMeRequests();
	}

	private getWhatYouKnowAboutMeRequests() {
		const lookup: WhatYouKnowAboutMeRequestLookup = new WhatYouKnowAboutMeRequestLookup();
		lookup.isActive = [IsActive.Active];
		lookup.order = { items: ['-' + nameof<WhatYouKnowAboutMeRequest>(x => x.createdAt)] };
		lookup.project = {
			fields: [
				nameof<WhatYouKnowAboutMeRequest>(x => x.id),
				nameof<WhatYouKnowAboutMeRequest>(x => x.isValidated),
				nameof<WhatYouKnowAboutMeRequest>(x => x.state),
				nameof<WhatYouKnowAboutMeRequest>(x => x.hash),
				nameof<WhatYouKnowAboutMeRequest>(x => x.createdAt),
				nameof<WhatYouKnowAboutMeRequest>(x => x.expiresAt),
				nameof<WhatYouKnowAboutMeRequest>(x => x.storageFile) + '.' + nameof<StorageFile>(x => x.id),
				nameof<WhatYouKnowAboutMeRequest>(x => x.storageFile) + '.' + nameof<StorageFile>(x => x.purgedAt),
			]
		};
		this.whatYouKnowAboutMeService.queryMine(lookup)
			.pipe(takeUntil(this._destroyed))
			.subscribe(
				data => {
					this.requests = data.items;
				},
				error => this.onCallbackError(error)
			);

		this.whatYouKnowAboutMeService.next()
			.pipe(takeUntil(this._destroyed))
			.subscribe(
				data => this.nextRequest = data,
				error => this.onCallbackError(error)
			);
	}

	requestEnabled(): boolean {
		return this.nextRequest && moment.utc(this.nextRequest) < moment.utc();
	}

	canCancelRequest(request: WhatYouKnowAboutMeRequest): boolean {
		return request && request.state === WhatYouKnowAboutMeRequestState.Pending;
	}

	canDownloadFile(request: WhatYouKnowAboutMeRequest): boolean {
		return request && request.storageFile && request.storageFile.purgedAt === undefined && request.state === WhatYouKnowAboutMeRequestState.Completed;
	}

	downloadFile(request: WhatYouKnowAboutMeRequest) {
		this.totpService.askForTotpIfAvailable((totp: string) => {
			this.whatYouKnowAboutMeService.download(request.id, totp).subscribe(x => {
				FileSaver.saveAs(x, 'user-data-' + this.pipeService.getPipe<DateTimeFormatPipe>(DateTimeFormatPipe).transform(moment.utc(), 'M-d-yy-hh-mm') + '.zip');
			});
		});
	}

	deleteRequest(request: WhatYouKnowAboutMeRequest) {
		const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
			data: {
				message: this.language.instant('USER-SERVICE.USER-PROFILE-COMPONENT.WHAT-YOU-KNOW-ABOUT-ME.CANCEL-REQUEST-CONFIRMATION-MESSAGE'),
				confirmButton: this.language.instant('COMMONS.CONFIRMATION-DIALOG.ACTIONS.CONFIRM'),
				cancelButton: this.language.instant('COMMONS.CONFIRMATION-DIALOG.ACTIONS.CANCEL')
			}
		});
		dialogRef.afterClosed().pipe(takeUntil(this._destroyed)).subscribe(result => {
			if (result) {
				this.whatYouKnowAboutMeService.delete(request.id)
					.pipe(takeUntil(this._destroyed))
					.subscribe(
						complete => this.onCallbackSuccess(),
						error => this.onCallbackError(error)
					);
			}
		});
	}

	requestWhatYouKnowAboutMe() {
		const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
			data: {
				message: this.language.instant('USER-SERVICE.USER-PROFILE-COMPONENT.WHAT-YOU-KNOW-ABOUT-ME.CONFIRMATION-MESSAGE'),
				confirmButton: this.language.instant('COMMONS.CONFIRMATION-DIALOG.ACTIONS.CONFIRM'),
				cancelButton: this.language.instant('COMMONS.CONFIRMATION-DIALOG.ACTIONS.CANCEL')
			}
		});
		dialogRef.afterClosed().pipe(takeUntil(this._destroyed)).subscribe(result => {
			if (result) {
				this.totpService.askForTotpIfAvailable((totp: string) => {
					this.whatYouKnowAboutMeService.request(totp)
						.pipe(takeUntil(this._destroyed))
						.subscribe(
							complete => this.onCallbackSuccess(),
							error => this.onCallbackError(error)
						);
				});
			}
		});
	}

	canRequestWhatYouKnowAboutMe(): boolean {
		return this.requests &&
			this.requests.filter(x =>
				x.state !== WhatYouKnowAboutMeRequestState.Completed &&
				x.state !== WhatYouKnowAboutMeRequestState.Denied).length === 0;
	}

	getStateText(request: WhatYouKnowAboutMeRequest) {
		if (request.isValidated === WhatYouKnowAboutMeRequestValidation.Pending) { return this.language.instant('USER-SERVICE.USER-PROFILE-COMPONENT.WHAT-YOU-KNOW-ABOUT-ME.STATE.PENDING-USER-CONFIRMATION'); }
		if (request.state === WhatYouKnowAboutMeRequestState.Pending) { return this.language.instant('USER-SERVICE.USER-PROFILE-COMPONENT.WHAT-YOU-KNOW-ABOUT-ME.STATE.PENDING-ADMIN-APPROVAL'); }
		return this.enumUtils.toWhatYouKnowAboutMeStateString(request.state);
	}

	public cancel(): void {
		this.router.navigate([this.returnUrl]);
	}

	onCallbackSuccess(): void {
		this.getWhatYouKnowAboutMeRequests();
	}

	onCallbackError(errorResponse: HttpErrorResponse) {
		const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
		this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
	}
}
