import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '@idp-service/services/http/token.service';

@Component({
	templateUrl: './logout.component.html',
	styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {
	constructor(
		private tokenService: TokenService,
		private router: Router) { }

	ngOnInit() {
		this.tokenService.logout(() => {
			localStorage.clear();
			this.router.navigate(['./'], { replaceUrl: true });
		});
	}
}
