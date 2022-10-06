import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { LanguageType } from '@app/core/enum/language-type.enum';
import { ThemeType } from '@app/core/enum/theme-type.enum';
import { AuthService } from '@app/core/services/ui/auth.service';
import { ProgressIndicationService } from '@app/core/services/ui/progress-indication.service';
import { ThemingService } from '@app/core/services/ui/theming.service';
import { BaseComponent } from '@common/base/base.component';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { InAppNotificationService } from '@notification-service/services/http/inapp-notification.service';
import { InAppNotificationListingDialogComponent } from '@notification-service/ui/inapp-notification/listing-dialog/inapp-notification-listing-dialog.component';
import { UserService } from '@user-service/services/http/user.service';
import { LanguageService } from '@user-service/services/language.service';
import { timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-navigation',
	templateUrl: './navigation.component.html',
	styleUrls: ['./navigation.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class NavigationComponent extends BaseComponent implements OnInit {
	progressIndication = false;
	themeTypes = ThemeType;
	languageTypes = LanguageType;
	inAppNotificationDialog: MatDialogRef<InAppNotificationListingDialogComponent> = null;
	inAppNotificationCount = 0;

	constructor(
		private installationConfiguration: InstallationConfigurationService,
		public authService: AuthService,
		private dialog: MatDialog,
		public router: Router,
		private route: ActivatedRoute,
		public themingService: ThemingService,
		public languageService: LanguageService,
		private progressIndicationService: ProgressIndicationService,
		private inappNotificationService: InAppNotificationService,
		private userService: UserService
	) {
		super();
	}

	ngOnInit() {
		this.progressIndicationService.getProgressIndicationObservable().pipe(takeUntil(this._destroyed)).subscribe(x => {
			setTimeout(() => { this.progressIndication = x; });
		});
		timer(2000, this.installationConfiguration.inAppNotificationsCountInterval * 1000)
			.pipe(takeUntil(this._destroyed))
			.subscribe(x => {
				this.countUnreadInappNotifications();
			});
	}

	private countUnreadInappNotifications() {
		if (this.isAuthenticated()) {
			this.inappNotificationService.countUnread()
				.pipe(takeUntil(this._destroyed))
				.subscribe(
					data => {
						this.inAppNotificationCount = data;
					},
				);
		}
	}

	public logout(): void {
		this.router.navigate(['/logout']);
	}

	public isAuthenticated(): boolean {
		return this.authService.currentAccountIsAuthenticated();
	}

	public isTransientUser(): boolean {
		return this.authService.isTransientUser();
	}

	public areConsentsNeedAttention(): boolean {
		return this.authService.consentsRequireAttention();
	}

	public consentsNeedAttentionClicked() {
		this.router.navigate(['/user-profile', 'consents']);
	}

	public isAdmin(): boolean {
		return this.authService.isAdmin();
	}

	public getPrincipalName(): string {
		return this.authService.getPrincipalName() || '';
	}

	public getProfilePicture(): string {
		if (this.authService.getUserProfilePictureRef()) {
			return this.userService.getProfilePictureUrl(this.authService.getUserProfilePictureRef());
		} else if (this.authService.getUserProfilePictureUrl()) {
			return this.authService.getUserProfilePictureUrl();
		} else {
			return 'assets/images/profile-placeholder.png';
		}
	}

	onThemeSelected(selectedTheme: ThemeType) {
		this.themingService.themeSelected(selectedTheme);
	}

	onLanguageSelected(selectedLanguage: LanguageType) {
		this.languageService.languageSelected(selectedLanguage);
	}

	getUserProfileQueryParams(): any {
		const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || this.router.url;
		return { returnUrl: returnUrl };
	}

	toggleInAppNotifications() {
		if (this.inAppNotificationDialog != null) {
			this.inAppNotificationDialog.close();
		} else {
			this.countUnreadInappNotifications();
			this.inAppNotificationDialog = this.dialog.open(InAppNotificationListingDialogComponent, {
				position: {
					top: '64px', right: '0px'
				}
			});
			this.inAppNotificationDialog.afterClosed().pipe(takeUntil(this._destroyed)).subscribe(result => {
				this.countUnreadInappNotifications();
				this.inAppNotificationDialog = null;
			});
		}
	}

	goToExternalLink(url): void {
		window.open(url, '_blank');
	}
}
