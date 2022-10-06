import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/auth-guard.service';
import { PendingChangesGuard } from '@common/forms/pending-form-changes/pending-form-changes-guard.service';
import { MyNetworkListingComponent } from '@app/ui/my-network/my-network-listing/my-network-listing.component';
import { MyNetworkEditorComponent } from '@app/ui/my-network/my-network-editor/my-network-editor.component';
import { MyNetworkEditorResolver } from '@app/ui/my-network/my-network-editor/my-network-editor.resolver';

const routes: Routes = [
	{
		path: '',
		component: MyNetworkListingComponent,
		canActivate: [AuthGuard]
	},
	{
		path: 'new',
		component: MyNetworkEditorComponent,
		canActivate: [AuthGuard]
	},
	{
		path: ':id',
		canActivate: [AuthGuard],
		component: MyNetworkEditorComponent,
		canDeactivate: [PendingChangesGuard],
		resolve: {
			'entity': MyNetworkEditorResolver
		}
	},
	{ path: '**', loadChildren: () => import('@common/page-not-found/page-not-found.module').then(m => m.PageNotFoundModule) },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
	providers: [MyNetworkEditorResolver]
})
export class MyNetworkRoutingModule { }
