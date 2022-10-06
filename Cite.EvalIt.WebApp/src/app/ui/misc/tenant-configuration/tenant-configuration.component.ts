import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@common/base/base.component';

@Component({
	selector: 'app-tenant-configuration',
	templateUrl: './tenant-configuration.component.html',
	styleUrls: ['./tenant-configuration.component.scss']
})
export class TenantConfigurationComponent extends BaseComponent implements OnInit {


	constructor(
	) {
		super();
	}

	ngOnInit() {
	}
}
