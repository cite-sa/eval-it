import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { StrategyRangeInterpretation } from '@app/core/enum/strategy-range-interpretation.enum';
import { UpperBoundType } from '@app/core/enum/upper-bound-type.enum';

@Component({
  selector: 'app-partition-form-display',
  templateUrl: './partition-form-display.component.html',
  styleUrls: ['./partition-form-display.component.css']
})
export class PartitionFormDisplayComponent implements OnInit {

  @Input() formGroup: FormGroup;
  @Input() partitionTypeString: string;
  @Output() addEvent = new EventEmitter<void>();
  @Output() removeEvent = new EventEmitter<number>();
  
  boundType = UpperBoundType;
  boundKeys = [];
  boundSymbols = ['<', '≤'];
  
  rangeInterpretationType = StrategyRangeInterpretation;
  rangeInterpretationKeys = [];

  constructor() { }

  ngOnInit(): void {
    this.boundKeys = Object.keys(UpperBoundType).filter((item) => isFinite(Number(item))).map(item => Number(item));
    if(this.rangeInterpretationType) this.rangeInterpretationKeys = Object.keys(this.rangeInterpretationType).filter((item) => isFinite(Number(item))).map(item => Number(item));

  }

  addRange() {
    this.addEvent.emit();
  }


  removeRange(i) {
    this.removeEvent.emit(i);
  }
}
