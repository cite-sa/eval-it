import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { AppUser } from '@app/core/model/app-user/app-user.model';
import { Tag } from '@app/core/model/tag/tag.model';
import { AppUserService } from '@app/core/services/http/app-user.service';
import { BaseEditorResolver } from '@common/base/base-editor.resolver';
import { Guid } from '@common/types/guid';
import { takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';

@Injectable()
export class AppUserNetworkListingResolver extends BaseEditorResolver{

  constructor(private appUserService: AppUserService) {
    super();
  }

  public static lookupFields(): string[]{
    let userStr = "User.";
    return [
			...BaseEditorResolver.lookupFields(),
			nameof<AppUser>(x => x.name),
      userStr + nameof<AppUser>(x => x.id),
      userStr + nameof<AppUser>(x => x.name),
		]
  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    const fields = [
			...AppUserNetworkListingResolver.lookupFields(),
		];
    return this.appUserService.getSingle(Guid.parse(route.paramMap.get('id')), fields ).pipe(takeUntil(this._destroyed));
  }
}
