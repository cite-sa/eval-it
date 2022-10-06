import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Tag } from '@app/core/model/tag/tag.model';
import { TagService } from '@app/core/services/http/tag.service';
import { BaseEditorResolver } from '@common/base/base-editor.resolver';
import { Guid } from '@common/types/guid';
import { takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';

@Injectable()
export class AppUserTagEditorResolver extends BaseEditorResolver{

  constructor(private tagService: TagService) {
    super();
  }

  public static lookupFields(): string[]{

    let tagStr = "Tag.";

    return [
			...BaseEditorResolver.lookupFields(),
			nameof<Tag>(x => x.label),
			nameof<Tag>(x => x.appliesTo),
			nameof<Tag>(x => x.type),
			tagStr + nameof<Tag>(x => x.id)
		]
  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    const fields = [
			...AppUserTagEditorResolver.lookupFields(),
		];
    return this.tagService.getSingle(Guid.parse(route.paramMap.get('id2')), fields ).pipe(takeUntil(this._destroyed));
  }
}
