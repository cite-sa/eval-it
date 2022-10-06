import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { IsActive } from '@app/core/enum/is-active.enum';
import { AppPermission } from '@app/core/enum/permission.enum';
import { UserNetworkRelationship } from '@app/core/enum/user-network-relationship.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { AppUser, UserWithRelationship } from '@app/core/model/app-user/app-user.model';
import { AppUserLookup } from '@app/core/query/app-user.lookup';
import { AppUserService } from '@app/core/services/http/app-user.service';
import { AuthService } from '@app/core/services/ui/auth.service';
import { QueryParamsService } from '@app/core/services/ui/query-params.service';
import { UserWithRelationshipModel } from '@app/ui/app-user/network-editor/app-user-network-editor.model';
import { AppUserNetworkEditorResolver } from '@app/ui/app-user/network-editor/app-user-network-editor.resolver';
import { BaseEditor } from '@common/base/base-editor';
import { FormService } from '@common/forms/form-service';
import { LoggingService } from '@common/logging/logging-service';
import { SingleAutoCompleteConfiguration } from '@common/modules/auto-complete/single/single-auto-complete-configuration';
import { ConfirmationDialogComponent } from '@common/modules/confirmation-dialog/confirmation-dialog.component';
import { HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { FilterService } from '@common/modules/text-filter/filter-service';
import { Guid } from '@common/types/guid';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, Observable } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';

@Component({
  selector: 'app-app-user-network-editor',
  templateUrl: './app-user-network-editor.component.html',
  styleUrls: ['./app-user-network-editor.component.scss']
})
export class AppUserNetworkEditorComponent extends BaseEditor<UserWithRelationshipModel, UserWithRelationship> implements OnInit {

	isNew = true;
	isDeleted = false;
	saveClicked = false;
	formGroup: FormGroup = null;

	id: Guid;
	userId: Guid;
	currentUser: AppUser;
	users : AppUser[];
	usersInNetwork: AppUser[];

	userNetworkRelationship = UserNetworkRelationship;
	userNetworkRelationshipKeys=[];

	userSingleAutocompleteConfiguration: SingleAutoCompleteConfiguration = {
		initialItems: this.initialSingleUserItems.bind(this),
		filterFn: this.userSingleFilterFn.bind(this),
		displayFn: (item: AppUser) => item.name,
		titleFn: (item: AppUser) => item.name
	};

	constructor(
		// BaseFormEditor injected dependencies
		protected dialog: MatDialog,
		protected language: TranslateService,
		protected formService: FormService,
		protected router: Router,
		protected uiNotificationService: UiNotificationService,
		protected httpErrorHandlingService: HttpErrorHandlingService,
		protected filterService: FilterService,
		protected datePipe: DatePipe,
		protected route: ActivatedRoute,
		protected queryParamsService: QueryParamsService,
		// Rest dependencies. Inject any other needed deps here:
		public authService: AuthService,
		public enumUtils: AppEnumUtils,
		private userService: AppUserService,
		private logger: LoggingService
	) {
		super(dialog, language, formService, router, uiNotificationService, httpErrorHandlingService, filterService, datePipe, route, queryParamsService); 
		this.userNetworkRelationshipKeys = Object.keys(UserNetworkRelationship).filter((item) => isFinite(Number(item))).map(item => Number(item));
	}

	ngOnInit(): void {
		this.route.url.pipe(switchMap(data => {
			var userStr = "User.";
			this.id = Guid.parse(data[0].path);
			this.userId = Guid.parse(data[2].path);

			var userFields =  [
				nameof<AppUser>(x => x.id),
				userStr + nameof<AppUser>(x => x.id),
				userStr + nameof<AppUser>(x => x.name),
				userStr + userStr + nameof<AppUser>(x => x.name),
			]

			var userLookup = new AppUserLookup();
			userLookup.isActive = [IsActive.Active];
			userLookup.excludedIds = [this.id];
			userLookup.project = {
				fields: [
					nameof<AppUser>(x => x.id),
					nameof<AppUser>(x => x.name),
				]
			};
			let obsUser = this.userService.getSingle(this.id,userFields);
			let users = this.userService.query(userLookup);

			return forkJoin([obsUser, users]);
		}))
		.subscribe(res => {
			this.usersInNetwork = res[0].userNetworkIds.map(t => t.user);
			this.users = res[1].items;
			
			if( !this.userId.equals(Guid.parse("0")) )
			{
				var pair = res[0].userNetworkIds.find( x => x.id == this.userId)
				this.currentUser = pair?.user;

				this.isNew = false;
				this.prepareForm(pair);
			}
			else this.prepareForm(null);
		});
		
		this.route.queryParamMap.pipe(takeUntil(this._destroyed)).subscribe((params: ParamMap) => {
			// If lookup is on the query params load it
			if (params.keys.length > 0 && params.has('lookup')) {
				this.lookupParams = this.queryParamsService.deSerializeLookup(params.get('lookup'));
			}
		});
	}

