import { NgModule } from '@angular/core';
import { TenantRoutingModule } from '@app/ui/misc/tenant/tenant-routing.module';
import { TenantComponent } from '@app/ui/misc/tenant/tenant.component';

@NgModule({
	imports: [
		TenantRoutingModule
	],
	declarations: [
		TenantComponent,
	]
})
export class TenantModule { }
