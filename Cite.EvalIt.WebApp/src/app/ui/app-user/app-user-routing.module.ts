import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/auth-guard.service';
import { AppUserListingComponent } from '@app/ui/app-user/listing/app-user-listing.component';
import { PendingChangesGuard } from '@common/forms/pending-form-changes/pending-form-changes-guard.service';
import { AppUserTagEditorComponent } from '@app/ui/app-user/tag-editor/app-user-tag-editor.component';
import { AppUserTagEditorResolver } from '@app/ui/app-user/tag-editor/app-user-tag-editor.resolver';
import { AppUserNetworkEditorComponent } from '@app/ui/app-user/network-editor/app-user-network-editor.component';
import { AppUserNetworkEditorResolver } from '@app/ui/app-user/network-editor/app-user-network-editor.resolver';
import { AppUserInfoComponent } from '@app/ui/app-user/info/app-user-info.component';

const routes: Routes = [
	{
		path: '',
		component: AppUserListingComponent,
		canActivate: [AuthGuard]
	},
	{
		path: ':id',
		canActivate: [AuthGuard],
		component: AppUserInfoComponent,
	},
	{
		path: ':id1/tag/new',
		canActivate: [AuthGuard],
		component: AppUserTagEditorComponent,
		canDeactivate: [PendingChangesGuard],
	},
	{
		path: ':id1/tag/:id2',
		canActivate: [AuthGuard],
		component: AppUserTagEditorComponent,
		canDeactivate: [PendingChangesGuard],
		resolve: {
			'entity': AppUserTagEditorResolver
		}
	},
	{
		path: ':id1/network/new',
		canActivate: [AuthGuard],
		component: AppUserNetworkEditorComponent,
		canDeactivate: [PendingChangesGuard],

	},
	{
		path: ':id1/network/:id2',
		canActivate: [AuthGuard],
		component: AppUserNetworkEditorComponent,
		canDeactivate: [PendingChangesGuard],
		resolve: {
			'entity': AppUserNetworkEditorResolver
		}
	},

	{ path: '**', loadChildren: () => import('@common/page-not-found/page-not-found.module').then(m => m.PageNotFoundModule) },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
	providers: [AppUserTagEditorResolver, AppUserNetworkEditorResolver]
})
export class AppUserRoutingModule { }
