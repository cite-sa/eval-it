import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/auth-guard.service';
import { PendingChangesGuard } from '@common/forms/pending-form-changes/pending-form-changes-guard.service';
import { UserServicePermission } from '@user-service/core/enum/permission.enum';
import { ApiClientEditorComponent } from '@user-service/ui/api-client/editor/api-client-editor.component';
import { ApiClientEditorResolver } from '@user-service/ui/api-client/editor/api-client-editor.resolver';
import { ApiClientListingComponent } from '@user-service/ui/api-client/listing/api-client-listing.component';

const routes: Routes = [
	{
		path: '',
		component: ApiClientListingComponent,
		canActivate: [AuthGuard]
	},
	{
		path: 'new',
		canActivate: [AuthGuard],
		data: {
			authContext: {
				userServicePermissions: [UserServicePermission.EditUserService]
			}
		},
		component: ApiClientEditorComponent,
		canDeactivate: [PendingChangesGuard],
	},
	{
		path: ':id',
		canActivate: [AuthGuard],
		component: ApiClientEditorComponent,
		canDeactivate: [PendingChangesGuard],
		resolve:{
			'entity': ApiClientEditorResolver
		}
	},
	{ path: '**', loadChildren: () => import('@common/page-not-found/page-not-found.module').then(m => m.PageNotFoundModule) },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
	providers: [ApiClientEditorResolver]
})
export class ApiClientRoutingModule { }
