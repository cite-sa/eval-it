import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, OnChanges } from '@angular/core';
import { RoleType } from '@app/core/enum/role-type.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { BaseComponent } from '@common/base/base.component';
import { IsActive } from '@idp-service/core/enum/is-active.enum';
import { UserFilter } from '@idp-service/core/query/user.lookup';
import { UserClaimLookup } from '@idp-service/core/query/user-claim.lookup';

@Component({
	selector: 'app-user-role-assignment-filters',
	templateUrl: './user-role-assignment-filters.component.html',
	styleUrls: ['./user-role-assignment-filters.component.scss']
})
export class UserRoleAssignmentFiltersComponent extends BaseComponent implements OnInit, OnChanges {

	@Input() filter: UserFilter;
	@Output() filterChange = new EventEmitter<UserFilter>();
	panelExpanded = false;
	userRoleAssignmentValues: RoleType[] = this.appEnumUtils.getEnumValues(RoleType);

	constructor(
		public appEnumUtils: AppEnumUtils
	) { super(); }

	ngOnInit() {
		this.panelExpanded = !this.areHiddenFieldsEmpty();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['filter']) { this.panelExpanded = !this.areHiddenFieldsEmpty(); }
	}

	onFilterChange() {
		this.filterChange.emit(this.filter);
	}

	private areHiddenFieldsEmpty(): boolean {
		return (!this.filter.isActive || this.filter.isActive.length === 0 || (this.filter.isActive.length === 1 && this.filter.isActive[0] === IsActive.Active))
			&& (!this.filter.userClaimSubQuery || !this.filter.userClaimSubQuery.values || this.filter.userClaimSubQuery.values.length === 0);
	}

	//
	// Filter getters / setters
	// Implement here any custom logic regarding how these fields are applied to the lookup.
	//
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
	get roles(): RoleType[] {
		return this.filter.userClaimSubQuery ? this.filter.userClaimSubQuery.values as RoleType[] : null;
	}
	set roles(value: RoleType[]) {
		if (value.length > 0) {
			this.filter.userClaimSubQuery = new UserClaimLookup();
			this.filter.userClaimSubQuery.claim = 'role';
			this.filter.userClaimSubQuery.values = value;
		} else {
			this.filter.userClaimSubQuery = null;
		}
		this.filterChange.emit(this.filter);
	}
}
