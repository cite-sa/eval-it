import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { RankingProfileType } from '@app/core/enum/ranking-profile-type.enum';
import { UpperBoundType } from '@app/core/enum/upper-bound-type.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { BaseEvaluationOption } from '@app/core/model/data-object-type/evaluation-configuration.model';

@Component({
  selector: 'app-ranking-profile-field',
  templateUrl: './ranking-profile-field.component.html',
  styleUrls: ['./ranking-profile-field.component.scss']
})
export class RankingProfileFieldComponent implements OnInit {

  @Input() formGroup: FormGroup;
  @Input() evalOption: BaseEvaluationOption;
  @Output() indexEvent = new EventEmitter<FormGroup>();

	profileType = RankingProfileType;
  boundType = UpperBoundType;
  boundKeys = [];
  boundSymbols = ['<', '≤'];

  constructor(private formBuilder: FormBuilder, public enumUtils: AppEnumUtils, private cdr: ChangeDetectorRef) {
   }

  ngOnInit(): void {
    this.boundKeys = Object.keys(UpperBoundType).filter((item) => isFinite(Number(item))).map(item => Number(item));      
  }

  addRange() : void {
    let boundArray = this.formGroup.get('mappedRangeBounds') as FormArray;
    let valueArray = this.formGroup.get('mappedUserValues') as FormArray;
  
    let group = this.formBuilder.group({
      upperBoundType: [{value: UpperBoundType.Exclusive , disabled: false} ],
      value: [{value: undefined, disabled: false} ],
    });
    boundArray.push(group);

    let control = this.formBuilder.control({value: undefined, disabled: false});
    valueArray.insert(valueArray.length-1,control);

    this.cdr.detectChanges();
  }

  removeRange(i: number) : void {
    let boundArray = this.formGroup.get('mappedRangeBounds') as FormArray;
    let valueArray = this.formGroup.get('mappedUserValues') as FormArray;

    boundArray.removeAt(i);
    valueArray.removeAt(i);

    this.cdr.detectChanges();
  }

  emitIndexEvent() : void {
    this.indexEvent.emit(this.formGroup);
  }

}
