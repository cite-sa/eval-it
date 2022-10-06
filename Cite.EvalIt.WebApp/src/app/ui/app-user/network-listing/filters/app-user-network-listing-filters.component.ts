import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { BaseComponent } from '@common/base/base.component';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { TagService } from '@app/core/services/http/tag.service';
import { Tag } from '@app/core/model/tag/tag.model';
import { AppUserNetworkFilter } from '@app/core/query/app-user-network.lookup';
import { UserNetworkRelationship } from '@app/core/enum/user-network-relationship.enum';

@Component({
	selector: 'app-app-user-network-listing-filters',
	templateUrl: './app-user-network-listing-filters.component.html',
	styleUrls: ['./app-user-network-listing-filters.component.scss']
})
export class AppUserNetworkListingFiltersComponent extends BaseComponent implements OnInit, OnChanges {

	@Input() filter: AppUserNetworkFilter;
	@Output() filterChange = new EventEmitter<AppUserNetworkFilter>();
	// panelExpanded = false;
	filterSelections: { [key: string]: boolean } = {};
	totalTags: Tag[] = []

	userNetworkRelationship = UserNetworkRelationship;
	userNetworkRelationshipKeys=[];
	
	constructor(
		public enumUtils: AppEnumUtils,
		public tagService: TagService
	) { super(); }

	ngOnInit() {
		//this.panelExpanded = !this.areHiddenFieldsEmpty();
		this.userNetworkRelationshipKeys = Object.keys(UserNetworkRelationship).filter((item) => isFinite(Number(item))).map(item => Number(item));
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['filter']) { this.visibleFields(this.filter); }
	}

	onFilterChange() {
		this.filterChange.emit(this.filter);
	}

	// private areHiddenFieldsEmpty(): boolean {
	// 	return (!this.filter.isActive || this.filter.isActive.length === 0 || (this.filter.isActive.length === 1 && this.filter.isActive[0] === IsActive.Active));
	// }

	//
	// Filter getters / setters
	// Implement here any custom logic regarding how these fields are applied to the lookup.
	//
	visibleFields(filter: AppUserNetworkFilter) {
		this.filterSelections['likeOption'] = (filter.like && filter.like.length !== 0) ? true : false;
		this.filterSelections['relationshipOption'] = (filter.relationship && filter.relationship.length !== 0) ? true : false;
	}

	get like(): string {
		return this.filter.like;
	}
	set like(value: string) {
		this.filter.like = value;
		this.filterChange.emit(this.filter);
	}

	get networkRelationship(): UserNetworkRelationship[] {
		return this.filter.relationship;
	}

	set networkRelationship(value: UserNetworkRelationship[]) {
		this.filter.relationship = (value.length == 0 ) ? null : value;
		this.filterChange.emit(this.filter);
	}

	selectAll() {
		Object.keys(this.filterSelections).forEach(key => {
			this.filterSelections[key] = true;
		});
	}

	deselectAll() {
		this.filter.like = undefined;

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
			this.filter[filter] = undefined;
			this.filterChange.emit(this.filter);
		}
	}
}
