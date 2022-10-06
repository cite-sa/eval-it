import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {  FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DataObjectAttributeType } from '@app/core/enum/data-object-attribute-type.enum';
import { RegistrationInformationType } from '@app/core/enum/registration-information-type.enum';
import { ScaleDisplayOption } from '@app/core/enum/scale-display-option.enum';
import { UpperBoundType } from '@app/core/enum/upper-bound-type.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { BoundedType } from '@app/core/model/data-object-type/ranking-methodology.model';
import { AbsoluteDecimalInputOption, AbsoluteIntegerInputOption, PercentageInputOption, RegistrationInformationInputOption, ScaleInputOption, SelectionInputOption, TextInputOption } from '@app/core/model/data-object-type/registration-information.model';
import { AbsoluteDecimalAttributeModel, AbsoluteIntegerAttributeModel, PercentageAttributeModel, ScaleAttributeModel, SelectionAttributeModel, TextAttributeModel } from '@app/ui/data-object/editor/data-object-editor.model';

@Component({
  selector: 'app-data-object-attribute-field',
  templateUrl: './data-object-attribute-field.component.html',
  styleUrls: ['./data-object-attribute-field.component.scss']
})
export class DataObjectAttributeFieldComponent implements OnInit {

  @Input() formGroup: FormGroup;
  @Input() inputOption: RegistrationInformationInputOption;
  @Input() added: boolean;
  @Input() removed: boolean;
  
  @Output() removeEvent = new EventEmitter<FormGroup>()
  @Output() addEvent = new EventEmitter<FormGroup>()

	attrType = DataObjectAttributeType;
  infoType = RegistrationInformationType;
  scaleDisplayType = ScaleDisplayOption;
  
  constructor(private formBuilder: FormBuilder, public enumUtils: AppEnumUtils, private cdr: ChangeDetectorRef) {
  
  }

  ngOnInit(): void {
    var arr = this.formGroup.get('values') as FormArray;
    if( this.inputOption.isMandatory && arr.controls.length == 0 ) this.addValue();
  }

  canAddValue() {
    var arr = this.formGroup.get('values') as FormArray;
    return arr.controls.length == 0 || this.inputOption.multiValue;
  }

  addValue() {
    var arr = this.formGroup.get('values') as FormArray;
    var model : AbsoluteDecimalAttributeModel | AbsoluteIntegerAttributeModel | PercentageAttributeModel | TextAttributeModel | ScaleAttributeModel | SelectionAttributeModel = null;
    var regInfoOption = null;
    switch (this.inputOption.optionType) {
      case RegistrationInformationType.AbsoluteDecimalInputOption:
        model = new AbsoluteDecimalAttributeModel();
        regInfoOption = (this.inputOption as AbsoluteDecimalInputOption);
        break;
      case RegistrationInformationType.AbsoluteIntegerInputOption:
        model = new AbsoluteIntegerAttributeModel();
        regInfoOption = (this.inputOption as AbsoluteIntegerInputOption);
        break;
      case RegistrationInformationType.PercentageInputOption:
        model = new PercentageAttributeModel();
        regInfoOption = (this.inputOption as PercentageInputOption);
        break;
      case RegistrationInformationType.TextInputOption:
        model = new TextAttributeModel();
        regInfoOption = (this.inputOption as TextInputOption);
        break;
      case RegistrationInformationType.ScaleInputOption:
        model = new ScaleAttributeModel();
        regInfoOption = (this.inputOption as ScaleInputOption);
        break;
      case RegistrationInformationType.SelectionInputOption:
        model = new SelectionAttributeModel();
        regInfoOption = (this.inputOption as SelectionInputOption);
        break;
      default:
        break;
    }
    var option = model.buildValueControl(null, '', false, regInfoOption);      
    arr.push(option);
    this.cdr.detectChanges();
  }

  canRemoveValue() {
    var arr = this.formGroup.get('values') as FormArray;
    return arr.controls.length > 1 || (!this.inputOption.isMandatory && arr.controls.length > 0);
  }

  removeValue(i: number) {
    var arr = this.formGroup.get('values') as FormArray;
    arr.removeAt(i);
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

  formatLabel = (value: number) => {
    var scale = this.inputOption as ScaleInputOption;
    return !this.inputOption ? "" : scale.inputScale[value].label;
  }

  boundsDisplay( low: BoundedType<number>, high: BoundedType<number>) {
    let str = "";
    if( low?.value != null ) {
      str += low.value;
      str += low.upperBoundType == UpperBoundType.Exclusive ? " < x " : " <= x ";
    }
    if( high?.value != null ) {
      if( low?.value == null) str += "x ";
      str += high.upperBoundType == UpperBoundType.Exclusive ? "<" : "<=";
      str += high.value;
    }
    return str;
  }


  emitRemoveEvent() : void {
    this.removeEvent.emit(this.formGroup);
  }

  emitAddEvent() : void {
    this.addEvent.emit(this.formGroup);
  }
}
