import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, Form, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ActivityTimeUnit } from '@app/core/enum/activity-time-unit.enum';
import { IsActive } from '@app/core/enum/is-active.enum';
import { ObjectRankRecalculationStrategyType } from '@app/core/enum/object-rank-recalculation-strategy-type.enum';
import { StrategyRangeInterpretation } from '@app/core/enum/strategy-range-interpretation.enum';
import { UpperBoundType } from '@app/core/enum/upper-bound-type.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';

@Component({
  selector: 'app-object-rank-recalculation-strategy-field',
  templateUrl: './object-rank-recalculation-strategy-field.component.html',
  styleUrls: ['./object-rank-recalculation-strategy-field.component.scss']
})
export class ObjectRankRecalculationStrategyFieldComponent implements OnInit {

  @Input() formGroup: FormGroup;
  @Output() indexEvent = new EventEmitter<FormGroup>()
  @Output() restoreEvent = new EventEmitter<FormGroup>()
  @Output() deleteEvent = new EventEmitter<FormGroup>()

  ctrlMap = new Map<string, AbstractControl>();
	stratType = ObjectRankRecalculationStrategyType;
  boundType = UpperBoundType;
  boundKeys = [];
  boundSymbols = ['<', '≤'];
  timeUnitType = ActivityTimeUnit;
  timeUnitKeys = [];
  rangeInterpretationType = StrategyRangeInterpretation;
  rangeInterpretationKeys = [];

  constructor(private formBuilder: FormBuilder, public enumUtils: AppEnumUtils, private cdr: ChangeDetectorRef) {
   }

  ngOnInit(): void {

    this.boundKeys = Object.keys(UpperBoundType).filter((item) => isFinite(Number(item))).map(item => Number(item));
    this.timeUnitKeys = Object.keys(ActivityTimeUnit).filter((item) => isFinite(Number(item))).map(item => Number(item));
    if(this.rangeInterpretationType) this.rangeInterpretationKeys = Object.keys(this.rangeInterpretationType).filter((item) => isFinite(Number(item))).map(item => Number(item));
    
    this.initStrategyToggles();
  }

  initStrategyToggles() {
    switch (this.formGroup.get('strategyType').value) {
      case ObjectRankRecalculationStrategyType.AllEqual:
        break;
      case ObjectRankRecalculationStrategyType.Liked:
        if( this.isDeselected('likePartition')) this.selectToggle(false,'likePartition')
        break;
      case ObjectRankRecalculationStrategyType.NetworkPopularity:
        if( this.isDeselected('networkPopularityPartition')) this.selectToggle(false,'networkPopularityPartition')
        break;
      case ObjectRankRecalculationStrategyType.NetworkTrust:
        if( this.isDeselected('networkTrustPartition')) this.selectToggle(false,'networkTrustPartition')
        break;
      case ObjectRankRecalculationStrategyType.ReviewDisciplineVisibility:
        if( this.isDeselected('reviewDisciplinePartition')) this.selectToggle(false,'reviewDisciplinePartition')
        break;
      case ObjectRankRecalculationStrategyType.AuthorDisciplineVisibility:
        if( this.isDeselected('authorTrustDisciplinePartition')) this.selectToggle(false,'authorTrustDisciplinePartition')
        if( this.isDeselected('authorFollowDisciplinePartition')) this.selectToggle(false,'authorFollowDisciplinePartition')
        break;
      case ObjectRankRecalculationStrategyType.AuthorActivity:
        if( this.isDeselected('authorObjectActivityPartition')) this.selectToggle(false,'authorObjectActivityPartition')
        if( this.isDeselected('authorReviewActivityPartition')) this.selectToggle(false,'authorReviewActivityPartition')
        break;
      default:
        break;
    }
  }

