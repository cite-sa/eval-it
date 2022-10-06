import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserInvitationComponent } from '@idp-service/ui/user-invitation/user-invitation.component';

const routes: Routes = [
	{
		path: '',
		component: UserInvitationComponent
	},
	{ path: '**', loadChildren: () => import('@common/page-not-found/page-not-found.module').then(m => m.PageNotFoundModule) },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class UserInvitationRoutingModule { }
