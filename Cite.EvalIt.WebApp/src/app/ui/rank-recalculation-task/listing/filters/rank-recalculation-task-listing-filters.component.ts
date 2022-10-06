import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { BaseComponent } from '@common/base/base.component';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { RankRecalculationTaskFilter } from '@app/core/query/rank-recalculation-task.lookup';
import { IsActive } from '@app/core/enum/is-active.enum';
import { RankRecalculationTaskStatus } from '@app/core/enum/rank-recalculation-task-status.enum';
import { AppUser } from '@app/core/model/app-user/app-user.model';
import { Observable } from 'rxjs';
import { AppUserLookup } from '@app/core/query/app-user.lookup';
import { nameof } from 'ts-simple-nameof';
import { map } from 'rxjs/operators';
import { AppUserService } from '@app/core/services/http/app-user.service';
import { FilterService } from '@common/modules/text-filter/filter-service';
import { MultipleAutoCompleteConfiguration } from '@common/modules/auto-complete/multiple/multiple-auto-complete-configuration';

@Component({
	selector: 'app-rank-recalculation-task-listing-filters',
	templateUrl: './rank-recalculation-task-listing-filters.component.html',
	styleUrls: ['./rank-recalculation-task-listing-filters.component.scss']
})
export class RankRecalculationTaskListingFiltersComponent extends BaseComponent implements OnInit, OnChanges {

	@Input() filter: RankRecalculationTaskFilter;
	@Output() filterChange = new EventEmitter<RankRecalculationTaskFilter>();
	// panelExpanded = false;
	filterSelections: { [key: string]: boolean } = {};
	totalUsers: AppUser[] = []
	includedUserList: AppUser[] = []

	taskStatus = RankRecalculationTaskStatus;
	taskStatusKeys=[];

	
	userMultipleAutocompleteConfiguration: MultipleAutoCompleteConfiguration = {
		initialItems: this.initialUserItems.bind(this),
		filterFn: this.userFilterFn.bind(this),
		displayFn: (item: AppUser) => item.name,
		titleFn: (item: AppUser) => item.name
	};

	constructor(
		public enumUtils: AppEnumUtils,
		public appUserService: AppUserService,
		public filterService: FilterService
	) { super(); }

	ngOnInit() {
		//this.panelExpanded = !this.areHiddenFieldsEmpty();
		this.taskStatusKeys = Object.keys(RankRecalculationTaskStatus).filter((item) => isFinite(Number(item))).map(item => Number(item));

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
	visibleFields(filter: RankRecalculationTaskFilter) {
		this.filterSelections['requestingUserIdsOption'] = (filter.requestingUserIds && filter.requestingUserIds.length !== 0) ? true : false;
		this.filterSelections['taskStatusesOption'] = (filter.taskStatuses && filter.taskStatuses.length !== 0) ? true : false;
		this.filterSelections['isActiveOption'] = (filter.isActive && filter.isActive.length !== 0) ? true : false;
	}

	get isActive(): boolean {
		return this.filter.isActive ? this.filter.isActive.includes(IsActive.Inactive) : true;
	}
	set isActive(value: boolean) {
		this.filter.isActive = value ? [IsActive.Active, IsActive.Inactive] : [IsActive.Active];
		this.filterChange.emit(this.filter);
	}

	get taskStatuses(): RankRecalculationTaskStatus[] {
		return this.filter.taskStatuses;
	}
	set taskStatuses(value: RankRecalculationTaskStatus[]) {
		this.filter.taskStatuses = (value.length == 0 ) ? null : value;
		this.filterChange.emit(this.filter);
	}

	get requestingUsers(): AppUser[] {
		return this.includedUserList;
	}
	set requestingUsers(value : AppUser[]) {
		if( value != null )
		{
			this.includedUserList = value;
			this.filter.requestingUserIds = (value.length > 0 ) ? value.map(x => x.id) : null;
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
		this.filter.requestingUserIds = undefined;
		this.filter.taskStatuses = undefined;

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
}
