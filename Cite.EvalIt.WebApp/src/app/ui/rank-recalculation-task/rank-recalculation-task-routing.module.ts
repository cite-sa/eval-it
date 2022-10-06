import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/auth-guard.service';
import { RankRecalculationTaskListingComponent } from '@app/ui/rank-recalculation-task/listing/rank-recalculation-task-listing.component';

const routes: Routes = [
	{
		path: '',
		component: RankRecalculationTaskListingComponent,
		canActivate: [AuthGuard]
	},
	{ path: '**', loadChildren: () => import('@common/page-not-found/page-not-found.module').then(m => m.PageNotFoundModule) },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
	providers: []
})
export class RankRecalculationTaskRoutingModule { }
