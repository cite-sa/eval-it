import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {  FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DataObjectAttributeType } from '@app/core/enum/data-object-attribute-type.enum';
import { RegistrationInformationType } from '@app/core/enum/registration-information-type.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { RegistrationInformationInputOption, ScaleInputOption, SelectionInputOption } from '@app/core/model/data-object-type/registration-information.model';

@Component({
  selector: 'app-data-object-attribute-inactive-field',
  templateUrl: './data-object-attribute-inactive-field.component.html',
  styleUrls: ['./data-object-attribute-inactive-field.component.scss']
})
export class DataObjectAttributeInactiveFieldComponent implements OnInit {

  @Input() formGroup: FormGroup;
  @Input() inputOption: RegistrationInformationInputOption;
  @Output() indexEvent = new EventEmitter<FormGroup>()

	attrType = DataObjectAttributeType;

  constructor(private formBuilder: FormBuilder, public enumUtils: AppEnumUtils, private cdr: ChangeDetectorRef) {
  
  }

  ngOnInit(): void {
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
    var arr = this.formGroup.get('values') as FormArray;
    var displayStr = "";

    if(this.inputOption.optionType == RegistrationInformationType.SelectionInputOption) {
      displayStr = arr.controls.map(x => this.getInputSelectionOptions().find(y => y.key == x.value)?.value).join(' , ');
    }
    else if(this.inputOption.optionType == RegistrationInformationType.ScaleInputOption) {
      displayStr = arr.controls.map(x => this.getInputScale().find(y => y.value === x.value)?.label).join(' , ');
    }
    else {
      displayStr = arr.controls.map(x => {
        if( x.value && x.value.length  > 20 ) return x.value.slice(0, 17) + "...";
        return x.value;
      }).join(' , ');
    }
    
    return displayStr == "" ? "(No Values)" : displayStr;
  }
}
