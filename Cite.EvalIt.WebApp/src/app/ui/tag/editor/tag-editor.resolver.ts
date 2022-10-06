import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { AppUser } from '@app/core/model/app-user/app-user.model';
import { DataObject } from '@app/core/model/data-object/data-object.model';
import { Tag } from '@app/core/model/tag/tag.model';
import { TagService } from '@app/core/services/http/tag.service';
import { BaseEditorResolver } from '@common/base/base-editor.resolver';
import { Guid } from '@common/types/guid';
import { takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';

@Injectable()
export class TagEditorResolver extends BaseEditorResolver{

  constructor(private tagService: TagService) {
    super();
  }

  public static lookupFields(): string[]{
    return [
			...BaseEditorResolver.lookupFields(),
			nameof<Tag>(x => x.label),
			nameof<Tag>(x => x.appliesTo),
			"User." + nameof<AppUser>(x => x.id),
			"DataObject." + nameof<DataObject>(x => x.id),
			nameof<Tag>(x => x.type)
		]
  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    const fields = [
			...TagEditorResolver.lookupFields(),
		];
    return this.tagService.getSingle(Guid.parse(route.paramMap.get('id')), fields ).pipe(takeUntil(this._destroyed));
  }
}
