import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/auth-guard.service';
import { TenantConfigurationComponent } from '@app/ui/misc/tenant-configuration/tenant-configuration.component';

const routes: Routes = [
	{
		path: '',
		component: TenantConfigurationComponent,
		canActivate: [AuthGuard]
	},
	{ path: '**', loadChildren: () => import('@common/page-not-found/page-not-found.module').then(m => m.PageNotFoundModule) },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class TenantConfigurationRoutingModule { }
