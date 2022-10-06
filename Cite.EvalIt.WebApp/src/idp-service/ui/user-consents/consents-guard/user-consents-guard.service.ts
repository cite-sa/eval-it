import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '@app/core/services/ui/auth.service';
import { BaseService } from '@common/base/base.service';
import { Guid } from '@common/types/guid';
import { ConsentResponse } from '@idp-service/core/enum/consent-response.enum';
import { Consent, UserConsent } from '@idp-service/core/model/consent.model';
import { IdpServiceUser } from '@idp-service/core/model/user.model';
import { ConsentService } from '@idp-service/services/http/consent.service';
import { ConsentsGuardDialogComponent } from '@idp-service/ui/user-consents/consents-guard/consents-dialog/consents-guard-dialog.component';
import { Observable } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';

@Injectable()
export class UserConsentsGuardService extends BaseService {

	constructor(
		private dialog: MatDialog,
		private consentService: ConsentService,
		private authService: AuthService
	) { super(); }

	checkConsents(requirements: Guid[], callback: (accepted: boolean) => void) {
		this.areAllRequirementConsentsAccepted(requirements,
			(accepted: boolean) => {
				callback(accepted);
			}
		).pipe(
			takeUntil(this._destroyed)).subscribe(areAllRequirementConsentsAccepted => {
				if (areAllRequirementConsentsAccepted) {
					callback(true); //Further consents not required.
				}
			});
	}

	areAllRequirementConsentsAccepted(requirements: Guid[], callback: (accepted: boolean) => void): Observable<boolean> {
		return this.consentService.getCurrent(this.authService.userId(),
			[
				nameof<UserConsent>(x => x.user) + '.' + nameof<IdpServiceUser>(x => x.id),
				nameof<UserConsent>(x => x.consent) + '.' + nameof<Consent>(x => x.id),
				nameof<UserConsent>(x => x.response),
				nameof<UserConsent>(x => x.createdAt),
				nameof<UserConsent>(x => x.hash)
			])
			.pipe(
				takeUntil(this._destroyed),
				map(x => {
					const alreadyAcceptedConsentIds = x.filter(y => y.response === ConsentResponse.Allow).filter(y => requirements.some(z => z.equals(y.consent.id))).map(y => y.consent.id);
					const needToBeAccepted = requirements.filter(y => !alreadyAcceptedConsentIds.some(z => y.equals(z)));

					if (needToBeAccepted.length > 0) {
						const dialogRef = this.dialog.open(ConsentsGuardDialogComponent, {
							maxWidth: '60%',
							data: {
								requirements: requirements,
							}
						});
						dialogRef.afterClosed().pipe(takeUntil(this._destroyed)).subscribe(result => {
							callback(result);
						});
					}
					return needToBeAccepted.length === 0;
				}),
			);
	}
}
