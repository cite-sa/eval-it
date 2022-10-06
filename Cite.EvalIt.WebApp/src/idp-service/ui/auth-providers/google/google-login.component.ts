import { AfterViewInit, Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
/// <reference types="gapi" />

@Component({
	selector: 'app-google-login',
	templateUrl: './google-login.component.html',
	styleUrls: ['./google-login.component.scss']
})
export class GoogleLoginComponent implements AfterViewInit {
	@Output() onAuthenticateSuccess = new EventEmitter<string>();

	private clientId = this.installationConfiguration.authGoogleClientId;
	private auth2: gapi.auth2.GoogleAuth;

	@ViewChild('loginButton', { static: true }) loginButton: ElementRef;

	constructor(private installationConfiguration: InstallationConfigurationService) { }

	ngAfterViewInit() {
		this.googleInit();
	}

	googleInit() {
		const config: gapi.auth2.ClientConfig = {};
		config.client_id = this.clientId;
		config.cookie_policy = 'single_host_origin';

		gapi.load('auth2', () => {
			this.auth2 = gapi.auth2.init(config);

			gapi.signin2.render(this.loginButton.nativeElement.id, {});

			this.attachSignin(this.loginButton.nativeElement);
		});
	}

	attachSignin(element) {
		this.auth2.attachClickHandler(element, {},
			(googleUser) => this.onAuthenticateSuccess.emit(googleUser.getAuthResponse(true).access_token),
			(error) => console.log(JSON.stringify(error, undefined, 2))
		);
	}

	signOutGoogle() {
		this.auth2.signOut().then(() => {
			console.log('User signed out.');
		});
	}
}
