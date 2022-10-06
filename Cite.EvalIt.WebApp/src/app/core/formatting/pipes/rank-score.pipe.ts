import { PercentPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'RankScore' })
export class RankScorePipe implements PipeTransform {
	constructor() { }

	public transform(value : number): any {
		return new PercentPipe('en-US').transform(value,'1.2-2');
	}
}
