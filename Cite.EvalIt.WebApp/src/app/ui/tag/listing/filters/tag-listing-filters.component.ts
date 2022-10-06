import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { IsActive } from '@app/core/enum/is-active.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { BaseComponent } from '@common/base/base.component';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { TagFilter } from '@app/core/query/tag.lookup';
import { TagAppliesTo } from '@app/core/enum/tag-applies-to.enum';
import { TagType } from '@app/core/enum/tag-type.enum';
import { nameof } from 'ts-simple-nameof';
import { AppUser } from '@app/core/model/app-user/app-user.model';
import { AppUserService } from '@app/core/services/http/app-user.service';
import { AppUserLookup } from '@app/core/query/app-user.lookup';
import { Guid } from '@common/types/guid';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { MultipleAutoCompleteConfiguration } from '@common/modules/auto-complete/multiple/multiple-auto-complete-configuration';
import { FilterService } from '@common/modules/text-filter/filter-service';
import { DataObject } from '@app/core/model/data-object/data-object.model';
import { DataObjectLookup } from '@app/core/query/data-object.lookup';
import { DataObjectService } from '@app/core/services/http/data-object.service';

@Component({
	selector: 'app-tag-listing-filters',
	templateUrl: './tag-listing-filters.component.html',
	styleUrls: ['./tag-listing-filters.component.scss']
})
export class TagListingFiltersComponent extends BaseComponent implements OnInit, OnChanges {

	@Input() filter: TagFilter;
	@Output() filterChange = new EventEmitter<TagFilter>();
	// panelExpanded = false;
	filterSelections: { [key: string]: boolean } = {};
	totalUsers: AppUser[] = []
	excludedUserList: AppUser[] = []
	includedUserList: AppUser[] = []

	totalDataObjects: DataObject[] = []
	excludedDataObjectList: DataObject[] = []
	includedDataObjectList: DataObject[] = []

	tagType = TagType;
	tagAppliesTo = TagAppliesTo;
	tagTypeKeys=[];
	tagAppliesToKeys=[];
	
	userMultipleAutocompleteConfiguration: MultipleAutoCompleteConfiguration = {
		initialItems: this.initialUserItems.bind(this),
		filterFn: this.userFilterFn.bind(this),
		displayFn: (item: AppUser) => item.name,
		titleFn: (item: AppUser) => item.name
	};

	dataObjectMultipleAutocompleteConfiguration: MultipleAutoCompleteConfiguration = {
		initialItems: this.initialDataObjectItems.bind(this),
		filterFn: this.dataObjectFilterFn.bind(this),
		displayFn: (item: DataObject) => item.title,
		titleFn: (item: DataObject) => item.title
	};

	constructor(
		public enumUtils: AppEnumUtils,
		public appUserService: AppUserService,
		public dataObjectService: DataObjectService,
		public filterService: FilterService
	) { super(); }

