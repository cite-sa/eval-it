import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { IconIdentifierType } from '@app/core/enum/icon-identifier-type.enum';
import { RegistrationInformationType } from '@app/core/enum/registration-information-type.enum';
import { ScaleDisplayOption } from '@app/core/enum/scale-display-option.enum';
import { ScaleIcons } from '@app/core/enum/scale-icons.enum';
import { UpperBoundType } from '@app/core/enum/upper-bound-type.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';

@Component({
  selector: 'app-registration-information-field',
  templateUrl: './registration-information-field.component.html',
  styleUrls: ['./registration-information-field.component.scss']
})
export class RegistrationInformationFieldComponent implements OnInit {

  @Input() formGroup: FormGroup;
  @Output() indexEvent = new EventEmitter<FormGroup>()

	infoType = RegistrationInformationType;
  scaleDisplayType = ScaleDisplayOption;
  scaleDisplayKeys = []
  scaleIcons = ScaleIcons;
	scaleIconKeys = [];
  boundType = UpperBoundType;
  boundKeys = [];
  boundSymbols = ['<', '≤'];
  lowerBoundSymbols = ['>', '≥'];


  constructor(private formBuilder: FormBuilder, public enumUtils: AppEnumUtils, private cdr: ChangeDetectorRef) {
   }

  ngOnInit(): void {
    this.scaleIconKeys = Object.keys(ScaleIcons);
    this.scaleDisplayKeys = Object.keys(ScaleDisplayOption).filter((item) => isFinite(Number(item))).map(item => Number(item));
    this.boundKeys = Object.keys(UpperBoundType).filter((item) => isFinite(Number(item))).map(item => Number(item));      
  }

  addSelection() : void {
    var arr = this.formGroup.get('inputSelectionOptions') as FormArray;
    var option = this.formBuilder.group({
      key: [{value: "", disabled: false} ],
      value: [{value: "", disabled: false} ]
    })
    arr.push(option);
    this.cdr.detectChanges();
  }

  removeSelection(i: number) : void {
    var arr = this.formGroup.get('inputSelectionOptions') as FormArray;
    arr.removeAt(i);
  }

  addScaleOption() : void {
    var arr = this.formGroup.get('inputScale') as FormArray;
    var newValue = arr.length;

    var option = this.formBuilder.group({
      label: [{value: "", disabled: false} ],
      iconIdentifier: [{value: "", disabled: false} ],
      idType: [{value: IconIdentifierType.Url, disabled: false} ],
      value: [{value: newValue, disabled: false} ]
    })
    arr.push(option);
    this.cdr.detectChanges();
  }

  removeScaleOption(i: number) : void {
    var arr = this.formGroup.get('inputScale') as FormArray;
    arr.removeAt(i);
    for (let index = i; index < arr.length; index++) {
      arr.controls[index].value.value -=1;
    }
  }

  isScaleOptionDisabled(val) : boolean {
    var arr = this.formGroup.get('inputScale') as FormArray;
    if( arr.controls.some(x => {
      if( x?.value == null) return false;
      var fg = x.value;
      return fg.iconIdentifier == this.scaleIcons[val];
    })) 
    {
      return true;
    } 

    return false;
  }

  emitIndexEvent() : void {
    this.indexEvent.emit(this.formGroup);
  }
}
