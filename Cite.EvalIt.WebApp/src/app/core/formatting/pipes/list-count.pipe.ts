import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'ListCount' })
export class ListCountPipe implements PipeTransform {
	constructor() { }

	public transform(value : any[]): any {
		return value ? value.length : 0;
	}
}
