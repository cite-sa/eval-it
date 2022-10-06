import { Pipe, PipeTransform } from '@angular/core';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';

@Pipe({ name: 'UserNetworkRelationshipFormat' })
export class UserNetworkRelationshipPipe implements PipeTransform {
	constructor(private enumUtils: AppEnumUtils) { }

	public transform(value): any {
		return this.enumUtils.toUserNetworkRelationshipString(value);
	}
}
