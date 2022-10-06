import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Route, Router, RouterStateSnapshot } from '@angular/router';
import { BaseGuard } from '@common/base/base.guard';
import { Guid } from '@common/types/guid';
import { UserConsentsGuardService } from '@idp-service/ui/user-consents/consents-guard/user-consents-guard.service';
import { Observable, of as observableOf } from 'rxjs';

@Injectable()
export class UserConsentsGuard extends BaseGuard implements CanActivate, CanLoad {

	constructor(
		private router: Router,
		private dialog: MatDialog,
		private userConsentsGuardService: UserConsentsGuardService
	) { super(); }

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
		const url: string = state.url;
		const requirements = route.data ? route.data['consentRequirements'] as ConsentRequirements : null;
		return this.applyGuard(url, requirements);
	}

	canLoad(route: Route): Observable<boolean> {
		const url = `/${route.path}`;
		const requirements = route.data ? route.data['consentRequirements'] as ConsentRequirements : null;
		return this.applyGuard(url, requirements);
	}

	private applyGuard(url: string, requirements: ConsentRequirements): Observable<boolean> {
		if (!requirements.ids || requirements.ids.length === 0) { return observableOf(true); } //No requirements are set.

		return this.userConsentsGuardService.areAllRequirementConsentsAccepted(requirements.ids,
			(accepted: boolean) => {
				if (accepted) {
					this.router.navigate([url]);
				}
			});
	}
}

export interface ConsentRequirements {
	ids: Guid[];
}