	getItem(itemId: Guid, successFunction: (item: UserWithRelationship) => void): void {}

	prepareForm(data: UserWithRelationship): void {
		try {
			this.editorModel = data ? new UserWithRelationshipModel().fromPair(data) : new UserWithRelationshipModel();
			this.isDeleted = this.currentUser != null && data == null;
			this.buildForm();
		} catch {
			this.logger.error('Could not parse User: ' + data);
			this.uiNotificationService.snackBarNotification(this.language.instant('COMMONS.ERRORS.DEFAULT'), SnackBarNotificationLevel.Error);
		}
	}

	formSubmit(): void {
		this.formService.touchAllFormFields(this.formGroup);
		if (!this.isFormValid()) {
			return;
		}

		this.persistEntity();
	}
	public delete() {
		const value = this.formGroup.getRawValue();
		if (value.id) {
			const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
				maxWidth: '300px',
				data: {
					message: this.language.instant('COMMONS.CONFIRMATION-DIALOG.DELETE-ITEM'),
					confirmButton: this.language.instant('COMMONS.CONFIRMATION-DIALOG.ACTIONS.CONFIRM'),
					cancelButton: this.language.instant('COMMONS.CONFIRMATION-DIALOG.ACTIONS.CANCEL')
				}
			});
			dialogRef.afterClosed().pipe(takeUntil(this._destroyed)).subscribe(result => {
				if (result) {
					this.userService.userNetworkRemove(this.id, value).pipe(takeUntil(this._destroyed))
						.subscribe(
							_ => this.onCallbackSuccess(),
							error => this.onCallbackError(error)
						);
				}
			});
		}
	}

	refreshData(): void {
		this.getPair(this.id, this.editorModel.id ?? this.currentUser?.id, (data: UserWithRelationship) => this.prepareForm(data));
	}

	refreshOnNavigateToData(id?: Guid): void {
		if (this.isNew) {
			this.formGroup.markAsPristine();
			const addr='/app-users/' + (id ? id : this.id) + (this.formGroup.value.id ? '/network/' + this.formGroup.value.id : '');
			this.router.navigate([addr], { queryParams: { 'lookup': this.queryParamsService.serializeLookup(this.lookupParams), 'lv': ++this.lv }, replaceUrl: true });
		} else { this.refreshData(); }
	}

	persistEntity(onSuccess?: (response) => void) : void {
		this.formService.touchAllFormFields(this.formGroup);
		if(this.currentUser != null && this.formGroup.get('id').value == undefined) this.setValue(this.currentUser);
		if (!this.formGroup.valid) {
			return;
		} 

		var userFields =  [ nameof<AppUser>(x => x.id) ]

		this.userService.userNetworkAdd(this.id,this.formGroup.getRawValue(), userFields)
		.pipe(takeUntil(this._destroyed)).subscribe(
			complete => onSuccess ? onSuccess(complete) : this.onCallbackSuccess(complete),
			error => this.onCallbackError(error)
		);
	}

	buildForm() {
		this.formGroup = this.editorModel.buildForm(null, this.isNew, !this.authService.hasPermission(AppPermission.EditUser));
	}

	getPair(itemId: Guid, userId: Guid, successFunction: (item: UserWithRelationship) => void): void {
		this.userService.getSingle(itemId, AppUserNetworkEditorResolver.lookupFields())
			.pipe(map(data => data as AppUser), takeUntil(this._destroyed))
			.subscribe(
				data => successFunction( data?.userNetworkIds.find(x => x.id == userId)),
				error => this.onCallbackError(error)
			);
	}

	public cancel(): void {
		this.router.navigate(['../..'], { relativeTo: this.route, queryParams: { 'lookup': this.queryParamsService.serializeLookup(this.lookupParams), 'lv': ++this.lv }, replaceUrl: true });// ! lv is always zero . replaceUrl?
	}

	private initialSingleUserItems(selectedItem?: AppUser): Observable<AppUser[]> {
		var userLookup = new AppUserLookup();
		userLookup.referenceUserId = this.id;
		userLookup.isNetworkCandidate = [true];
		userLookup.isActive = [IsActive.Active];
		userLookup.project = {
			fields: [
				nameof<AppUser>(x => x.id),
				nameof<AppUser>(x => x.name)
			]
		}
		return this.userService.query(userLookup).pipe(map(x => x.items));
	}

	private userSingleFilterFn(searchQuery: string, selectedItem?: AppUser): Observable<AppUser[]> {
		var userLookup = new AppUserLookup();
		userLookup.referenceUserId = this.id;
		userLookup.isNetworkCandidate = [true];
		userLookup.isActive = [IsActive.Active];
		userLookup.like = this.filterService.transformLike(searchQuery);
		userLookup.project = {
			fields: [
				nameof<AppUser>(x => x.id),
				nameof<AppUser>(x => x.name)
			]
		}
		return this.userService.query(userLookup).pipe(map(x => x.items));
	}

	setValue(data: AppUser)
	{
		this.formGroup.get('id').setValue(data.id);
	}
}
