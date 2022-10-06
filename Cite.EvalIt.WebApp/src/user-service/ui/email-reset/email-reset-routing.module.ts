import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeclineEmailResetComponent } from '@user-service/ui/email-reset/decline/decline-email-reset.component';
import { EmailResetComponent } from '@user-service/ui/email-reset/email-reset.component';

const routes: Routes = [
	{
		path: 'decline/awareness/:tenantCode/:token',
		component: DeclineEmailResetComponent,
	},
	{
		path: 'decline/:tenantCode/:token',
		component: DeclineEmailResetComponent,
	},
	{
		path: ':tenantCode/:token',
		component: EmailResetComponent,
	},
	{ path: '**', loadChildren: () => import('@common/page-not-found/page-not-found.module').then(m => m.PageNotFoundModule) },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class EmailResetRoutingModule { }
