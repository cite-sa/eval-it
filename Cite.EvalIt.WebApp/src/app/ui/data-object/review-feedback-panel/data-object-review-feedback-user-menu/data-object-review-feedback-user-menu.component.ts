import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Guid } from '@common/types/guid';

@Component({
  selector: 'app-data-object-review-feedback-user-menu',
  templateUrl: './data-object-review-feedback-user-menu.component.html',
  styleUrls: ['./data-object-review-feedback-user-menu.component.scss']
})
export class DataObjectReviewFeedbackUserMenuComponent implements OnInit {

  @Input() userList = [];
  @Input() anonymousCount: number;

  @Output() nameClicked: EventEmitter<Guid> = new EventEmitter<Guid>();
  
  maxUsersToDisplay : number = 2;

  constructor() { }

  ngOnInit(): void {
  }

  usersToBeDisplayed() {
    return this.userList.slice(0,this.maxUsersToDisplay);
  }

  getUserCount(): number {
    if( this.userList.length <= this.maxUsersToDisplay ) return 0;
    return (this.userList.length -1 ) + this.anonymousCount - this.maxUsersToDisplay;
  }
  
  onUserClicked(user: any) {
		if( user.id) this.nameClicked.emit(user.id);
	}

}
