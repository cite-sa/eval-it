import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/auth-guard.service';
import { AppPermission } from '@app/core/enum/permission.enum';
import { TagEditorComponent } from '@app/ui/tag/editor/tag-editor.component';
import { TagEditorResolver } from '@app/ui/tag/editor/tag-editor.resolver';
import { TagListingComponent } from '@app/ui/tag/listing/tag-listing.component';
import { PendingChangesGuard } from '@common/forms/pending-form-changes/pending-form-changes-guard.service';

const routes: Routes = [
	{
		path: '',
		component: TagListingComponent,
		canActivate: [AuthGuard]
	},
	{
		path: 'new',
		canActivate: [AuthGuard],
		data: {
			authContext: {
				permissions: [AppPermission.EditTag]
			}
		},
		component: TagEditorComponent,
		canDeactivate: [PendingChangesGuard],
	},
	{
		path: ':id',
		canActivate: [AuthGuard],
		component: TagEditorComponent,
		canDeactivate: [PendingChangesGuard],
		resolve: {
			'entity': TagEditorResolver
		}
	},
	{ path: '**', loadChildren: () => import('@common/page-not-found/page-not-found.module').then(m => m.PageNotFoundModule) },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
	providers: [TagEditorResolver]
})
export class TagRoutingModule { }
