import { Pipe, PipeTransform } from '@angular/core';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';

@Pipe({ name: 'RankRecalculationTaskStatusFormat' })
export class RankRecalculationTaskStatusPipe implements PipeTransform {
	constructor(private enumUtils: AppEnumUtils) { }

	public transform(value): any {
		return this.enumUtils.toRankRecalculationTaskStatusString(value);
	}
}
