import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { BaseComponent } from '@common/base/base.component';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { DataObjectReviewFilter } from '@app/core/query/data-object-review.lookup';
import { MultipleAutoCompleteConfiguration } from '@common/modules/auto-complete/multiple/multiple-auto-complete-configuration';
import { AppUser } from '@app/core/model/app-user/app-user.model';
import { Observable } from 'rxjs';
import { AppUserLookup } from '@app/core/query/app-user.lookup';
import { IsActive } from '@app/core/enum/is-active.enum';
import { nameof } from 'ts-simple-nameof';
import { map } from 'rxjs/operators';
import { AppUserService } from '@app/core/services/http/app-user.service';
import { FilterService } from '@common/modules/text-filter/filter-service';
import { ReviewAnonymity } from '@app/core/enum/review-anonymity.enum';

@Component({
	selector: 'app-data-object-review-listing-filters',
	templateUrl: './data-object-review-listing-filters.component.html',
	styleUrls: ['./data-object-review-listing-filters.component.scss']
})
export class DataObjectReviewListingFiltersComponent extends BaseComponent implements OnInit, OnChanges {

	@Input() filter: DataObjectReviewFilter;
	@Output() filterChange = new EventEmitter<DataObjectReviewFilter>();
	// panelExpanded = false;
	filterSelections: { [key: string]: boolean } = {};
	includedUsers: AppUser[] = []
	IncludedUser: AppUser

	anonymityType = ReviewAnonymity;
	anonymityTypeKeys=[];


	appUserMultipleAutocompleteConfiguration: MultipleAutoCompleteConfiguration = {
		initialItems: this.initialMultiAppUserItems.bind(this),
		filterFn: this.appUserMultiFilterFn.bind(this),
		displayFn: (item: AppUser) => item.name,
		titleFn: (item: AppUser) => item.name
	};

	constructor(
		public enumUtils: AppEnumUtils,
		public userService: AppUserService,
		public filterService: FilterService
	) { super(); }

	ngOnInit() {
		this.anonymityTypeKeys = Object.keys(ReviewAnonymity).filter((item) => isFinite(Number(item))).map(item => Number(item));
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
	visibleFields(filter: DataObjectReviewFilter) {
		this.filterSelections['userOption'] = (filter.userIds && filter.userIds.length !== 0) ? true : false;
		// this.filterSelections['anonymousOption'] = (filter.anonymityTypes && filter.anonymityTypes.length !== 0) ? true : false;
	}

	get appUsers(): AppUser[] {
		return this.includedUsers;
	}
	set appUsers(value: AppUser[]) {
		if( value != null )
		{
			this.includedUsers = value;
			this.filter.userIds = (value.length > 0 ) ? value.map(x => x.id) : null;
			this.filterChange.emit(this.filter);
		}
	}

	// get anonymityTypes(): ReviewAnonymity[] {
	// 	return this.filter.anonymityTypes;
	// }
	// set anonymityTypes(value: ReviewAnonymity[]) {
	// 	this.filter.anonymityTypes = (value.length == 0 ) ? null : value;
	// 	this.filterChange.emit(this.filter);
	// }

	selectAll() {
		Object.keys(this.filterSelections).forEach(key => {
			this.filterSelections[key] = true;
		});
	}

	deselectAll() {
		this.filter.userIds = undefined;

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

	private initialMultiAppUserItems(selectedItems?: AppUser[]): Observable<AppUser[]> {
		var appUserLookup = new AppUserLookup();
		appUserLookup.excludedIds = selectedItems.length > 0 ? selectedItems.map(x => x.id) : null;
		appUserLookup.isActive = [IsActive.Active]
		appUserLookup.project = {
			fields: [
				nameof<AppUser>(x => x.id),
				nameof<AppUser>(x => x.name)
			]
		}
		return this.userService.query(appUserLookup).pipe(map(x => x.items));
	}

	private appUserMultiFilterFn(searchQuery: string, selectedItems?: AppUser[]): Observable<AppUser[]> {
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
		return this.userService.query(appUserLookup).pipe(map(x => x.items));
	}
}
