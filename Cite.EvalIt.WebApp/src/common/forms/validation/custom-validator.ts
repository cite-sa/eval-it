import { AbstractControl, FormArray, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { IsActive } from '@app/core/enum/is-active.enum';
import { UpperBoundType } from '@app/core/enum/upper-bound-type.enum';
import { BoundedType } from '@app/core/model/data-object-type/ranking-methodology.model';
import { ValidationErrorModel } from '@common/forms/validation/error-model/validation-error-model';

export function BackendErrorValidator(errorModel: ValidationErrorModel, propertyName: string): ValidatorFn {
	return (control: AbstractControl): { [key: string]: any } => {
		const error: String = errorModel.getError(propertyName);
		return error ? { 'backendError': { message: error } } : null;
	};
}

export function E164PhoneValidator(): ValidatorFn {
	return Validators.pattern('^\\+?[1-9]\\d{1,14}$');
}

// Getter is required because the index of each element is not fixed (array does not always follow LIFO)
export function BackendArrayErrorValidator(errorModel: ValidationErrorModel, propertyNameGetter: () => string): ValidatorFn {
	return (control: AbstractControl): { [key: string]: any } => {
		const error: String = errorModel.getError(propertyNameGetter());
		return error ? { 'backendError': { message: error } } : null;
	};
}

export function CustomErrorValidator(errorModel: ValidationErrorModel, propertyNames: string[]): ValidatorFn {
	return (control: AbstractControl): { [key: string]: any } => {
		const error: String = errorModel.getErrors(propertyNames);
		return error ? { 'customError': { message: error } } : null;
	};
}

export function EmailMatchValidator(): ValidatorFn {
	return (control: AbstractControl): { [key: string]: any } => {
		return control.get('email').value === control.get('emailConfirm').value ? null : { 'emailMismatch': true };
	};
}

export function PasswordMatchValidator(passwordControlName: string, repeatPasswordControlName: string): ValidatorFn {
	return (control: AbstractControl): { [key: string]: any } => {
		const passwordControl = control.get(passwordControlName);
		const passwordRepeatControl = control.get(repeatPasswordControlName);

		if (passwordControl && passwordControl.value && passwordRepeatControl && passwordRepeatControl.value && passwordControl.value !== passwordRepeatControl.value) {
			return { 'passwordMismatch': true };
		}
		return null;
	};
}

export function NumberValidator(): ValidatorFn {
	return (control: AbstractControl): { [key: string]: any } => {
		if ( control && control.value && isNaN(control.value)) {
			return { 'notANumber': true }
		}
		return null;
	}
}	

export function IntegerValidator(): ValidatorFn {
	return (control: AbstractControl): { [key: string]: any } => {
		if ( control && control.value && (isNaN(control.value) || !Number.isInteger(parseFloat(control.value)) )) {
			return { 'notAnInt': true }
		}
		return null;
	}
}

export function SignValidator(positive: boolean, canBeZero: boolean): ValidatorFn {
	return (control: AbstractControl): { [key: string]: any } => {

		if ( control && control.value) {
			if( isNaN(control.value)) return { 'notANumber' : true };
			let numValue = parseFloat(control.value);
			if( (!canBeZero ? numValue == 0 : false) || (positive ? numValue < 0 : numValue > 0) ) return { 'signError' : true }
		}
		return null;
	}
}

export function DuplicateValidator(getKeyFn: (item: any) => string): ValidatorFn {
	return (control: FormArray): { [key: string]: any } => {
		let map = new Map<string, any>();
		let check = control.controls.some(x => {
			let key = getKeyFn(x.value);
			if( key == '' ) return false; // Ignore empty keys
			if( map.has(key)) return true;
			map.set(key,x);
			return false;
		})
		if(check) return { 'hasDuplicate': true };
		return null;
	}
}

export function BoundedIncreasingValidator(): ValidatorFn {
	return (control: FormArray): { [key: string]: any } => {
		for (let index = 1; index < control.controls.length; index++) {
			const curr = control.controls[index].value as BoundedType<any>;
			const prev = control.controls[index-1].value as BoundedType<any>;
			if( curr.value == undefined || prev.value == undefined) continue; // error will be picked up by required validator
			if(prev.value > curr.value) return { 'isNonIncreasing': true };
			if(prev.value == curr.value && (prev.upperBoundType == UpperBoundType.Inclusive || curr.upperBoundType == UpperBoundType.Exclusive)) return { 'isNonIncreasing': true };
		}
		return null;
	}
}

export function RegexpValidator(regexpPattern: string): ValidatorFn {
	return (control: AbstractControl): { [key: string]: any } => {
		if ( control && control.value && (control.value as string).match(regexpPattern) == null ) {
			return { 'noRegexpMatch': true };
		}
		return null;
	}
}

// Model-specific validators  --  TODO: Maybe move or pass field name as arg
export function PercentageLimitValidator(pecentageInterpretationValue: any, rangeInterpretationControlName: string, formArrayName: string): ValidatorFn {
	return (control: AbstractControl): { [key: string]: any } => {

		if( control.get(rangeInterpretationControlName).value == pecentageInterpretationValue) {
			let array = control.get(formArrayName).value as BoundedType<number>[];
			for (let index = 0; index < array.length; index++) {
				if( array[index].value > 100 || array[index].value < 0) {
					return { 'outOfPercentageRange': true }
				}
			}
		}

		return null;
	}
}

export function NonZeroWeightSumValidator(): ValidatorFn {
	return (control: FormArray): { [key: string]: any } => {
		let weightSum = 0;
		let arr = control.controls;
		for (let index = 0; index < arr.length; index++) {
			if(arr[index].get('isActive').value == IsActive.Active) weightSum += arr[index].get('strategyWeight').value ?? 0;
		}

		if(weightSum == 0 && arr.length > 0) return { 'zeroWeightSumError': true }
		return null;
	}
}

export function ValueWithinBoundsValidator(bound: BoundedType<number>, isUpperBound: boolean): ValidatorFn {
	return (control: AbstractControl): { [key: string]: any } => {
		if( control && control.value) {
			let isValid = true;
			
			if( isUpperBound && control.value > bound.value) isValid = false;
			if( !isUpperBound && control.value < bound.value) isValid = false;
			if( bound.upperBoundType != UpperBoundType.Inclusive && control.value == bound.value) isValid = false;

			if(!isValid) return { 'outOfBounds': true };
		}
		return null;
	}
}