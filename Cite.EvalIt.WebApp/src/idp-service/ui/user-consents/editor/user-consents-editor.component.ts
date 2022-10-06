import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { AuthService } from '@app/core/services/ui/auth.service';
import { BaseComponent } from '@common/base/base.component';
import { Guid } from '@common/types/guid';
import { ConsentKind } from '@idp-service/core/enum/consent-kind.enum';
import { ConsentResponse } from '@idp-service/core/enum/consent-response.enum';
import { Consent, UserConsent } from '@idp-service/core/model/consent.model';
import { IdpServiceUser } from '@idp-service/core/model/user.model';
import { ConsentService } from '@idp-service/services/http/consent.service';
import { takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';

@Component({
	selector: 'app-user-consents-editor',
	templateUrl: './user-consents-editor.component.html',
	styleUrls: ['./user-consents-editor.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class UserConsentsEditorComponent extends BaseComponent implements OnInit {

	_availableConsents: Consent[] = [];
	_consentSelections: ConsentSelection[] = [];
	consentKindEnum = ConsentKind;
	@Input() showAwareness: boolean = true;
	@Input() lastConsented: number;
	@Input() requirements: Guid[];
	@Output() consentsValidity: EventEmitter<ConsentValidity> = new EventEmitter<ConsentValidity>();

	constructor(
		private authService: AuthService,
		private consentService: ConsentService
	) {
		super();
	}

	ngOnInit() {

		this.consentService.query(
			[
				nameof<Consent>(x => x.id),
				nameof<Consent>(x => x.title),
				nameof<Consent>(x => x.description),
				nameof<Consent>(x => x.kind),
				nameof<Consent>(x => x.requestAt),
				nameof<Consent>(x => x.effectedBy)
			])
			.pipe(takeUntil(this._destroyed))
			.subscribe(queryResult => {

				if (this.lastConsented !== undefined && this.lastConsented !== NaN && this.lastConsented > queryResult.lastRequested) {
					this.consentsValidity.emit({
						consentNotRequired: true
					});
					return;
				}

				this._availableConsents = queryResult.items;
				if (this.requirements && this.requirements.length > 0) { this._availableConsents = this._availableConsents.filter(x => this.requirements.some(y => y.equals(x.id))); }
				const userId = this.authService.userId();
				if (userId) {
					this.consentService.getCurrent(userId,
						[
							nameof<UserConsent>(x => x.user) + '.' + nameof<IdpServiceUser>(x => x.id),
							nameof<UserConsent>(x => x.consent) + '.' + nameof<Consent>(x => x.id),
							nameof<UserConsent>(x => x.response),
							nameof<UserConsent>(x => x.createdAt),
							nameof<UserConsent>(x => x.hash)
						])
						.pipe(takeUntil(this._destroyed))
						.subscribe(currentConsents => {
							currentConsents.forEach(element => {
								if (this._availableConsents.filter(availableConsent => availableConsent.id === element.consent.id)[0]) {
									const consentSelection: ConsentSelection = {
										consentId: element.consent.id,
										response: element.response,
									};
									this._consentSelections.push(consentSelection);
								}
							});
							this.emitConsentSelections();
						});
				} else {
					this.emitConsentSelections();
				}
			});
	}


	public _isSelected(consent: Consent): boolean {
		if (consent.kind === ConsentKind.System) { return true; }
		const userConsent = this._consentSelections.filter(x => x.consentId === consent.id)[0];
		return userConsent ? userConsent.response === ConsentResponse.Allow : false;
	}

	public _selectionChange(slideToggleChange: MatSlideToggleChange, consent: Consent) {
		if (consent.kind === ConsentKind.System) { return true; }
		let userConsent = this._consentSelections.filter(x => x.consentId === consent.id)[0];
		if (!userConsent) {
			userConsent = {
				consentId: consent.id
			};
			this._consentSelections.push(userConsent);
		}
		userConsent.response = slideToggleChange.checked ? ConsentResponse.Allow : ConsentResponse.Deny;

		this.emitConsentSelections();
	}

	private emitConsentSelections() {
		this.consentsValidity.emit({
			consentsAreAccepted: this._areRequiredConsentsAccepted(),
			userConsents: this._consentSelections
		});
	}
	private _areRequiredConsentsAccepted(): boolean {
		let valid = true;
		if (this.requirements && this.requirements.length > 0) {
			const mandatoryConsents = this._availableConsents;
			mandatoryConsents.forEach(element => {
				const consent = this._consentSelections.filter(x => x.consentId === element.id)[0];
				if (!consent || consent.response === ConsentResponse.Deny) { valid = false; }
			});
		} else {
			const mandatoryConsents = this._availableConsents.filter(x => x.kind === ConsentKind.Mandatory);
			mandatoryConsents.forEach(element => {
				const consent = this._consentSelections.filter(x => x.consentId === element.id)[0];
				if (!consent || consent.response === ConsentResponse.Deny) { valid = false; }
			});
		}
		return valid;
	}
}

export interface ConsentValidity {
	consentNotRequired?: boolean;
	consentsAreAccepted?: boolean;
	userConsents?: ConsentSelection[];
}

export interface ConsentSelection {
	consentId: Guid;
	response?: ConsentResponse;
}
