import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeclineRegistrationInvitationComponent } from '@idp-service/ui/user-registration/decline-registration-invitation/decline-registration-invitation.component';
import { UserRegistrationComponent } from '@idp-service/ui/user-registration/user-registration.component';

const routes: Routes = [
	{
		path: 'decline/:tenantCode/:invitationCode',
		component: DeclineRegistrationInvitationComponent
	},
	{
		path: ':tenantId',
		component: UserRegistrationComponent
	},
	{
		path: ':tenantCode/:invitationCode',
		component: UserRegistrationComponent
	},
	{ path: '**', loadChildren: () => import('@common/page-not-found/page-not-found.module').then(m => m.PageNotFoundModule) },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class UserRegistrationRoutingModule { }
