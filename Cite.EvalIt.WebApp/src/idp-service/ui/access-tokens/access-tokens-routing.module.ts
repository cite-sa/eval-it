import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/auth-guard.service';
import { AccessTokenListingComponent } from '@idp-service/ui/access-tokens/listing/access-token-listing.component';

const routes: Routes = [
	{
		path: '',
		component: AccessTokenListingComponent,
		canActivate: [AuthGuard]
	},
	{ path: '**', loadChildren: () => import('@common/page-not-found/page-not-found.module').then(m => m.PageNotFoundModule) },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class AccessTokensRoutingModule { }
