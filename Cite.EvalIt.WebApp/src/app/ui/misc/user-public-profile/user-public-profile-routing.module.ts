import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/auth-guard.service';
import { UserPublicProfileComponent } from '@app/ui/misc/user-public-profile/user-public-profile.component';

const routes: Routes = [
	{
		path: ':id',
		canActivate: [AuthGuard],
		component: UserPublicProfileComponent
	},
	{ path: '**', loadChildren: () => import('@common/page-not-found/page-not-found.module').then(m => m.PageNotFoundModule) },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class UserPublicProfileRoutingModule { }
