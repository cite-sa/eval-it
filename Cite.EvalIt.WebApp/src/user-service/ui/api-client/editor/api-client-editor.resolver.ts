import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BaseEditorResolver } from '@common/base/base-editor.resolver';
import { Guid } from '@common/types/guid';
import { UserServiceUser, UserServiceUserContactInfo, UserServiceUserProfile } from '@user-service/core/model/user.model';
import { UserService } from '@user-service/services/http/user.service';
import { takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';

@Injectable()
export class ApiClientEditorResolver extends BaseEditorResolver{

  constructor(private userService: UserService) {
    super();
  }

  public static lookupFields(): string[]{
    return [
			...BaseEditorResolver.lookupFields(),
            
            nameof<UserServiceUser>(x => x.name),
            nameof<UserServiceUser>(x => x.type),
            nameof<UserServiceUser>(x => x.hash),
            nameof<UserServiceUser>(x => x.updatedAt),
		]
  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    const fields = [
			...ApiClientEditorResolver.lookupFields(),
		];
    return this.userService.getSingle(Guid.parse(route.paramMap.get('id')), fields ).pipe(takeUntil(this._destroyed));
  }
}
