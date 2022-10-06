import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DataObjectAttributeType } from '@app/core/enum/data-object-attribute-type.enum';
import { RegistrationInformationType } from '@app/core/enum/registration-information-type.enum';
import { ScaleDisplayOption } from '@app/core/enum/scale-display-option.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { RegistrationInformationInputOption, ScaleInputOption, SelectionInputOption } from '@app/core/model/data-object-type/registration-information.model';
import { AbsoluteDecimalAttribute, AbsoluteIntegerAttribute, DataObjectAttribute, PercentageAttribute, ScaleAttribute, SelectionAttribute, TextAttribute } from '@app/core/model/data-object/data-object-attribute.model';

@Component({
  selector: 'app-data-object-attribute-field-viewer',
  templateUrl: './data-object-attribute-field-viewer.component.html',
  styleUrls: ['./data-object-attribute-field-viewer.component.scss']
})
export class DataObjectAttributeFieldViewerComponent implements OnInit {

  @Input() attribute: DataObjectAttribute;
  @Input() inputOption: RegistrationInformationInputOption;

  scaleDisplayType = ScaleDisplayOption;
	attrType = DataObjectAttributeType;
  vals = null;

  constructor(public enumUtils: AppEnumUtils, private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    if(this.inputOption.optionType == RegistrationInformationType.SelectionInputOption) {
      this.vals = (this.inputOption as SelectionInputOption).inputSelectionOptions.map(x => x.value);
    }
  }

  getInputSelectionOptions() {
    var sel = this.inputOption as SelectionInputOption;
    return sel.inputSelectionOptions;
  }

  getInputScale() {
    var sel = this.inputOption as ScaleInputOption;
    return sel.inputScale;
  }

  valueDisplay() {
    var attr = this.attribute as AbsoluteDecimalAttribute | AbsoluteIntegerAttribute | PercentageAttribute | TextAttribute | ScaleAttribute | SelectionAttribute;
    var arr = attr.values
    var displayStr = "";

    if(this.inputOption.optionType == RegistrationInformationType.SelectionInputOption) {
      displayStr = arr.map(x => this.getInputSelectionOptions().find(y => y.key == x)?.value).join(' , ');
    }
    else if(this.inputOption.optionType == RegistrationInformationType.ScaleInputOption) {
      displayStr = arr.map(x => this.getInputScale().find(y => y.value === x)?.label).join(' , ');
    }
    else {
      displayStr = arr.map(x => {
        if( x && x.length  > 20 ) return x.slice(0, 17) + "...";
        return x;
      }).join(' , ');
    }
    return displayStr == "" ? "(No Values)" : displayStr;
  }

  // formatLabel = (value: number) => {
  //   var scale = this.inputOption as ScaleInputOption;
  //   return !this.inputOption ? "" : scale.inputScale[value].label;
  // }
}
