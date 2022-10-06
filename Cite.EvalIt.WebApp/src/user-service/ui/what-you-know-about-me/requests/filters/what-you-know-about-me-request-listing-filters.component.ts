import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { BaseComponent } from '@common/base/base.component';
import { IsActive } from '@user-service/core/enum/is-active.enum';
import { WhatYouKnowAboutMeRequestState } from '@user-service/core/enum/what-you-know-about-me-request-state.enum';
import { WhatYouKnowAboutMeRequestValidation } from '@user-service/core/enum/what-you-know-about-me-request-validation.enum';
import { UserServiceEnumUtils } from '@user-service/core/formatting/enum-utils.service';
import { WhatYouKnowAboutMeRequestFilter } from '@user-service/core/query/what-you-know-about-me-request.lookup';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
	selector: 'app-what-you-know-about-me-request-listing-filters',
	templateUrl: './what-you-know-about-me-request-listing-filters.component.html',
	styleUrls: ['./what-you-know-about-me-request-listing-filters.component.scss']
})
export class WhatYouKnowAboutMeRequestFiltersComponent extends BaseComponent implements OnInit, OnChanges {

	@Input() filter: WhatYouKnowAboutMeRequestFilter;
	@Output() filterChange = new EventEmitter<WhatYouKnowAboutMeRequestFilter>();
	// panelExpanded = false;
	whatYouKnowAboutMeStateEnumValues: WhatYouKnowAboutMeRequestState[] = this.enumUtils.getEnumValues(WhatYouKnowAboutMeRequestState);
	whatYouKnowAboutMeValidationEnumValues: WhatYouKnowAboutMeRequestValidation[] = this.enumUtils.getEnumValues(WhatYouKnowAboutMeRequestValidation);
	filterSelections: { [key: string]: boolean } = {};

	constructor(
		public enumUtils: UserServiceEnumUtils
	) { super(); }

	ngOnInit() {
		//this.panelExpanded = !this.areHiddenFieldsEmpty();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['filter']) { this.visibleFields(this.filter); }
	}

	onFilterChange() {
		this.filterChange.emit(this.filter);
	}

	// private areHiddenFieldsEmpty(): boolean {
	// 	return (!this.filter.isActive || this.filter.isActive.length === 0 || (this.filter.isActive.length === 1 && this.filter.isActive[0] === IsActive.Active))
	// 		&& (!this.filter.state || this.filter.state.length === 0)
	// 		&& (!this.filter.isValidated || this.filter.isValidated.length === 0);
	// }

	//
	// Filter getters / setters
	// Implement here any custom logic regarding how these fields are applied to the lookup.
	//
	visibleFields(filter: WhatYouKnowAboutMeRequestFilter) {
		this.filterSelections['isActiveOption'] = (filter.isActive && filter.isActive.length !== 0) ? true : false;
		this.filterSelections['likeOption'] = (filter.like && filter.like.length !== 0) ? true : false;
		this.filterSelections['stateOption'] = (filter.state && filter.state.length !== 0) ? true : false;
		this.filterSelections['isValidatedOption'] = (filter.isValidated && filter.isValidated.length !== 0) ? true : false;
	}

	get like(): string {
		return this.filter.like;
	}
	set like(value: string) {
		this.filter.like = value;
		this.filterChange.emit(this.filter);
	}

	get isActive(): boolean {
		return this.filter.isActive ? this.filter.isActive.includes(IsActive.Inactive) : true;
	}
	set isActive(value: boolean) {
		this.filter.isActive = value ? [IsActive.Active, IsActive.Inactive] : [IsActive.Active];
		this.filterChange.emit(this.filter);
	}

	get state(): WhatYouKnowAboutMeRequestState[] {
		return this.filter.state;
	}
	set state(value: WhatYouKnowAboutMeRequestState[]) {
		this.filter.state = value.length > 0 ? value : null;
		this.filterChange.emit(this.filter);
	}

	get isValidated(): WhatYouKnowAboutMeRequestValidation[] {
		return this.filter.isValidated;
	}
	set isValidated(value: WhatYouKnowAboutMeRequestValidation[]) {
		this.filter.isValidated = value.length > 0 ? value : null;
		this.filterChange.emit(this.filter);
	}

	selectAll() {
		Object.keys(this.filterSelections).forEach(key => {
			this.filterSelections[key] = true;
		});
	}

	deselectAll() {
		this.filter.isActive = undefined;
		this.filter.like = undefined;
		this.filter.state = undefined;
		this.filter.isValidated = undefined;

		this.visibleFields(this.filter);
		this.filterChange.emit(this.filter);
	}

	areAllSelected(): boolean {
		if (Object.values(this.filterSelections).indexOf(false) === -1) {
			return true;
		} else { return false; }
	}

	areNoneSelected(): boolean {
		if (Object.values(this.filterSelections).indexOf(true) === -1) {
			return true;
		} else { return false; }
	}

	countOpenFilters(): number {
		const filtered = Object.entries(this.filterSelections).filter(([k, v]) => v === true);
		return filtered.length === 0 ? undefined : filtered.length;
	}

	checkBoxChanged(event: MatCheckboxChange, filter: string) {
		if (!event.checked && this.filter[filter] != null) {
			this.filter[filter] = filter !== 'isActive' ? undefined : [IsActive.Active];
			this.filterChange.emit(this.filter);
		}
	}
}
