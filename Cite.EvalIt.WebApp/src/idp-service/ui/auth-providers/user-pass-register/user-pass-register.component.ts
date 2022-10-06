import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FormService } from '@common/forms/form-service';
import { PasswordMatchValidator } from '@common/forms/validation/custom-validator';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { Credential } from '@idp-service/core/model/idp.model';

export interface UserPassRegisterComponentConfiguration {
	showHeader?: boolean;
	recaptchaEnabled?: boolean;
}

@Component({
	selector: 'app-user-pass-register',
	templateUrl: './user-pass-register.component.html'
})
export class UserPassRegisterComponent implements OnInit {
	private static defaultConfiguration: UserPassRegisterComponentConfiguration = {
		showHeader: true,
		recaptchaEnabled: false
	};

	@Input() configuration: UserPassRegisterComponentConfiguration;

	@Output() onAuthenticate = new EventEmitter<Credential>();

	private formBuilder: FormBuilder = new FormBuilder();
	private _userRegistrationFormGroup: FormGroup = null;
	public get userRegistrationFormGroup(): FormGroup { return this._userRegistrationFormGroup; }

	constructor(
		public installationConfiguration: InstallationConfigurationService,
		private formService: FormService
	) {
	}

	ngOnInit() {
		this._userRegistrationFormGroup = this.buildForm();
	}

	buildForm(): FormGroup {
		const formGroup = this.formBuilder.group({
			username: ['', [Validators.required]],
			password: ['', [Validators.required]],
			passwordConfirm: ['', [Validators.required]],
		}, {
			validator: PasswordMatchValidator('password', 'passwordConfirm')
		});

		if (this.recaptchaEnabled()) {
			formGroup.addControl('recaptcha', new FormControl('', [Validators.required]));
		}

		return formGroup;
	}

	private getConfiguration(): UserPassRegisterComponentConfiguration {
		return { ...UserPassRegisterComponent.defaultConfiguration, ...this.configuration };
	}

	showHeader(): boolean { return this.getConfiguration().showHeader; }
	recaptchaEnabled(): boolean { return this.getConfiguration().recaptchaEnabled; }

	public register(): void {
		if (!this.isFormValid()) { return; }

		const credential: Credential = {
			username: this.userRegistrationFormGroup.get('username').value,
			password: this.userRegistrationFormGroup.get('password').value,
			recaptcha: (this.recaptchaEnabled()) ? this.userRegistrationFormGroup.get('recaptcha').value : null
		};
		this.onAuthenticate.emit(credential);
	}

	public isFormValid() {
		this.formService.touchAllFormFields(this.userRegistrationFormGroup);
		return this.userRegistrationFormGroup.valid;
	}

	public hasPasswordMismatchError() {
		return this.userRegistrationFormGroup.get('password').touched
			&& this.userRegistrationFormGroup.get('passwordConfirm').touched
			&& this.userRegistrationFormGroup.hasError('passwordMismatch');
	}
}
