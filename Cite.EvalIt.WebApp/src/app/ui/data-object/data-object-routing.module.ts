import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/auth-guard.service';
import { DataObjectEditorComponent } from '@app/ui/data-object/editor/data-object-editor.component';
import { DataObjectEditorResolver } from '@app/ui/data-object/editor/data-object-editor.resolver';
import { DataObjectInfoComponent } from '@app/ui/data-object/info/data-object-info.component';
import { DataObjectListingComponent } from '@app/ui/data-object/listing/data-object-listing.component';
import { DataObjectReviewEditorComponent } from '@app/ui/data-object/review-editor/data-object-review-editor.component';
import { DataObjectReviewEditorResolver } from '@app/ui/data-object/review-editor/data-object-review-editor.resolver';
import { DataObjectReviewTileComponent } from '@app/ui/data-object/review-tile/data-object-review-tile.component';
import { DataObjectReviewViewerComponent } from '@app/ui/data-object/review-viewer/data-object-review-viewer.component';
import { DataObjectTagEditorComponent } from '@app/ui/data-object/tag-editor/data-object-tag-editor.component';
import { DataObjectTagEditorResolver } from '@app/ui/data-object/tag-editor/data-object-tag-editor.resolver';
import { PendingChangesGuard } from '@common/forms/pending-form-changes/pending-form-changes-guard.service';

const routes: Routes = [
	{
		path: '',
		component: DataObjectListingComponent,
		canActivate: [AuthGuard]
	},
	{
		path: ':id/editor',
		canActivate: [AuthGuard],
		component: DataObjectEditorComponent,
		canDeactivate: [PendingChangesGuard],
		resolve: {
			'entity': DataObjectEditorResolver
		}
	},
	{
		path: 'new/editor',
		canActivate: [AuthGuard],
		component: DataObjectEditorComponent,
		canDeactivate: [PendingChangesGuard]
	},
	{
		path: ':id',
		canActivate: [AuthGuard],
		component: DataObjectInfoComponent,
		resolve: {
			'entity': DataObjectEditorResolver
		}
	},
	{
		path: ':id1/tag/new',
		canActivate: [AuthGuard],
		component: DataObjectTagEditorComponent,
		canDeactivate: [PendingChangesGuard],
	},
	{
		path: ':id1/tag/:id2',
		canActivate: [AuthGuard],
		component: DataObjectTagEditorComponent,
		canDeactivate: [PendingChangesGuard],
		resolve: {
			'entity': DataObjectTagEditorResolver
		}
	},
	{
		path: ':id1/review/new/editor',
		canActivate: [AuthGuard],
		component: DataObjectReviewEditorComponent,
		canDeactivate: [PendingChangesGuard],
		resolve: {
			'entity': DataObjectReviewEditorResolver
		}
	},
	{
		path: ':id1/review/:id2/editor',
		canActivate: [AuthGuard],
		component: DataObjectReviewEditorComponent,
		canDeactivate: [PendingChangesGuard],
		resolve: {
			'entity': DataObjectReviewEditorResolver
		}
	},
	{
		path: ':id1/review/:id2/viewer',
		canActivate: [AuthGuard],
		component: DataObjectReviewViewerComponent,
		resolve: {
			'entity': DataObjectReviewEditorResolver
		}
	},
	{ path: '**', loadChildren: () => import('@common/page-not-found/page-not-found.module').then(m => m.PageNotFoundModule) },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
	providers: [DataObjectTagEditorResolver, DataObjectEditorResolver, DataObjectReviewEditorResolver]
})
export class DataObjectRoutingModule { }
