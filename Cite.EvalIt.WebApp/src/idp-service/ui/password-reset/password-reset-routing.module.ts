import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeclinePasswordResetComponent } from '@idp-service/ui/password-reset/decline/decline-password-reset.component';
import { PasswordResetComponent } from '@idp-service/ui/password-reset/password-reset.component';

const routes: Routes = [
	{
		path: 'decline/:tenantCode/:token',
		component: DeclinePasswordResetComponent,
	},
	{
		path: ':tenantCode/:token',
		component: PasswordResetComponent,
	},
	{ path: '**', loadChildren: () => import('@common/page-not-found/page-not-found.module').then(m => m.PageNotFoundModule) },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class PasswordResetRoutingModule { }
