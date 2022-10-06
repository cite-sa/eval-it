import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/auth-guard.service';
import { AppPermission } from '@app/core/enum/permission.enum';
import { DataObjectTypeEditorComponent } from '@app/ui/data-object-type/editor/data-object-type-editor.component';
import { DataObjectTypeEditorResolver } from '@app/ui/data-object-type/editor/data-object-type-editor.resolver';
import { DataObjectTypeListingComponent } from '@app/ui/data-object-type/listing/data-object-type-listing.component';
import { DataObjectTypeRankingMethodologyEditorComponent } from '@app/ui/data-object-type/ranking-methodology-editor/data-object-type-ranking-methodology-editor.component';
import { PendingChangesGuard } from '@common/forms/pending-form-changes/pending-form-changes-guard.service';

const routes: Routes = [
	{
		path: '',
		component: DataObjectTypeListingComponent,
		canActivate: [AuthGuard]
	},
	{
		path: 'new',
		canActivate: [AuthGuard],
		data: {
			authContext: {
				permissions: [AppPermission.EditDataObjectType]
			}
		},
		component: DataObjectTypeEditorComponent,
		canDeactivate: [PendingChangesGuard],
	},
	{
		path: ':id',
		canActivate: [AuthGuard],
		component: DataObjectTypeEditorComponent,
		canDeactivate: [PendingChangesGuard],
		resolve: {
			'entity': DataObjectTypeEditorResolver
		}
	},
	{
		path: ':id/rankingmethodology/:id2',
		canActivate: [AuthGuard],
		component: DataObjectTypeRankingMethodologyEditorComponent,
		canDeactivate: [PendingChangesGuard],
		resolve: {
			'entity': DataObjectTypeEditorResolver
		}
	},
	{ path: '**', loadChildren: () => import('@common/page-not-found/page-not-found.module').then(m => m.PageNotFoundModule) },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
	providers: [DataObjectTypeEditorResolver]
})
export class DataObjectTypeRoutingModule { }
