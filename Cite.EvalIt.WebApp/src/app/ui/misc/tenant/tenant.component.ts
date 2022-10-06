import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '@common/base/base.component';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';

@Component({
	template: ''
})
export class TenantComponent extends BaseComponent implements OnInit {

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private uiNotificationService: UiNotificationService,
		private language: TranslateService,
	) {
		super();
	}

	ngOnInit() {
		this.route.paramMap.pipe(takeUntil(this._destroyed)).subscribe((paramMap) => {
			if (paramMap.has('tenantCode')) {
				this.router.navigate(['/login/' + paramMap.get('tenantCode')]);
			} else {
				this.router.navigate(['/']);
				this.uiNotificationService.snackBarNotification(this.language.instant('APP.TENANT-COMPONENT.MESSAGE.NOT-FOUND'), SnackBarNotificationLevel.Error);
			}
		});
	}
}
