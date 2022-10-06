import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { BaseComponent } from '@common/base/base.component';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { TagService } from '@app/core/services/http/tag.service';
import { Tag } from '@app/core/model/tag/tag.model';
import { AppUserTagFilter } from '@app/core/query/app-user-tag.lookup';
import { TagType } from '@app/core/enum/tag-type.enum';

@Component({
	selector: 'app-app-user-tag-listing-filters',
	templateUrl: './app-user-tag-listing-filters.component.html',
	styleUrls: ['./app-user-tag-listing-filters.component.scss']
})
export class AppUserTagListingFiltersComponent extends BaseComponent implements OnInit, OnChanges {

	@Input() filter: AppUserTagFilter;
	@Output() filterChange = new EventEmitter<AppUserTagFilter>();
	// panelExpanded = false;
	filterSelections: { [key: string]: boolean } = {};
	totalTags: Tag[] = []

	tagType = TagType;
	tagTypeKeys=[];
	
	constructor(
		public enumUtils: AppEnumUtils,
		public tagService: TagService
	) { super(); }

	ngOnInit() {
		//this.panelExpanded = !this.areHiddenFieldsEmpty();
		this.tagTypeKeys = Object.keys(TagType).filter((item) => isFinite(Number(item))).map(item => Number(item));
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
	visibleFields(filter: AppUserTagFilter) {
		this.filterSelections['likeOption'] = (filter.like && filter.like.length !== 0) ? true : false;
		this.filterSelections['typeOption'] = (filter.tagType && filter.tagType.length !== 0) ? true : false;
	}

	get like(): string {
		return this.filter.like;
	}
	set like(value: string) {
		this.filter.like = value;
		this.filterChange.emit(this.filter);
	}

	get type(): TagType[] {
		return this.filter.tagType;
	}

	set type(value: TagType[]) {
		this.filter.tagType = (value.length == 0 ) ? null : value;
		this.filterChange.emit(this.filter);
	}

	selectAll() {
		Object.keys(this.filterSelections).forEach(key => {
			this.filterSelections[key] = true;
		});
	}

	deselectAll() {
		this.filter.like = undefined;
		this.filter.tagType = undefined;

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
