import { Component, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { ClaimSerializePipe } from '@app/core/formatting/pipes/claim-serialize.pipe';
import { AuthService } from '@app/core/services/ui/auth.service';
import { QueryParamsService } from '@app/core/services/ui/query-params.service';
import { BaseListingComponent } from '@common/base/base-listing-component';
import { PipeService } from '@common/formatting/pipe.service';
import { QueryResult } from '@common/model/query-result';
import { HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { ColumnsChangedEvent, PageLoadEvent } from '@common/modules/listing/listing.component';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { Guid } from '@common/types/guid';
import { IsActive } from '@idp-service/core/enum/is-active.enum';
import { UserClaim } from '@idp-service/core/model/user-claim.model';
import { IdpServiceUser } from '@idp-service/core/model/user.model';
import { UserLookup } from '@idp-service/core/query/user.lookup';
import { UserService as IdpUserService } from '@idp-service/services/http/user.service';
import { TranslateService } from '@ngx-translate/core';
import { UserType } from '@user-service/core/enum/user-type.enum';
import { Observable } from 'rxjs';
import { nameof } from 'ts-simple-nameof';

@Component({
	templateUrl: './user-role-assignment.component.html',
	styleUrls: ['./user-role-assignment.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class UserRoleAssignmentComponent extends BaseListingComponent<IdpServiceUser, UserLookup> implements OnInit {

	@ViewChild('userRoleEditorTemplate', { static: true }) userRoleEditorTemplate: TemplateRef<any>;


	public unsavedUsers = new Map<Guid, IdpServiceUser>(); // Users by id
	userSettingsKey = { key: 'UserRoleAssignmentUserSettings' };

	constructor(
		protected router: Router,
		protected route: ActivatedRoute,
		protected uiNotificationService: UiNotificationService,
		protected httpErrorHandlingService: HttpErrorHandlingService,
		protected queryParamsService: QueryParamsService,
		public authService: AuthService,
		private idpUserService: IdpUserService,
		private pipeService: PipeService,
		private language: TranslateService,
	) {
		super(router, route, uiNotificationService, httpErrorHandlingService, queryParamsService);
		// Lookup setup
		// Default lookup values are defined in the user settings class.
		this.lookup = this.initializeLookup();
	}

	ngOnInit() {
		super.ngOnInit();
	}

	protected initializeLookup(): UserLookup {
		const lookup = new UserLookup();
		lookup.metadata = { countAll: true };
		lookup.page = { offset: 0, size: this.ITEMS_PER_PAGE };

		lookup.isActive = [IsActive.Active];
		lookup.type = [UserType.Person];
		lookup.order = { items: [nameof<IdpServiceUser>(x => x.name)] };
		lookup.project = {
			fields: [
				nameof<IdpServiceUser>(x => x.id),
				nameof<IdpServiceUser>(x => x.name),
				nameof<IdpServiceUser>(x => x.hash),
				nameof<IdpServiceUser>(x => x.updatedAt),
				"claims." + nameof<UserClaim>(x => x.value),
				"claims." + nameof<UserClaim>(x => x.claim),
			]
		};

		return lookup;
	}

	protected setupColumns() {
		this.gridColumns.push(...[{
			prop: nameof<IdpServiceUser>(x => x.name),
			sortable: true,
			languageName: 'IDP-SERVICE.USER-ROLE-ASSIGNMENT.FIELDS.NAME'
		}, {
			languageName: 'IDP-SERVICE.USER-ROLE-ASSIGNMENT.FIELDS.ROLES',
			cellTemplate: this.userRoleEditorTemplate,
			alwaysShown: true
		}, {
			prop: nameof<IdpServiceUser>(x => x.claims),
			sortable: false,
			languageName: 'IDP-SERVICE.USER-ROLE-ASSIGNMENT.FIELDS.X-ROLES',
			alwaysShown: true,
			pipe: this.xRolePipe()
		}]);
	}

	onColumnsChanged(event: ColumnsChangedEvent) {
		// Here are defined the projection fields that always requested from the api.
		this.lookup.project = {
			fields: [
				nameof<IdpServiceUser>(x => x.id),
				nameof<IdpServiceUser>(x => x.hash),
				nameof<IdpServiceUser>(x => x.updatedAt),
				...event.properties.filter(x => x).map(x => x.toString())]
		};
		this.onPageLoad({ offset: 0 } as PageLoadEvent);
	}

	private xRolePipe () {
		return {transform: (value) => this.pipeService.getPipe<ClaimSerializePipe>(ClaimSerializePipe).transform(value, 'x-role')}
	}

	protected loadListing(): Observable<QueryResult<IdpServiceUser>> {
		return this.idpUserService.query(this.lookup);
	}

	private refreshPage() {
		this.router.navigate([], { queryParams: { 'lookup': this.queryParamsService.serializeLookup(this.lookup) } });
	}

	// TODO: when there is an unsaved user with 0 roles then we must not allow saving. (ideally we must pass validation like inside the role editor)
	// we must show an error to the user. not implemented yet because the workflow of the user assignment page is not finalized
	saveAllChanges() {
		if (this.unsavedUsers.size > 0) {
			const items: IdpServiceUser[] = [];
			this.unsavedUsers.forEach(item => {
				items.push(item);
			});
			//TODO batch update functionality seems to be missing from backend
			// this.idpUserService.updateUserClaims(items)
			// 	.pipe(takeUntil(this._destroyed))
			// 	.subscribe(
			// 		complete => this.onUpdateUserRolesCallbackSuccess(),
			// 		error => this.onCallbackError(error)
			// 	);
		}
	}

	discardAllChanges() {
		this.resetUnsavedUsers();
	}

	onRolesChanged(userId: Guid, user: IdpServiceUser) {
		this.unsavedUsers.set(userId, user);
	}

	onRolesSaved(userId: Guid) {
		var x = this.unsavedUsers.get(userId);
		this.gridRows[this.gridRows.findIndex(x => x.id == userId)].claims = this.gridRows[this.gridRows.findIndex(x => x.id == userId)].claims.filter(u => u.claim != "role").concat(x.claims);
		this.unsavedUsers.delete(userId);
	}

	onRolesEditCanceled(userId: Guid) {
		this.unsavedUsers.delete(userId);
	}

	private resetUnsavedUsers() {
		this.unsavedUsers = new Map<Guid, IdpServiceUser>();
		this.refreshPage();
	}

	private onUpdateUserRolesCallbackSuccess(): void {
		this.uiNotificationService.snackBarNotification(this.language.instant('COMMONS.SNACK-BAR.SUCCESSFUL-CREATION'), SnackBarNotificationLevel.Success);
		this.resetUnsavedUsers();
	}
}
