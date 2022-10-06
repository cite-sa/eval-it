import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { IsActive } from '@app/core/enum/is-active.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { BaseComponent } from '@common/base/base.component';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { nameof } from 'ts-simple-nameof';
import { FilterService } from '@common/modules/text-filter/filter-service';
import { DataObjectFilter } from '@app/core/query/data-object.lookup';
import { Tag } from '@app/core/model/tag/tag.model';
import { TagLookup } from '@app/core/query/tag.lookup';
import { TagAppliesTo } from '@app/core/enum/tag-applies-to.enum';
import { TagService } from '@app/core/services/http/tag.service';
import { MultipleAutoCompleteConfiguration } from '@common/modules/auto-complete/multiple/multiple-auto-complete-configuration';
import { SingleAutoCompleteConfiguration } from '@common/modules/auto-complete/single/single-auto-complete-configuration';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataObjectType } from '@app/core/model/data-object-type/data-object-type.model';
import { DataObjectTypeService } from '@app/core/services/http/data-object-type.service';
import { DataObjectTypeLookup } from '@app/core/query/data-object-type.lookup';

@Component({
	selector: 'app-data-object-listing-filters',
	templateUrl: './data-object-listing-filters.component.html',
	styleUrls: ['./data-object-listing-filters.component.scss']
})
export class DataObjectListingFiltersComponent extends BaseComponent implements OnInit, OnChanges {

	@Input() filter: DataObjectFilter;
	@Output() filterChange = new EventEmitter<DataObjectFilter>();
	// panelExpanded = false;
	filterSelections: { [key: string]: boolean } = {};
	includedTypes: DataObjectType[] = []
	includedTags: Tag[] = []

	typeMultipleAutocompleteConfiguration: MultipleAutoCompleteConfiguration = {
		initialItems: this.initialMultiTypeItems.bind(this),
		filterFn: this.typeMultiFilterFn.bind(this),
		displayFn: (item: DataObjectType) => item.name,
		titleFn: (item: DataObjectType) => item.name
	};

	tagMultipleAutocompleteConfiguration: MultipleAutoCompleteConfiguration = {
		initialItems: this.initialMultiTagItems.bind(this),
		filterFn: this.tagMultiFilterFn.bind(this),
		displayFn: (item: Tag) => item.label,
		titleFn: (item: Tag) => item.label
	};

	constructor(
		public enumUtils: AppEnumUtils,
		public tagService: TagService,
		public dataObjectTypeService: DataObjectTypeService,
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
	visibleFields(filter: DataObjectFilter) {
		this.filterSelections['likeOption'] = (filter.like && filter.like.length !== 0) ? true : false;
		this.filterSelections['likeDescriptionOption'] = (filter.like && filter.like.length !== 0) ? true : false;
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
	
	get types(): DataObjectType[] {
		return this.includedTypes;
	}
	set types(value: DataObjectType[]) {
		if( value != null )
		{
			this.includedTypes = value;
			this.filter.typeIds = (value.length > 0 ) ? value.map(x => x.id) : null;
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
		this.filter.likeDescription = undefined;
		this.filter.ids = undefined;
		this.filter.excludedIds = undefined;
		this.filter.tagIds = undefined;
		this.filter.typeIds = undefined;

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
		tagLookup.appliesTo = [TagAppliesTo.All, TagAppliesTo.Object]
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
		tagLookup.appliesTo = [TagAppliesTo.All, TagAppliesTo.Object]
		tagLookup.like = this.filterService.transformLike(searchQuery);
		tagLookup.project = {
			fields: [
				nameof<Tag>(x => x.id),
				nameof<Tag>(x => x.label)
			]
		}
		return this.tagService.query(tagLookup).pipe(map(x => x.items));
	}

	private initialSingleTagItems(selectedItem?: Tag): Observable<Tag[]> {
		var tagLookup = new TagLookup();
		tagLookup.excludedIds = selectedItem != null ? [selectedItem.id]  : null;
		tagLookup.isActive = [IsActive.Active]
		tagLookup.appliesTo = [TagAppliesTo.All, TagAppliesTo.Object]
		tagLookup.project = {
			fields: [
				nameof<Tag>(x => x.id),
				nameof<Tag>(x => x.label)
			]
		}
		return this.tagService.query(tagLookup).pipe(map(x => x.items));
	}

	private tagSingleFilterFn(searchQuery: string, selectedItem?: Tag): Observable<Tag[]> {
		var tagLookup = new TagLookup();
		tagLookup.excludedIds = selectedItem != null ? [selectedItem.id]  : null;
		tagLookup.isActive = [IsActive.Active]
		tagLookup.appliesTo = [TagAppliesTo.All, TagAppliesTo.Object]
		tagLookup.like = this.filterService.transformLike(searchQuery);
		tagLookup.project = {
			fields: [
				nameof<Tag>(x => x.id),
				nameof<Tag>(x => x.label)
			]
		}
		return this.tagService.query(tagLookup).pipe(map(x => x.items));
	}

	private initialMultiTypeItems(selectedItems?: DataObjectType[]): Observable<DataObjectType[]> {
		var typeLookup = new DataObjectTypeLookup();
		typeLookup.excludedIds = selectedItems.length > 0 ? selectedItems.map(x => x.id) : null;
		typeLookup.isActive = [IsActive.Active]
		typeLookup.project = {
			fields: [
				nameof<DataObjectType>(x => x.id),
				nameof<DataObjectType>(x => x.name)
			]
		}
		return this.dataObjectTypeService.query(typeLookup).pipe(map(x => x.items));
	}

	private typeMultiFilterFn(searchQuery: string, selectedItems?: DataObjectType[]): Observable<DataObjectType[]> {
		var typeLookup = new DataObjectTypeLookup();
		typeLookup.excludedIds = selectedItems.length > 0 ? selectedItems.map(x => x.id) : null;
		typeLookup.isActive = [IsActive.Active]
		typeLookup.like = this.filterService.transformLike(searchQuery);
		typeLookup.project = {
			fields: [
				nameof<DataObjectType>(x => x.id),
				nameof<DataObjectType>(x => x.name)
			]
		}
		return this.dataObjectTypeService.query(typeLookup).pipe(map(x => x.items));
	}
}
