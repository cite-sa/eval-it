import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { DataObject } from '@app/core/model/data-object/data-object.model';
import { Tag } from '@app/core/model/tag/tag.model';
import { DataObjectService } from '@app/core/services/http/data-object.service';
import { BaseEditorResolver } from '@common/base/base-editor.resolver';
import { Guid } from '@common/types/guid';
import { takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';

@Injectable()
export class DataObjectTagListingResolver extends BaseEditorResolver{

    constructor(private dataObjectService: DataObjectService) {
    super();
  }

  public static lookupFields(): string[]{
    let tagStr = "Tag.";
    return [
			...BaseEditorResolver.lookupFields(),
			nameof<DataObject>(x => x.title),
      tagStr + nameof<Tag>(x => x.id),
      tagStr + nameof<Tag>(x => x.label),
			tagStr + nameof<Tag>(x => x.appliesTo),
			tagStr + nameof<Tag>(x => x.type)
		]
  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    const fields = [
			...DataObjectTagListingResolver.lookupFields(),
		];
    return this.dataObjectService.getSingle(Guid.parse(route.paramMap.get('id')), fields ).pipe(takeUntil(this._destroyed));
  }
}
