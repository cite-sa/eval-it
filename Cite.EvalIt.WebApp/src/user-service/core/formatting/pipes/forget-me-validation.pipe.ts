import { Pipe, PipeTransform } from '@angular/core';
import { UserServiceEnumUtils } from '@user-service/core/formatting/enum-utils.service';

@Pipe({ name: 'forgetMeValidation' })
export class ForgetMeValidationPipe implements PipeTransform {
	constructor(private enumUtils: UserServiceEnumUtils) { }

	public transform(value): any {
		return this.enumUtils.toForgetMeValidationString(value);
	}
}
