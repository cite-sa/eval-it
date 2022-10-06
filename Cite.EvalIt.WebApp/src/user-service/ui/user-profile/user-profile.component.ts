import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { AuthService } from '@app/core/services/ui/auth.service';
import { BaseComponent } from '@common/base/base.component';
import { AuthProviderService } from '@idp-service/services/auth-provider.service';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-user-profile',
	templateUrl: './user-profile.component.html',
	styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent extends BaseComponent implements OnInit {

	totpEnabled = false;
	selectedTabIndex = 0;
	requestedTab: string;

	constructor(
		public authService: AuthService,
		private route: ActivatedRoute,
		private authProviderService: AuthProviderService
	) {
		super();
	}

	ngOnInit(): void {
		this.route.paramMap.pipe(takeUntil(this._destroyed)).subscribe((paramMap: ParamMap) => {
			const tab = paramMap.get('tab');
			if (tab != null) { this.requestedTab = tab; }
		});

		this.authProviderService.getAuthenticationProviderManager()
			.pipe(takeUntil(this._destroyed))
			.subscribe(x => {
				this.totpEnabled = x.supportsTotp();
				this.setRequestedTab();
			});
	}

	setRequestedTab() {
		if (this.requestedTab === 'profile') { this.selectedTabIndex = 0; }
		else if (this.requestedTab === 'personal') { this.selectedTabIndex = 1; }
		else if (this.requestedTab === 'contact-info') { this.selectedTabIndex = 2; }
		else if (this.requestedTab === 'notifier-list') { this.selectedTabIndex = 3; }
		else if (this.requestedTab === 'user-consents') { this.selectedTabIndex = 4; }
		else if (this.requestedTab === 'credentials') { this.selectedTabIndex = 5; }
		else if (this.requestedTab === 'totp') { this.selectedTabIndex = 6; }
		else if (this.requestedTab === 'forget-me') { this.selectedTabIndex = this.totpEnabled ? 7 : 6; }
		else if (this.requestedTab === 'what-you-know-about-me') { this.selectedTabIndex = this.totpEnabled ? 8 : 7; }
	}
}
