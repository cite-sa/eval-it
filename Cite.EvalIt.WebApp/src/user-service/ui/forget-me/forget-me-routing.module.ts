import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/auth-guard.service';
import { DeclineForgetMeComponent } from '@user-service/ui/forget-me/decline/decline-forget-me.component';
import { ForgetMeRequestListingComponent } from '@user-service/ui/forget-me/requests/forget-me-request-listing.component';
import { ForgetMeValidateComponent } from '@user-service/ui/forget-me/validate/forget-me-validate.component';

const routes: Routes = [
	{
		path: 'requests',
		component: ForgetMeRequestListingComponent,
		canActivate: [AuthGuard]
	}, {
		path: 'decline/:tenantCode/:token',
		component: DeclineForgetMeComponent,
		canActivate: [AuthGuard]
	}, {
		path: ':tenantCode/:token',
		component: ForgetMeValidateComponent,
		canActivate: [AuthGuard]
	},
	{ path: '**', loadChildren: () => import('@common/page-not-found/page-not-found.module').then(m => m.PageNotFoundModule) },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ForgetMeRoutingModule { }
