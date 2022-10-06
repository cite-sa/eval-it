import { Pipe, PipeTransform } from '@angular/core';
import { Tag } from '@app/core/model/tag/tag.model';

@Pipe({ name: 'TagTypeFormat' })
export class TagListSerializePipe implements PipeTransform {
	constructor() { }

	public transform(value : Tag[]): string {
        if (value?.length > 0) return value?.map(p => p.label).join(", ");
        return "";
	}
}
