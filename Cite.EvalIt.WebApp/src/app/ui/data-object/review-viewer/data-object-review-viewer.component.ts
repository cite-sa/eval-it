import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Data, ParamMap, Router } from '@angular/router';
import { IsActive } from '@app/core/enum/is-active.enum';
import { ReviewAnonymity } from '@app/core/enum/review-anonymity.enum';
import { ReviewEvaluationType } from '@app/core/enum/review-evaluation-type.enum';
import { ReviewVisibility } from '@app/core/enum/review-visibility.enum';
import { DataObjectType } from '@app/core/model/data-object-type/data-object-type.model';
import { BaseEvaluationOption } from '@app/core/model/data-object-type/evaluation-configuration.model';
import { DataObjectReview } from '@app/core/model/data-object/data-object-review.model';
import { DataObject } from '@app/core/model/data-object/data-object.model';
import { AppUserService } from '@app/core/services/http/app-user.service';
import { DataObjectService } from '@app/core/services/http/data-object.service';
import { AuthService } from '@app/core/services/ui/auth.service';
import { QueryParamsService } from '@app/core/services/ui/query-params.service';
import { Guid } from '@common/types/guid';

@Component({
  selector: 'app-data-object-review-viewer',
  templateUrl: './data-object-review-viewer.component.html',
  styleUrls: ['./data-object-review-viewer.component.scss']
})
export class DataObjectReviewViewerComponent implements OnInit {

	review: DataObjectReview = null;
	id: Guid = null;

	objId: Guid = null;
	object: DataObject = null;

	type: DataObjectType = null;
	name: string = null;

	evalType = ReviewEvaluationType;
	anonymityType = ReviewAnonymity;
	visibilityType = ReviewVisibility;

	lookupParams: any;
	private lv = 0;

	constructor(
		protected route: ActivatedRoute,
		protected router: Router,
		public authService: AuthService,
		private queryParamsService: QueryParamsService,
		private userService: AppUserService,
		private objectService: DataObjectService
	) {
	}
  
	ngOnInit(): void {
		const entity = this.route.snapshot.data['entity'] as DataObject;
		if(entity) {
			this.route.url.subscribe(data => {
				this.objId = Guid.parse(data[0].path);
				this.id = Guid.parse(data[2].path);

				this.review = entity.reviews.find(x => x.id == this.id && x.isActive == IsActive.Active);
				if( this.review) {
					this.type = this.review.dataObjectType;
					if(this.review?.user?.name) this.name = this.review.user.name;
					this.object = entity;
					}
				});
		}
		
		this.route.queryParamMap.pipe().subscribe((params: ParamMap) => {
			// If lookup is on the query params load it
			if (params.keys.length > 0 && params.has('lookup')) {
				this.lookupParams = this.queryParamsService.deSerializeLookup(params.get('lookup'));
			}
		});
	}
  
	getOptionById(optionId: Guid): BaseEvaluationOption
	{
		var x = this.type?.config?.evalOptions.find(x => x?.optionId == optionId);
		return x;
	}

	getSortedEvaluations() {
		var arr = this.review.evaluationData.evaluations;
		return arr.sort((a,b) =>{
			let aVal = this.getOptionById(a.optionId)?.isActive == IsActive.Active ? 1 : 0;
			let bVal = this.getOptionById(b.optionId)?.isActive == IsActive.Active ? 1 : 0;
			return bVal - aVal;
		})
	}

	toEditor() {
		this.navigateTo('../editor');
	}

	toObject() {
		this.navigateTo('../../..')
	}

	onNameClicked() {
		if ( this.review.userId) {
			this.navigateTo('/user-public-profile/' + this.review.userId)
		}
	}

	navigateTo(url: string) {
		this.router.navigate([url], { relativeTo: this.route, queryParams: { 'lookup': this.queryParamsService.serializeLookup(this.lookupParams), 'lv': ++this.lv }});
	}}
