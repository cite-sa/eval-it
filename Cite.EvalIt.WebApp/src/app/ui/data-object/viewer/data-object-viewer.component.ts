import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataObjectAttributeType } from '@app/core/enum/data-object-attribute-type.enum';
import { IsActive } from '@app/core/enum/is-active.enum';
import { PersistentIDType } from '@app/core/enum/persistent-id-type.enum';
import { RegistrationInformationInputOption } from '@app/core/model/data-object-type/registration-information.model';
import { DataObject } from '@app/core/model/data-object/data-object.model';
import { AuthService } from '@app/core/services/ui/auth.service';
import { Guid } from '@common/types/guid';

@Component({
  selector: 'app-data-object-viewer',
  templateUrl: './data-object-viewer.component.html',
  styleUrls: ['./data-object-viewer.component.scss']
})
export class DataObjectViewerComponent implements OnInit {

	@Output() editorClicked : EventEmitter<any> = new EventEmitter();
	@Output() userClicked : EventEmitter<Guid> = new EventEmitter();
	@Output() typeClicked : EventEmitter<Guid> = new EventEmitter();

  	dataObject: DataObject = null;

	attrType = DataObjectAttributeType;
	attrTypeKeys = [];

	pidType = PersistentIDType;
	pidTypeKeys = [];

	constructor(
		protected route: ActivatedRoute,
		public authService: AuthService,
	) {
	}
  
	ngOnInit(): void {
		const entity = this.route.snapshot.data['entity'] as DataObject;
		this.dataObject = entity;
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

	userNavigate(userId: Guid) {
		this.userClicked.emit(userId);
	}

	onUserClicked() {
		if( this.dataObject.userId != null) this.userClicked.emit(this.dataObject.userId);
	}

	onTypeClicked() {
		if( this.dataObject.dataObjectTypeId != null) this.typeClicked.emit(this.dataObject.dataObjectTypeId);
	}

	onEdit() {
		this.editorClicked.emit();
	}
}
