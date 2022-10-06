
import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

export const TOTP_INPUT_VALUE_ACCESSOR: any = {
	provide: NG_VALUE_ACCESSOR,
	useExisting: forwardRef(() => TotpInputComponent),
	multi: true,
};

@Component({
	selector: 'app-totp-input',
	templateUrl: './totp-input.component.html',
	styleUrls: ['./totp-input.component.scss'],
	providers: [TOTP_INPUT_VALUE_ACCESSOR]
})
export class TotpInputComponent implements ControlValueAccessor {
	@Input() placeholder: string;
	@Input() required = false;
	value = '';
	onChange = (_: any) => { };
	onTouched = () => { };
	constructor(
		private language: TranslateService
	) { }

	writeValue(value: any): void {
		this.value = value || '';
	}

	pushChanges(value: any) {
		this.onChange(value);
	}

	registerOnChange(fn: (_: any) => {}): void { this.onChange = fn; }
	registerOnTouched(fn: () => {}): void { this.onTouched = fn; }
	setDisabledState(isDisabled: boolean): void {
	}

	getPlaceholder(): string {
		return this.placeholder ? this.placeholder : this.language.instant('IDP-SERVICE.TOTP-INPUT.PLACEHOLDER');
	}
}
