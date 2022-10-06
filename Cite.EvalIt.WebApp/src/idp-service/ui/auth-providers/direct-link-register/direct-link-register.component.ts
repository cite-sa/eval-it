import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BaseComponent } from '@common/base/base.component';
import { FormService } from '@common/forms/form-service';
import { EmailMatchValidator } from '@common/forms/validation/custom-validator';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { DirectLinkRegistrationInfo } from '@idp-service/core/model/direct-link-registration-info';
import { UserService } from '@user-service/services/http/user.service';

export interface DirectLinkRegisterComponentConfiguration {
	showHeader?: boolean;
	recaptchaEnabled?: boolean;
}

@Component({
	selector: 'app-direct-link-register',
	templateUrl: './direct-link-register.component.html',
	styleUrls: ['./direct-link-register.component.scss']
})
export class DirectLinkRegisterComponent extends BaseComponent implements OnInit {
	private static defaultConfiguration: DirectLinkRegisterComponentConfiguration = {
		showHeader: true,
		recaptchaEnabled: false
	};

	@Input() configuration: DirectLinkRegisterComponentConfiguration;

	@Output() onAuthenticate = new EventEmitter<DirectLinkRegistrationInfo>();

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
			email: ['', [Validators.email, Validators.required]],
			emailConfirm: ['', [Validators.email, Validators.required]],
		}, {
			validator: EmailMatchValidator,
			updateOn: 'submit'
		});

		if (this.recaptchaEnabled()) {
			formGroup.addControl('recaptcha', new FormControl('', [Validators.required]));
		}

		return formGroup;
	}

	private getConfiguration(): DirectLinkRegisterComponentConfiguration {
		return { ...DirectLinkRegisterComponent.defaultConfiguration, ...this.configuration };
	}

	showHeader(): boolean { return this.getConfiguration().showHeader; }
	recaptchaEnabled(): boolean { return this.getConfiguration().recaptchaEnabled; }

	public register(): void {
		if (!this.isFormValid()) { return; }

		const credential: DirectLinkRegistrationInfo = {
			username: this.userRegistrationFormGroup.get('email').value,
			email: this.userRegistrationFormGroup.get('email').value,
			recaptcha: this.userRegistrationFormGroup.get('recaptcha').value
		};
		this.onAuthenticate.emit(credential);
	}

	public isFormValid() {
		this.formService.touchAllFormFields(this.userRegistrationFormGroup);
		return this.userRegistrationFormGroup.valid;
	}

	public hasEmailMismatchError() {
		return this.userRegistrationFormGroup.get('email').touched
			&& this.userRegistrationFormGroup.get('emailConfirm').touched
			&& this.userRegistrationFormGroup.hasError('emailMismatch');
	}
}
