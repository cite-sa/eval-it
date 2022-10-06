import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';

@Component({
  selector: 'app-registration-information-inactive-field',
  templateUrl: './registration-information-inactive-field.component.html',
  styleUrls: ['./registration-information-inactive-field.component.scss']
})
export class RegistrationInformationInactiveFieldComponent implements OnInit {

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