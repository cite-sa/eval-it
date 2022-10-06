import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AppUser } from '@app/core/model/app-user/app-user.model';
import { DataObjectType } from '@app/core/model/data-object-type/data-object-type.model';
import { AbsoluteDecimalInputOption, RegistrationInformationInputOption, ScaleInputOption, SelectionInputOption } from '@app/core/model/data-object-type/registration-information.model';
import { AbsoluteDecimalAttribute, DataObjectAttribute } from '@app/core/model/data-object/data-object-attribute.model';
import { DataObject } from '@app/core/model/data-object/data-object.model';
import { DataObjectService } from '@app/core/services/http/data-object.service';
import { BaseEditorResolver } from '@common/base/base-editor.resolver';
import { Guid } from '@common/types/guid';
import { takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';

@Injectable()
export class DataObjectEditorResolver extends BaseEditorResolver{

  constructor(private dataObjectService: DataObjectService) {
    super();
  }

  public static lookupFields(): string[]{
    const attrStr = "DataObjectAttributeData.";
    const typeStr = "DataObjectType.";
	const infoStr = "RegistrationInformation.";
	const userStr = "User.";

    return [
			...BaseEditorResolver.lookupFields(),
			nameof<DataObject>(x => x.title),
			nameof<DataObject>(x => x.description),
			nameof<DataObject>(x => x.userDefinedIds),
			nameof<DataObject>(x => x.userId),
			nameof<DataObject>(x => x.dataObjectTypeId),
			nameof<DataObject>(x => x.rankScore),
			nameof<DataObject>(x => x.attributeData),
			nameof<DataObject>(x => x.canEdit),
			userStr + nameof<AppUser>(x => x.id),
			userStr + nameof<AppUser>(x => x.name),
			attrStr + nameof<DataObjectAttribute>(x => x.attributeType),
			attrStr + nameof<DataObjectAttribute>(x => x.optionId),
			attrStr + nameof<AbsoluteDecimalAttribute>(x => x.values),
			typeStr + nameof<DataObjectType>(x => x.name),
			typeStr + nameof<DataObjectType>(x => x.id),
			typeStr + nameof<DataObjectType>(x => x.updatedAt),
			typeStr + infoStr + nameof<RegistrationInformationInputOption>(x => x.optionId),
			typeStr + infoStr + nameof<RegistrationInformationInputOption>(x => x.optionType),
			typeStr + infoStr + nameof<RegistrationInformationInputOption>(x => x.label),
			typeStr + infoStr + nameof<RegistrationInformationInputOption>(x => x.multiValue),
			typeStr + infoStr + nameof<RegistrationInformationInputOption>(x => x.isMandatory),
			typeStr + infoStr + nameof<RegistrationInformationInputOption>(x => x.isActive),
			typeStr + infoStr + nameof<AbsoluteDecimalInputOption>(x => x.measurementUnit),
			typeStr + infoStr + nameof<AbsoluteDecimalInputOption>(x => x.upperBound),
			typeStr + infoStr + nameof<AbsoluteDecimalInputOption>(x => x.lowerBound),
			typeStr + infoStr + nameof<AbsoluteDecimalInputOption>(x => x.validationRegexp),
			typeStr + infoStr + nameof<ScaleInputOption>(x => x.inputScale),
			typeStr + infoStr + nameof<ScaleInputOption>(x => x.scaleDisplayOption),
			typeStr + infoStr + nameof<SelectionInputOption>(x => x.inputSelectionOptions),
		]
  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    const fields = [
			...DataObjectEditorResolver.lookupFields(),
		];
    return this.dataObjectService.getSingle(Guid.parse(route.paramMap.get('id')), fields ).pipe(takeUntil(this._destroyed));
  }
}
