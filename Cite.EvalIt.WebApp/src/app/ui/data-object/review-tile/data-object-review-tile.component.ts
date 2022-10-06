import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IsActive } from '@app/core/enum/is-active.enum';
import { ReviewAnonymity } from '@app/core/enum/review-anonymity.enum';
import { ReviewEvaluationType } from '@app/core/enum/review-evaluation-type.enum';
import { ReviewVisibility } from '@app/core/enum/review-visibility.enum';
import { DataObjectType } from '@app/core/model/data-object-type/data-object-type.model';
import { BaseEvaluationOption } from '@app/core/model/data-object-type/evaluation-configuration.model';
import { DataObjectReviewFeedback } from '@app/core/model/data-object/data-object-review-feedback.model';
import { DataObjectReview } from '@app/core/model/data-object/data-object-review.model';
import { AuthService } from '@app/core/services/ui/auth.service';
import { RowActivateEvent } from '@common/modules/listing/listing.component';
import { Guid } from '@common/types/guid';

@Component({
  selector: 'app-data-object-review-tile',
  templateUrl: './data-object-review-tile.component.html',
  styleUrls: ['./data-object-review-tile.component.scss']
})
export class DataObjectReviewTileComponent implements OnInit {

	@Input() review: DataObjectReview = null;
	@Input() feedback: DataObjectReviewFeedback[] = [];

	@Output() editClicked: EventEmitter<RowActivateEvent> = new EventEmitter<RowActivateEvent>();
	@Output() viewClicked: EventEmitter<RowActivateEvent> = new EventEmitter<RowActivateEvent>();
	@Output() nameClicked: EventEmitter<Guid> = new EventEmitter<Guid>();
	@Output() refreshReview: EventEmitter<Guid> = new EventEmitter<Guid>();

  	dataObjectReview: DataObjectReview = null;
	type: DataObjectType = null;
	id: Guid = null;

	evalType = ReviewEvaluationType;
	anonymityType = ReviewAnonymity;
	visibilityType = ReviewVisibility;

	constructor(
		protected route: ActivatedRoute,
		public authService: AuthService
	) {
	}
  
	ngOnInit(): void {
		this.dataObjectReview = this.review;
		this.type = this.review?.dataObjectType;
	}
  
	getOptionById(optionId: Guid): BaseEvaluationOption
	{
		var x = this.type?.config?.evalOptions.find(x => x?.optionId == optionId);
		return x;
	}

	getSortedEvaluations() {
		var arr = this.dataObjectReview.evaluationData.evaluations;
		return arr.sort((a,b) =>{
			let aVal = this.getOptionById(a.optionId)?.isActive == IsActive.Active ? 1 : 0;
			let bVal = this.getOptionById(b.optionId)?.isActive == IsActive.Active ? 1 : 0;
			return bVal - aVal;
		})
	}

	onEditClicked() {
		let event : RowActivateEvent = {
			value: undefined,
			type: 'click',
			event: undefined,
			row: this.review,
			column: undefined,
			cellElement: undefined,
			rowElement: undefined
		}
		this.editClicked.emit(event);
	}

	onViewClicked() {
		let event : RowActivateEvent = {
			value: undefined,
			type: 'click',
			event: undefined,
			row: this.review,
			column: undefined,
			cellElement: undefined,
			rowElement: undefined
		}
		this.viewClicked.emit(event);
	}
	
	onNameClicked() {
		if( this.dataObjectReview.userId != null) this.userNavigate(this.dataObjectReview.userId);
	}

	onRefreshReview() {
		this.refreshReview.emit(this.id);
	}

	userNavigate(userId: Guid) {
		this.nameClicked.emit(userId);
	}
}
