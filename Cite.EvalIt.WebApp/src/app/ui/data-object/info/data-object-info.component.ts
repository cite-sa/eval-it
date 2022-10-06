import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { DataObject } from '@app/core/model/data-object/data-object.model';
import { Tag } from '@app/core/model/tag/tag.model';
import { DataObjectService } from '@app/core/services/http/data-object.service';
import { AuthService } from '@app/core/services/ui/auth.service';
import { QueryParamsService } from '@app/core/services/ui/query-params.service';
import { Guid } from '@common/types/guid';
import { switchMap } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';

@Component({
  selector: 'data-object-app-info',
  templateUrl: './data-object-info.component.html',
  styleUrls: ['./data-object-info.component.scss']
})
export class DataObjectInfoComponent implements OnInit {

  constructor(private objectService: DataObjectService,
              protected route: ActivatedRoute,
              protected queryParamsService: QueryParamsService,
              protected router: Router,
              public authService: AuthService,
              ) { }
  
	id: Guid;
  object: DataObject;
	lookupParams: any;
	protected lv = 0;

  ngOnInit(): void {
    this.route.url.pipe(switchMap(data => {
      let tagStr = "Tag.";
      var objectFields =  [
        nameof<DataObject>(x => x.id),
        nameof<DataObject>(x => x.title),
        nameof<DataObject>(x => x.canWriteReview),
        tagStr + nameof<Tag>(x => x.id),
        tagStr + nameof<Tag>(x => x.label),
        tagStr + nameof<Tag>(x => x.type),
    ]

      this.id = Guid.parse(data[0].path);
      return this.objectService.getSingle(this.id,objectFields);

    })).subscribe(res => { this.object = res})

    this.route.queryParamMap.pipe().subscribe((params: ParamMap) => {
			// If lookup is on the query params load it
			if (params.keys.length > 0 && params.has('lookup')) {
				this.lookupParams = this.queryParamsService.deSerializeLookup(params.get('lookup'));
			}
		});
  }

  toEditor() : void {
    this.navigateTo('./editor');
  }
  
  toObjectType(typeId: Guid) : void {
    if( this.authService.hasPermission(this.authService.permissionEnum.ViewDataObjectTypesPage)) this.navigateTo('/data-object-type/' + typeId);
  }

  toUserProfile(userId: Guid) : void {
    if( this.authService.hasPermission(this.authService.permissionEnum.ViewUserProfilePage)) this.navigateTo('/user-public-profile/' + userId);
  }

  navigateTo(url: string) {
		this.router.navigate([url], { relativeTo: this.route, queryParams: { 'lookup': this.queryParamsService.serializeLookup(this.lookupParams), 'lv': ++this.lv }});
	}
}
