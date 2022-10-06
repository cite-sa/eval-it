import { Pipe, PipeTransform } from '@angular/core';
import { UserServiceEnumUtils } from '@user-service/core/formatting/enum-utils.service';

@Pipe({ name: 'forgetMeStateFormat' })
export class ForgetMeStatePipe implements PipeTransform {
	constructor(private enumUtils: UserServiceEnumUtils) { }

	public transform(value): any {
		return this.enumUtils.toForgetMeStateString(value);
	}
}
