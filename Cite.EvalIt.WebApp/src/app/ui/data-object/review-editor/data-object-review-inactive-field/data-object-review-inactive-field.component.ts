import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {  FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DataObjectAttributeType } from '@app/core/enum/data-object-attribute-type.enum';
import { EvaluationConfigurationType } from '@app/core/enum/evaluation-configuration-type.enum';
import { RegistrationInformationType } from '@app/core/enum/registration-information-type.enum';
import { ReviewEvaluationType } from '@app/core/enum/review-evaluation-type.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { BaseEvaluationOption, ScaleEvaluationOption, SelectionEvaluationOption } from '@app/core/model/data-object-type/evaluation-configuration.model';
import { RegistrationInformationInputOption, ScaleInputOption, SelectionInputOption } from '@app/core/model/data-object-type/registration-information.model';

@Component({
  selector: 'app-data-object-review-inactive-field',
  templateUrl: './data-object-review-inactive-field.component.html',
  styleUrls: ['./data-object-review-inactive-field.component.scss']
})
export class DataObjectReviewInactiveFieldComponent implements OnInit {

  @Input() formGroup: FormGroup;
  @Input() evaluationOption: BaseEvaluationOption;
  @Output() indexEvent = new EventEmitter<FormGroup>()

	evalType = ReviewEvaluationType;

  constructor(private formBuilder: FormBuilder, public enumUtils: AppEnumUtils, private cdr: ChangeDetectorRef) {
  
  }

  ngOnInit(): void {
  }

  getEvaluationSelectionOptions() {
    var sel = this.evaluationOption as SelectionEvaluationOption;
    return sel.evaluationSelectionOptions;
  }

  getEvaluationScale() {
    var sel = this.evaluationOption as ScaleEvaluationOption;
    return sel.evaluationScale;
  }

  valueDisplay() {
    var arr = this.formGroup.get('values') as FormArray;
    var displayStr = "";

    if(this.evaluationOption.optionType == EvaluationConfigurationType.SelectionEvaluationOption) {
      displayStr = arr.controls.map(x => this.getEvaluationSelectionOptions().find(y => y.key == x.value)?.value).join(' , ');
    }
    else if(this.evaluationOption.optionType == EvaluationConfigurationType.ScaleEvaluationOption) {
      displayStr = arr.controls.map(x => this.getEvaluationScale().find(y => y.value === x.value)?.label).join(' , ');
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
