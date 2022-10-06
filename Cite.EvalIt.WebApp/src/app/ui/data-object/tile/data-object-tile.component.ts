import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataObjectAttributeType } from '@app/core/enum/data-object-attribute-type.enum';
import { IsActive } from '@app/core/enum/is-active.enum';
import { PersistentIDType } from '@app/core/enum/persistent-id-type.enum';
import { AppUser } from '@app/core/model/app-user/app-user.model';
import { RegistrationInformationInputOption } from '@app/core/model/data-object-type/registration-information.model';
import { DataObject } from '@app/core/model/data-object/data-object.model';
import { AppUserService } from '@app/core/services/http/app-user.service';
import { AuthService } from '@app/core/services/ui/auth.service';
import { RowActivateEvent } from '@common/modules/listing/listing.component';
import { Guid } from '@common/types/guid';
import { nameof } from 'ts-simple-nameof';

@Component({
  selector: 'app-data-object-tile',
  templateUrl: './data-object-tile.component.html',
  styleUrls: ['./data-object-tile.component.scss']
})
export class DataObjectTileComponent implements OnInit {

	@Output() editClicked : EventEmitter<RowActivateEvent> = new EventEmitter();
	@Output() viewClicked : EventEmitter<RowActivateEvent> = new EventEmitter();
  	@Input() dataObject: DataObject = null;

	author: string = null;

	attrType = DataObjectAttributeType;
	attrTypeKeys = [];

	pidType = PersistentIDType;
	pidTypeKeys = [];

	constructor(
		protected route: ActivatedRoute,
		public authService: AuthService,
		private userService: AppUserService
	) {
	}
  
	ngOnInit(): void {
		if( this.dataObject.userId) this.userService.getSingle(this.dataObject.userId, [nameof<AppUser>(x => x.id), nameof<AppUser>(x => x.name)]).subscribe( data => this.author = data.name);
	}
  
	getOptionById(optionId: Guid): RegistrationInformationInputOption
	{
		var x = this.dataObject.dataObjectType?.info?.inputOptions.find(x => x?.optionId == optionId);
		return x;
	}

	getSortedAttributes() {
		var arr = this.dataObject.attributeData.attributes;
		return arr.sort((a,b) =>{
			let aVal = this.getOptionById(a.optionId)?.isActive == IsActive.Active ? 1 : 0;
			let bVal = this.getOptionById(b.optionId)?.isActive == IsActive.Active ? 1 : 0;
			return bVal - aVal;
		})
	}

	onEditClicked() {
		let event : RowActivateEvent = {
			value: undefined,
			type: 'click',
			event: undefined,
			row: this.dataObject,
			column: undefined,
			cellElement: undefined,
			rowElement: undefined
		}
		this.editClicked.emit(event);
	}

	onViewClicked() {
		let event : RowActivateEvent = {
			value: undefined,
			type: 'click',
			event: undefined,
			row: this.dataObject,
			column: undefined,
			cellElement: undefined,
			rowElement: undefined
		}
		this.viewClicked.emit(event);
	}
}
