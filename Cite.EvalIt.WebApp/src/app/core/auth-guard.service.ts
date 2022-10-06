import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Route, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService, ResolutionContext } from '@app/core/services/ui/auth.service';
import { IdpService } from '@idp-service/services/http/idp.service';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable()
export class AuthGuard implements CanActivate, CanLoad {
	constructor(private authService: AuthService, private router: Router, private idpService: IdpService) { }

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
		const url: string = state.url;
		const authContext = route.data ? route.data['authContext'] as ResolutionContext : null;
		return this.applyGuard(url, authContext);
	}

	canLoad(route: Route): Observable<boolean> {
		const url = `/${route.path}`;
		const authContext = route.data ? route.data['authContext'] as ResolutionContext : null;
		return this.applyGuard(url, authContext);
	}

	private applyGuard(url: string, authContext: ResolutionContext) {
		return this.checkGuard(url, authContext).pipe(tap(authorized => {
			if (!authorized) {
				this.router.navigate(['/unauthorized'], { queryParams: { returnUrl: url } });
			} else {
				if (!url.startsWith('/user-profile') && this.authService.isProfileTentative()) {
					this.router.navigate(['/user-profile'], { queryParams: { returnUrl: url } });
				}
			}
		}));
	}

	private checkGuard(url: string, authContext: ResolutionContext): Observable<boolean> {
		if (!this.authService.isLoggedIn()) { return observableOf(false); }

		return this.authService.hasAccessToken()
			? observableOf(this.authService.authorize(authContext))
			: this.idpService.refreshToken().pipe(
				map(x => this.authService.hasAccessToken() && this.authService.authorize(authContext)
				), catchError(x => observableOf(false)));
	}
}
