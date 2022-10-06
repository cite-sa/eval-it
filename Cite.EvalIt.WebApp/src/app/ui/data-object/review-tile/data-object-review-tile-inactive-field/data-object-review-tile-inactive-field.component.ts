import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataObjectAttributeType } from '@app/core/enum/data-object-attribute-type.enum';
import { EvaluationConfigurationType } from '@app/core/enum/evaluation-configuration-type.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { BaseEvaluationOption, ScaleEvaluationOption, SelectionEvaluationOption } from '@app/core/model/data-object-type/evaluation-configuration.model';
import { AbsoluteDecimalEvaluation, AbsoluteIntegerEvaluation, PercentageEvaluation, ReviewEvaluation, ScaleEvaluation, SelectionEvaluation, TextEvaluation } from '@app/core/model/data-object/data-object-review.model';

@Component({
  selector: 'app-data-object-review-tile-inactive-field',
  templateUrl: './data-object-review-tile-inactive-field.component.html',
  styleUrls: ['./data-object-review-tile-inactive-field.component.scss']
})
export class DataObjectReviewTileInactiveFieldComponent implements OnInit {

  @Input() evaluation: ReviewEvaluation;
  @Input() evalOption: BaseEvaluationOption;
  @Output() indexEvent = new EventEmitter<FormGroup>()

	attrType = DataObjectAttributeType;

  constructor(private formBuilder: FormBuilder, public enumUtils: AppEnumUtils, private cdr: ChangeDetectorRef) {
  
  }

  ngOnInit(): void {
  }

  getEvaluationSelectionOptions() {
    var sel = this.evalOption as SelectionEvaluationOption;
    return sel.evaluationSelectionOptions;
  }

  getEvaluationScale() {
    var sel = this.evalOption as ScaleEvaluationOption;
    return sel.evaluationScale;
  }

  valueDisplay() {
    var evaluation = this.evaluation as AbsoluteDecimalEvaluation | AbsoluteIntegerEvaluation | PercentageEvaluation | TextEvaluation | ScaleEvaluation | SelectionEvaluation;
    var arr = evaluation.values;
    var displayStr = "";

    if(this.evalOption.optionType == EvaluationConfigurationType.SelectionEvaluationOption) {
      displayStr = arr.map(x => this.getEvaluationSelectionOptions().find(y => y.key == x)?.value).join(' , ');
    }
    else if(this.evalOption.optionType == EvaluationConfigurationType.ScaleEvaluationOption) {
      displayStr = arr.map(x => this.getEvaluationScale().find(y => y.value === x)?.label).join(' , ');
    }
    else {
      displayStr = arr.map(x => {
        if( x && x.length  > 20 ) return x.slice(0, 17) + "...";
        return x;
      }).join(' , ');
    }
    return displayStr == "" ? "(No Values)" : displayStr;
  }
}
