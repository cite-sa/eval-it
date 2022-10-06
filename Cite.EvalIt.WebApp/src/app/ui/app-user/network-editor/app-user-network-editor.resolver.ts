import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AppUser, UserWithRelationship } from '@app/core/model/app-user/app-user.model';
import { AppUserService } from '@app/core/services/http/app-user.service';
import { BaseEditorResolver } from '@common/base/base-editor.resolver';
import { Guid } from '@common/types/guid';
import { takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';

@Injectable()
export class AppUserNetworkEditorResolver extends BaseEditorResolver{

  constructor(private userService: AppUserService) {
    super();
  }

  public static lookupFields(): string[]{
  
    let networkStr = "User.";

    return [
			...BaseEditorResolver.lookupFields(),
			nameof<AppUser>(x => x.name),
      networkStr + nameof<UserWithRelationship>(x => x.id)
		]
  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    const fields = [
			...AppUserNetworkEditorResolver.lookupFields(),
		];
    return this.userService.getSingle(Guid.parse(route.paramMap.get('id2')), fields ).pipe(takeUntil(this._destroyed));
  }
}
