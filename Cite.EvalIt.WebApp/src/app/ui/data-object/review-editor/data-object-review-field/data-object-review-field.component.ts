import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { EvaluationConfigurationType } from '@app/core/enum/evaluation-configuration-type.enum';
import { ReviewEvaluationType } from '@app/core/enum/review-evaluation-type.enum';
import { ScaleDisplayOption } from '@app/core/enum/scale-display-option.enum';
import { UpperBoundType } from '@app/core/enum/upper-bound-type.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { AbsoluteDecimalEvaluationOption, AbsoluteIntegerEvaluationOption, BaseEvaluationOption, PercentageEvaluationOption, ScaleEvaluationOption, SelectionEvaluationOption, TextEvaluationOption } from '@app/core/model/data-object-type/evaluation-configuration.model';
import { BoundedType } from '@app/core/model/data-object-type/ranking-methodology.model';
import { AbsoluteDecimalEvaluationModel, AbsoluteIntegerEvaluationModel, PercentageEvaluationModel, ScaleEvaluationModel, SelectionEvaluationModel, TextEvaluationModel } from '@app/ui/data-object/review-editor/data-object-review-editor.model';

@Component({
  selector: 'app-data-object-review-field',
  templateUrl: './data-object-review-field.component.html',
  styleUrls: ['./data-object-review-field.component.scss']
})
export class DataObjectReviewFieldComponent implements OnInit {

  @Input() formGroup: FormGroup;
  @Input() evaluationOption: BaseEvaluationOption;
  @Input() added: boolean;
  @Input() removed: boolean;
  
  @Output() removeEvent = new EventEmitter<FormGroup>()
  @Output() addEvent = new EventEmitter<FormGroup>()

	evalType = ReviewEvaluationType;
  configType = EvaluationConfigurationType;
  scaleDisplayType = ScaleDisplayOption;

  constructor(private formBuilder: FormBuilder, public enumUtils: AppEnumUtils, private cdr: ChangeDetectorRef) {
  
  }

  ngOnInit(): void {
    var arr = this.formGroup.get('values') as FormArray;
    if( this.evaluationOption.isMandatory && arr.controls.length == 0 ) this.addValue();
  }

  canAddValue() {
    var arr = this.formGroup.get('values') as FormArray;
    return arr.controls.length == 0;
  }

  addValue() {
    var arr = this.formGroup.get('values') as FormArray;
    var model : AbsoluteDecimalEvaluationModel | AbsoluteIntegerEvaluationModel | PercentageEvaluationModel | TextEvaluationModel | ScaleEvaluationModel | SelectionEvaluationModel = null;
    var evalConfigOption = null;
    switch (this.evaluationOption.optionType) {
      case EvaluationConfigurationType.AbsoluteDecimalEvaluationOption:
        model = new AbsoluteDecimalEvaluationModel();
        evalConfigOption = (this.evaluationOption as AbsoluteDecimalEvaluationOption);
        break;
      case EvaluationConfigurationType.AbsoluteIntegerEvaluationOption:
        model = new AbsoluteIntegerEvaluationModel();
        evalConfigOption = (this.evaluationOption as AbsoluteIntegerEvaluationOption);
        break;
      case EvaluationConfigurationType.PercentageEvaluationOption:
        model = new PercentageEvaluationModel();
        evalConfigOption = (this.evaluationOption as PercentageEvaluationOption);
        break;
      case EvaluationConfigurationType.TextEvaluationOption:
        model = new TextEvaluationModel();
        evalConfigOption = (this.evaluationOption as TextEvaluationOption);
        break;
      case EvaluationConfigurationType.ScaleEvaluationOption:
        model = new ScaleEvaluationModel();
        evalConfigOption = (this.evaluationOption as ScaleEvaluationOption);
        break;
      case EvaluationConfigurationType.SelectionEvaluationOption:
        model = new SelectionEvaluationModel();
        evalConfigOption = (this.evaluationOption as SelectionEvaluationOption);
        break;
      default:
        break;
    }
    var option = model.buildValueControl(null, '', false, evalConfigOption);      
    arr.push(option);
    this.cdr.detectChanges();
  }

  canRemoveValue() {
    var arr = this.formGroup.get('values') as FormArray;
    return arr.controls.length > 1 || (!this.evaluationOption.isMandatory && arr.controls.length > 0);
  }

  removeValue(i: number) {
    var arr = this.formGroup.get('values') as FormArray;
    arr.removeAt(i);
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

  formatLabel = (value: number) => {
    var scale = this.evaluationOption as ScaleEvaluationOption;
    return !this.evaluationOption ? "" : scale.evaluationScale[value].label;
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
