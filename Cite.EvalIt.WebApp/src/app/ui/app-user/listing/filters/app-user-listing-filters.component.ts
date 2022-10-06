import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { IsActive } from '@app/core/enum/is-active.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { BaseComponent } from '@common/base/base.component';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { AppUserFilter } from '@app/core/query/app-user.lookup';
import { Guid } from '@common/types/guid';
import { TagService } from '@app/core/services/http/tag.service';
import { TagLookup } from '@app/core/query/tag.lookup';
import { nameof } from 'ts-simple-nameof';
import { Tag } from '@app/core/model/tag/tag.model';
import { T } from '@angular/cdk/keycodes';
import { TagAppliesTo } from '@app/core/enum/tag-applies-to.enum';
import { MultipleAutoCompleteConfiguration } from '@common/modules/auto-complete/multiple/multiple-auto-complete-configuration';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FilterService } from '@common/modules/text-filter/filter-service';
import { SingleAutoCompleteConfiguration } from '@common/modules/auto-complete/single/single-auto-complete-configuration';

@Component({
	selector: 'app-app-user-listing-filters',
	templateUrl: './app-user-listing-filters.component.html',
	styleUrls: ['./app-user-listing-filters.component.scss']
})
export class AppUserListingFiltersComponent extends BaseComponent implements OnInit, OnChanges {

	@Input() filter: AppUserFilter;
	@Output() filterChange = new EventEmitter<AppUserFilter>();
	// panelExpanded = false;
	filterSelections: { [key: string]: boolean } = {};
	includedTags: Tag[] = []


	tagMultipleAutocompleteConfiguration: MultipleAutoCompleteConfiguration = {
		initialItems: this.initialMultiTagItems.bind(this),
		filterFn: this.tagMultiFilterFn.bind(this),
		displayFn: (item: Tag) => item.label,
		titleFn: (item: Tag) => item.label
	};

	constructor(
		public enumUtils: AppEnumUtils,
		public tagService: TagService,
		public filterService: FilterService
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
	// 	return (!this.filter.isActive || this.filter.isActive.length === 0 || (this.filter.isActive.length === 1 && this.filter.isActive[0] === IsActive.Active));
	// }

	//
	// Filter getters / setters
	// Implement here any custom logic regarding how these fields are applied to the lookup.
	//
	visibleFields(filter: AppUserFilter) {
		this.filterSelections['likeOption'] = (filter.like && filter.like.length !== 0) ? true : false;
		this.filterSelections['tagIdsOption'] = (filter.tagIds && filter.tagIds.length !== 0) ? true : false;
		this.filterSelections['isActiveOption'] = (filter.isActive && filter.isActive.length !== 0) ? true : false;
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

	get tags(): Tag[] {
		return this.includedTags;
	}
	set tags(value: Tag[]) {
		if( value != null )
		{
			this.includedTags = value;
			this.filter.tagIds = (value.length > 0 ) ? value.map(x => x.id) : null;
			this.filterChange.emit(this.filter);
		}
	}

	selectAll() {
		Object.keys(this.filterSelections).forEach(key => {
			this.filterSelections[key] = true;
		});
	}

	deselectAll() {
		this.filter.isActive = undefined;
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
			this.filter[filter] = filter !== 'isActive' ? undefined : [IsActive.Active];
			this.filterChange.emit(this.filter);
		}
	}

	private initialMultiTagItems(selectedItems?: Tag[]): Observable<Tag[]> {
		var tagLookup = new TagLookup();
		tagLookup.excludedIds = selectedItems.length > 0 ? selectedItems.map(x => x.id) : null;
		tagLookup.isActive = [IsActive.Active]
		tagLookup.appliesTo = [TagAppliesTo.All, TagAppliesTo.User]
		tagLookup.project = {
			fields: [
				nameof<Tag>(x => x.id),
				nameof<Tag>(x => x.label)
			]
		}
		return this.tagService.query(tagLookup).pipe(map(x => x.items));
	}

	private tagMultiFilterFn(searchQuery: string, selectedItems?: Tag[]): Observable<Tag[]> {
		var tagLookup = new TagLookup();
		tagLookup.excludedIds = selectedItems.length > 0 ? selectedItems.map(x => x.id) : null;
		tagLookup.isActive = [IsActive.Active]
		tagLookup.appliesTo = [TagAppliesTo.All, TagAppliesTo.User]
		tagLookup.like = this.filterService.transformLike(searchQuery);
		tagLookup.project = {
			fields: [
				nameof<Tag>(x => x.id),
				nameof<Tag>(x => x.label)
			]
		}
		return this.tagService.query(tagLookup).pipe(map(x => x.items));
	}
}
