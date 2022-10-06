import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';

@Component({
  selector: 'app-evaluation-configuration-inactive-field',
  templateUrl: './evaluation-configuration-inactive-field.component.html',
  styleUrls: ['./evaluation-configuration-inactive-field.component.scss']
})
export class EvaluationConfigurationInactiveFieldComponent implements OnInit {

  @Input() formGroup: FormGroup;
  @Input() isUsed: boolean;
  @Output() indexEvent = new EventEmitter<FormGroup>()
  
  constructor(public enumUtils: AppEnumUtils) { }

  ngOnInit(): void {
      
  }

  emitIndexEvent() : void {
    this.indexEvent.emit(this.formGroup);
  }
}