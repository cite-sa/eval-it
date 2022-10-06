import { Pipe, PipeTransform } from '@angular/core';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';

@Pipe({ name: 'TagTypeFormat' })
export class TagTypePipe implements PipeTransform {
	constructor(private enumUtils: AppEnumUtils) { }

	public transform(value): any {
		return this.enumUtils.toTagTypeString(value);
	}
}