  getFormArrays() : [FormArray, FormArray][] {
    switch (this.formGroup.get('strategyType').value) {
      case ObjectRankRecalculationStrategyType.Liked:
        return [[this.formGroup.get('likePartition.rangeBounds') as FormArray, this.formGroup.get('likePartition.rangeValues') as FormArray]]
      case ObjectRankRecalculationStrategyType.NetworkPopularity:
        return [[this.formGroup.get('networkPopularityPartition.rangeBounds') as FormArray, this.formGroup.get('networkPopularityPartition.rangeValues') as FormArray]]
      case ObjectRankRecalculationStrategyType.NetworkTrust:
        return [[this.formGroup.get('networkTrustPartition.rangeBounds') as FormArray, this.formGroup.get('networkTrustPartition.rangeValues') as FormArray]]
      case ObjectRankRecalculationStrategyType.ReviewDisciplineVisibility:
        return [[this.formGroup.get('reviewDisciplinePartition.rangeBounds') as FormArray, this.formGroup.get('reviewDisciplinePartition.rangeValues') as FormArray]]
      case ObjectRankRecalculationStrategyType.AuthorDisciplineVisibility:
        return [[this.formGroup.get('authorTrustDisciplinePartition.rangeBounds') as FormArray, this.formGroup.get('authorTrustDisciplinePartition.rangeValues') as FormArray], 
                [this.formGroup.get('authorFollowDisciplinePartition.rangeBounds') as FormArray, this.formGroup.get('authorFollowDisciplinePartition.rangeValues') as FormArray]]
      case ObjectRankRecalculationStrategyType.AuthorActivity:
        return [[this.formGroup.get('authorObjectActivityPartition.rangeBounds') as FormArray, this.formGroup.get('authorObjectActivityPartition.rangeValues') as FormArray],
                [this.formGroup.get('authorReviewActivityPartition.rangeBounds') as FormArray, this.formGroup.get('authorReviewActivityPartition.rangeValues') as FormArray]]
      default:
        return [[null,null]]
    }
  }

  addRange(arrayIndex: number = 0) : void {
    let arr = this.getFormArrays();
    let [boundArray, valueArray] = arr[arrayIndex];

    let group = this.formBuilder.group({
      upperBoundType: [{value: UpperBoundType.Exclusive , disabled: false} ],
      value: [{value: undefined, disabled: false} ],
    });
    boundArray.push(group);

    let control = this.formBuilder.control({value: undefined, disabled: false});
    valueArray.insert(valueArray.length-1,control);

    this.cdr.detectChanges();
  }

  removeRange(i: number, arrayIndex : number = 0) : void {
    let arr = this.getFormArrays();
    let [boundArray, valueArray] = arr[arrayIndex];

    boundArray.removeAt(i);
    valueArray.removeAt(i);

    this.cdr.detectChanges();
  }

  toggleSlider(change: MatSlideToggleChange, fgNames: string) {
    this.selectToggle(change.checked,fgNames);
  }

  selectToggle(value: boolean, fgName: string) {
    if(!value) {
      let fg = this.formGroup.get(fgName);
      this.ctrlMap.set(fgName,fg);

      this.formGroup.setControl(fgName, new FormGroup({}));
      this.formGroup.get(fgName).disable();
    }
    else {
      let fg = this.ctrlMap.get(fgName);
      fg.enable();
      this.formGroup.setControl(fgName,fg);
    }
    this.cdr.detectChanges();;
  }

  isDeselected(fgName: string) {
    if(!this.isFormDeselected(fgName)) return this.isFormDeselected(fgName + '.rangeBounds');
    return true;
  }

  isFormDeselected(fgName: string) {
    let fg = this.formGroup.get(fgName);
    if(fg instanceof FormArray && (fg.length == 0 || ( fg.length == 1 && fg.value[0] == undefined) ) &&  fg.pristine) return true;
    if(fg instanceof FormControl && fg.value == null && fg.pristine) return true;
    if(fg instanceof FormGroup && Object.keys(fg.value).length == 0 && fg.pristine) return true;
    return false;
  }

  isActive(fg: any)
	{
		return fg.get('isActive').value == IsActive.Active;
	}

  emitRestoreEvent() : void {
    this.restoreEvent.emit(this.formGroup);
  }

  emitDeleteEvent() : void {
    this.deleteEvent.emit(this.formGroup);
  }

  emitIndexEvent() : void {
    this.indexEvent.emit(this.formGroup);
  }
}
