import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BaseComponent } from '@common/base/base.component';
import { FormService } from '@common/forms/form-service';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { TransientRegistrationInfo } from '@idp-service/core/model/transient-registration-info';
import { UserService } from '@user-service/services/http/user.service';

export interface TransientRegisterComponentConfiguration {
	showHeader?: boolean;
	recaptchaEnabled?: boolean;
}

@Component({
	selector: 'app-transient-register',
	templateUrl: './transient-register.component.html',
	styleUrls: ['./transient-register.component.scss']
})
export class TransientRegisterComponent extends BaseComponent implements OnInit {
	private static defaultConfiguration: TransientRegisterComponentConfiguration = {
		showHeader: true,
		recaptchaEnabled: false
	};

	@Input() configuration: TransientRegisterComponentConfiguration;
	@Output() onAuthenticate = new EventEmitter<TransientRegistrationInfo>();

	private formBuilder: FormBuilder = new FormBuilder();
	private _userRegistrationFormGroup: FormGroup = null;
	public get userRegistrationFormGroup(): FormGroup { return this._userRegistrationFormGroup; }

	constructor(
		public installationConfiguration: InstallationConfigurationService,
		public userService: UserService,
		private formService: FormService
	) {
		super();
	}

	ngOnInit() {
		this._userRegistrationFormGroup = this.buildForm();
	}

	buildForm(): FormGroup {
		const formGroup = this.formBuilder.group({
			username: ['', [Validators.required]],
		});

		if (this.recaptchaEnabled()) {
			formGroup.addControl('recaptcha', new FormControl('', [Validators.required]));
		}

		return formGroup;
	}

	private getConfiguration(): TransientRegisterComponentConfiguration {
		return { ...TransientRegisterComponent.defaultConfiguration, ...this.configuration };
	}

	showHeader(): boolean { return this.getConfiguration().showHeader; }
	recaptchaEnabled(): boolean { return this.getConfiguration().recaptchaEnabled; }

	public register(): void {
		if (!this.isFormValid()) { return; }

		const credential: TransientRegistrationInfo = {
			username: this.userRegistrationFormGroup.get('username').value,
			recaptcha: this.userRegistrationFormGroup.get('recaptcha').value
		};
		this.onAuthenticate.emit(credential);
	}

	public isFormValid() {
		this.formService.touchAllFormFields(this.userRegistrationFormGroup);
		return this.userRegistrationFormGroup.valid;
	}
}