	ngOnInit() {
		//this.panelExpanded = !this.areHiddenFieldsEmpty();
		this.tagAppliesToKeys = Object.keys(TagAppliesTo).filter((item) => isFinite(Number(item))).map(item => Number(item)).filter((item) => item != TagAppliesTo.All);
		this.tagTypeKeys = Object.keys(TagType).filter((item) => isFinite(Number(item))).map(item => Number(item));

		var appUserLookup = new AppUserLookup();

		appUserLookup.isActive = [IsActive.Active];
		appUserLookup.project = {
			fields: [
				nameof<AppUser>(x => x.id),
				nameof<AppUser>(x => x.name)
			]
		}

		this.appUserService.query(appUserLookup).subscribe( t => this.totalUsers = t.items )
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
	visibleFields(filter: TagFilter) {
		this.filterSelections['likeOption'] = (filter.like && filter.like.length !== 0) ? true : false;
		this.filterSelections['userIdsOption'] = ((filter.userIds && filter.userIds.length !== 0) ||  (filter.excludedUserIds && filter.excludedUserIds.length !== 0)) ? true : false;
		this.filterSelections['dataObjectIdsOption'] = ((filter.dataObjectIds && filter.dataObjectIds.length !== 0) ||  (filter.excludedDataObjectIds && filter.excludedDataObjectIds.length !== 0)) ? true : false;
		this.filterSelections['typeOption'] = (filter.type && filter.type.length !== 0) ? true : false;
		this.filterSelections['appliesToOption'] = (filter.appliesTo && filter.appliesTo.length !== 0) ? true : false;
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

	get tagTypes(): TagType[] {
		return this.filter.type;
	}
	set tagTypes(value: TagType[]) {
		this.filter.type = (value.length == 0 ) ? null : value;
		this.filterChange.emit(this.filter);
	}

	get tagApplies(): TagAppliesTo[] {
		let i = this.filter.appliesTo?.findIndex(x => x == TagAppliesTo.All)
		if( i != null && i != -1) {
			this.filter.appliesTo.splice(i,1);
		}
		return this.filter.appliesTo;
	}
	set tagApplies(value: TagAppliesTo[]) {
		if( value.length == 0 ) {
			this.filter.appliesTo = null;
		}
		else {
			value.push(TagAppliesTo.All);
			this.filter.appliesTo = value;
		}
		this.filterChange.emit(this.filter);
	}

	get includedUsers(): AppUser[] {
		return this.includedUserList;
	}
	set includedUsers(value : AppUser[]) {
		if( value != null )
		{
			this.includedUserList = value;
			this.filter.userIds = (value.length > 0 ) ? value.map(x => x.id) : null;
			this.filterChange.emit(this.filter);
		}
	}

	get excludedUsers(): AppUser[] {
		return this.excludedUserList;
	}
	set excludedUsers(value : AppUser[]) {
		if( value != null )
		{
			this.excludedUserList = value;
			this.filter.excludedUserIds = (value?.length > 0 ) ? value.map(x => x.id) : null;
			this.filterChange.emit(this.filter);
		}
	}

	get includedDataObjects(): DataObject[] {
		return this.includedDataObjectList;
	}
	set includedDataObjects(value : DataObject[]) {
		if( value != null )
		{
			this.includedDataObjectList = value;
			this.filter.dataObjectIds = (value.length > 0 ) ? value.map(x => x.id) : null;
			this.filterChange.emit(this.filter);
		}
	}

	get excludedDataObjects(): DataObject[] {
		return this.excludedDataObjectList;
	}
	set excludedDataObjects(value : DataObject[]) {
		if( value != null )
		{
			this.excludedDataObjectList = value;
			this.filter.excludedDataObjectIds = (value?.length > 0 ) ? value.map(x => x.id) : null;
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

	private initialUserItems(selectedItems?: AppUser[]): Observable<AppUser[]> {
		var appUserLookup = new AppUserLookup();
		appUserLookup.excludedIds = selectedItems.length > 0 ? selectedItems.map(x => x.id) : null;
		appUserLookup.isActive = [IsActive.Active]
		appUserLookup.project = {
			fields: [
				nameof<AppUser>(x => x.id),
				nameof<AppUser>(x => x.name)
			]
		}
		return this.appUserService.query(appUserLookup).pipe(map(x => x.items));
	}

	private userFilterFn(searchQuery: string, selectedItems?: AppUser[]): Observable<AppUser[]> {
		var appUserLookup = new AppUserLookup();
		appUserLookup.excludedIds = selectedItems.length > 0 ? selectedItems.map(x => x.id) : null;
		appUserLookup.isActive = [IsActive.Active]
		appUserLookup.like = this.filterService.transformLike(searchQuery);
		appUserLookup.project = {
			fields: [
				nameof<AppUser>(x => x.id),
				nameof<AppUser>(x => x.name)
			]
		}
		return this.appUserService.query(appUserLookup).pipe(map(x => x.items));
	}

	private initialDataObjectItems(selectedItems?: DataObject[]): Observable<DataObject[]> {
		var dataObjectLookup = new DataObjectLookup();
		dataObjectLookup.excludedIds = selectedItems.length > 0 ? selectedItems.map(x => x.id) : null;
		dataObjectLookup.isActive = [IsActive.Active]
		dataObjectLookup.project = {
			fields: [
				nameof<DataObject>(x => x.id),
				nameof<DataObject>(x => x.title)
			]
		}
		return this.dataObjectService.query(dataObjectLookup).pipe(map(x => x.items));
	}

	private dataObjectFilterFn(searchQuery: string, selectedItems?: DataObject[]): Observable<DataObject[]> {
		var dataObjectLookup = new DataObjectLookup();
		dataObjectLookup.excludedIds = selectedItems.length > 0 ? selectedItems.map(x => x.id) : null;
		dataObjectLookup.isActive = [IsActive.Active]
		dataObjectLookup.like = this.filterService.transformLike(searchQuery);
		dataObjectLookup.project = {
			fields: [
				nameof<DataObject>(x => x.id),
				nameof<DataObject>(x => x.title)
			]
		}
		return this.dataObjectService.query(dataObjectLookup).pipe(map(x => x.items));
	}
}
