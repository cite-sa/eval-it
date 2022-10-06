import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { EvaluationConfigurationType } from '@app/core/enum/evaluation-configuration-type.enum';
import { ReviewEvaluationType } from '@app/core/enum/review-evaluation-type.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { BaseEvaluationOption, ScaleEvaluationOption, SelectionEvaluationOption } from '@app/core/model/data-object-type/evaluation-configuration.model';
import { AbsoluteDecimalEvaluation, AbsoluteIntegerEvaluation, PercentageEvaluation, ReviewEvaluation, ScaleEvaluation, SelectionEvaluation, TextEvaluation } from '@app/core/model/data-object/data-object-review.model';

@Component({
  selector: 'app-data-object-review-tile-field',
  templateUrl: './data-object-review-tile-field.component.html',
  styleUrls: ['./data-object-review-tile-field.component.scss']
})
export class DataObjectReviewTileFieldComponent implements OnInit {

  @Input() evaluation: AbsoluteDecimalEvaluation | AbsoluteIntegerEvaluation | PercentageEvaluation | TextEvaluation | ScaleEvaluation | SelectionEvaluation;
  @Input() evalOption: BaseEvaluationOption;
  
	evalType = ReviewEvaluationType;
  vals = null;

  constructor(public enumUtils: AppEnumUtils, private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    if(this.evalOption.optionType == EvaluationConfigurationType.SelectionEvaluationOption) {
      this.vals = (this.evalOption as SelectionEvaluationOption).evaluationSelectionOptions.map(x => x.value);
    }
  }

  getSelectionValue(key) {
    return this.getEvaluationSelectionOptions().find(y => y.key == key)?.value;
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
