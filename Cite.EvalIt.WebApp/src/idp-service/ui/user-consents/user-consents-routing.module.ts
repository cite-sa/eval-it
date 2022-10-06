import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/auth-guard.service';
import { UserConsentsComponent } from '@idp-service/ui/user-consents/user-consents.component';

const routes: Routes = [
	{
		path: '',
		canActivate: [AuthGuard],
		component: UserConsentsComponent
	},
	{ path: '**', loadChildren: () => import('@common/page-not-found/page-not-found.module').then(m => m.PageNotFoundModule) },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class UserConsentsRoutingModule { }
