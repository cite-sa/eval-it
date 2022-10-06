import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { BaseEvaluationOption } from '@app/core/model/data-object-type/evaluation-configuration.model';

@Component({
  selector: 'app-ranking-profile-inactive-field',
  templateUrl: './ranking-profile-inactive-field.component.html',
  styleUrls: ['./ranking-profile-inactive-field.component.scss']
})
export class RankingProfileInactiveFieldComponent implements OnInit {

  @Input() formGroup: FormGroup;
  @Input() evalOption: BaseEvaluationOption;
  @Output() indexEvent = new EventEmitter<FormGroup>()
  
  constructor(public enumUtils: AppEnumUtils) { }

  ngOnInit(): void {
  }

  emitIndexEvent() : void {
    this.indexEvent.emit(this.formGroup);
  }
}