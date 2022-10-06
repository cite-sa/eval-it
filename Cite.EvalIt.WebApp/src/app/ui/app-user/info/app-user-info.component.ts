import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppUser } from '@app/core/model/app-user/app-user.model';
import { Tag } from '@app/core/model/tag/tag.model';
import { AppUserService } from '@app/core/services/http/app-user.service';
import { Guid } from '@common/types/guid';
import { switchMap } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';

@Component({
  selector: 'app-user-app-info',
  templateUrl: './app-user-info.component.html',
  styleUrls: ['./app-user-info.component.scss']
})
export class AppUserInfoComponent implements OnInit {

  constructor(private userService: AppUserService, protected route: ActivatedRoute) { }
  
	id: Guid;
  user: AppUser;

  ngOnInit(): void {
    this.route.url.pipe(
      switchMap(data => {

        var userFields =  [
          nameof<AppUser>(x => x.id),
          nameof<AppUser>(x => x.name),
          "tag." + nameof<Tag>(x => x.id),
          "tag." + nameof<Tag>(x => x.label),
          "tag." + nameof<Tag>(x => x.type)
        ]
  
        this.id = Guid.parse(data[0].path);
        return this.userService.getSingle(this.id, userFields)
      })
    ).subscribe(res => {this.user = res});
  }
}
