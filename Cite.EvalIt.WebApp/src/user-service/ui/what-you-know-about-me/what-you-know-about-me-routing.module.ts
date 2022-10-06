import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/auth-guard.service';
import { DeclineWhatYouKnowAboutMeComponent } from '@user-service/ui/what-you-know-about-me/decline/decline-what-you-know-about-me.component';
import { WhatYouKnowAboutMeRequestListingComponent } from '@user-service/ui/what-you-know-about-me/requests/what-you-know-about-me-request-listing.component';
import { WhatYouKnowAboutMeValidateComponent } from '@user-service/ui/what-you-know-about-me/validate/what-you-know-about-me-validate.component';

const routes: Routes = [
	{
		path: 'requests',
		component: WhatYouKnowAboutMeRequestListingComponent,
		canActivate: [AuthGuard]
	}, {
		path: 'decline/:tenantCode/:token',
		component: DeclineWhatYouKnowAboutMeComponent,
		canActivate: [AuthGuard]
	}, {
		path: ':tenantCode/:token',
		component: WhatYouKnowAboutMeValidateComponent,
		canActivate: [AuthGuard]
	},
	{ path: '**', loadChildren: () => import('@common/page-not-found/page-not-found.module').then(m => m.PageNotFoundModule) },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class WhatYouKnowAboutMeRoutingModule { }
