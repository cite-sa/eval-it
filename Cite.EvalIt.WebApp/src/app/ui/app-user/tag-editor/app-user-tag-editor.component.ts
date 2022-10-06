import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { IsActive } from '@app/core/enum/is-active.enum';
import { AppPermission } from '@app/core/enum/permission.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { AuthService } from '@app/core/services/ui/auth.service';
import { FormService } from '@common/forms/form-service';
import { LoggingService } from '@common/logging/logging-service';
import { ConfirmationDialogComponent } from '@common/modules/confirmation-dialog/confirmation-dialog.component';
import { HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { Guid } from '@common/types/guid';
import { TranslateService } from '@ngx-translate/core';
import { map, takeUntil } from 'rxjs/operators';
import { FilterService } from '@common/modules/text-filter/filter-service';
import { DatePipe } from '@angular/common';
import { QueryParamsService } from '@app/core/services/ui/query-params.service';
import { Tag } from '@app/core/model/tag/tag.model';
import { TagService } from '@app/core/services/http/tag.service';
import { TagAppliesTo } from '@app/core/enum/tag-applies-to.enum';
import { AppUserService } from '@app/core/services/http/app-user.service';
import { AppUser } from '@app/core/model/app-user/app-user.model';
import { nameof } from 'ts-simple-nameof';
import { TagLookup } from '@app/core/query/tag.lookup';
import { AppUserTagEditorResolver } from '@app/ui/app-user/tag-editor/app-user-tag-editor.resolver';
import { BaseEditor } from '@common/base/base-editor';
import { TagSetModel } from '@app/ui/app-user/tag-editor/app-user-tag-editor.model';
import { MultipleAutoCompleteConfiguration } from '@common/modules/auto-complete/multiple/multiple-auto-complete-configuration';
import { Observable } from 'rxjs';
import { TagType } from '@app/core/enum/tag-type.enum';

@Component({
	selector: 'app-app-user-tag-editor',
	templateUrl: './app-user-tag-editor.component.html',
	styleUrls: ['./app-user-tag-editor.component.scss'],
	encapsulation: ViewEncapsulation.None

})
export class AppUserTagEditorComponent extends BaseEditor<TagSetModel, Tag[]> implements OnInit {

	@Input() user : AppUser;

	isNew = true;
	isDeleted = false;
	saveClicked = false;
	formGroup: FormGroup = null;

	id: Guid;

	tags : Tag[];
	assignedHashtagTags: Tag[];
	assignedDisciplineTags: Tag[];

	disciplineTagMultipleAutocompleteConfiguration: MultipleAutoCompleteConfiguration = {
		initialItems: this.initialMultipleDisciplineTagItems.bind(this),
		filterFn: this.disciplineTagMultipleFilterFn.bind(this),
		displayFn: (item: Tag) => item.label,
		titleFn: (item: Tag) => item.label
	};

	hashtagTagMultipleAutocompleteConfiguration: MultipleAutoCompleteConfiguration = {
		initialItems: this.initialMultipleHashtagTagItems.bind(this),
		filterFn: this.hashtagTagMultipleFilterFn.bind(this),
		displayFn: (item: Tag) => item.label,
		titleFn: (item: Tag) => item.label
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
		private tagService: TagService,
		private userService: AppUserService,
		private logger: LoggingService
	) {
		super(dialog, language, formService, router, uiNotificationService, httpErrorHandlingService, filterService, datePipe, route, queryParamsService); 
	}

	ngOnInit(): void {
		var tagLookup = new TagLookup();
		tagLookup.isActive = [IsActive.Active];
		tagLookup.appliesTo = [TagAppliesTo.All, TagAppliesTo.User]
		tagLookup.project = {
			fields: [
				nameof<Tag>(x => x.id),
				nameof<Tag>(x => x.label),
				nameof<Tag>(x => x.appliesTo),
				nameof<Tag>(x => x.type),
			]
		};

		this.tagService.query(tagLookup).subscribe(data => this.tags = data.items);

		this.id = this.user?.id;
		if( this.user?.assignedTagIds) {
			this.assignedHashtagTags = this.user.assignedTagIds.filter(x => x.type == TagType.Hashtag);
			this.assignedDisciplineTags = this.user.assignedTagIds.filter(x => x.type == TagType.Discipline);
		}
		this.prepareForm(this.user?.assignedTagIds?.length > 0 ? this.user.assignedTagIds : null);
		
		this.route.queryParamMap.pipe(takeUntil(this._destroyed)).subscribe((params: ParamMap) => {
			// If lookup is on the query params load it
			if (params.keys.length > 0 && params.has('lookup')) {
				this.lookupParams = this.queryParamsService.deSerializeLookup(params.get('lookup'));
			}
		});
	}

	getItem(itemId: Guid, successFunction: (item: Tag[]) => void): void {}

	prepareForm(data: Tag[]): void {
		try {
			this.editorModel = data ? new TagSetModel().fromTags(data) : new TagSetModel();
			// this.isDeleted = this.currentTag != null && data == null;
			this.buildForm();
		} catch {
			this.logger.error('Could not parse Tags: ' + data);
			this.uiNotificationService.snackBarNotification(this.language.instant('COMMONS.ERRORS.DEFAULT'), SnackBarNotificationLevel.Error);
		}
	}

	formSubmit(): void {
		this.formGroup.get('tagIds').setValue(this.assignedDisciplineTags.map(x => x.id).concat(this.assignedHashtagTags.map(x => x.id)));
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
				// 	this.userService.unassignTag(this.id, value).pipe(takeUntil(this._destroyed))
				// 		.subscribe(
				// 			_ => this.onCallbackSuccess(),
				// 			error => this.onCallbackError(error)
				// 		);
				}
			});
		}
	}

	refreshData(): void {
		this.getPair(this.id, this.editorModel.tagIds, (data: Tag[]) => this.prepareForm(data));
	}

	refreshOnNavigateToData(id?: Guid): void {
		if (this.isNew) {
			this.formGroup.markAsPristine();
			this.router.navigate(['/app-users/' + (id ? id : this.id)], { queryParams: { 'lookup': this.queryParamsService.serializeLookup(this.lookupParams), 'lv': ++this.lv }, replaceUrl: true });
		} else { this.refreshData(); }
	}

	persistEntity(onSuccess?: (response) => void) : void {
		this.formService.touchAllFormFields(this.formGroup);
		if (!this.formGroup.valid) {
			return;
		} 

		var userFields =  [ nameof<AppUser>(x => x.id) ]

		this.userService.setTags(this.id,this.formGroup.getRawValue(), userFields)
		.pipe(takeUntil(this._destroyed)).subscribe(
			complete => onSuccess ? onSuccess(complete) : this.onCallbackSuccess(complete),
			error => this.onCallbackError(error)
		);
	}

	buildForm() {
		this.formGroup = this.editorModel.buildForm(null, this.isNew, !this.authService.hasPermission(AppPermission.EditUser));
	}

	getPair(itemId: Guid, tagIds: Guid[], successFunction: (item: Tag[]) => void): void {
		this.userService.getSingle(itemId, AppUserTagEditorResolver.lookupFields())
			.pipe(map(data => data as AppUser), takeUntil(this._destroyed))
			.subscribe(
				data => successFunction( data?.assignedTagIds.filter(x => tagIds.includes(x.id))),
				error => this.onCallbackError(error)
			);
	}

	public cancel(): void {
		this.router.navigate(['../..'], { relativeTo: this.route, queryParams: { 'lookup': this.queryParamsService.serializeLookup(this.lookupParams), 'lv': ++this.lv }, replaceUrl: true });// ! lv is always zero . replaceUrl?
	}

	get disciplineTags(): Tag[] {
		return this.assignedDisciplineTags;
	}
	set disciplineTags(value: Tag[]) {
		if( value != null )
		{
			this.assignedDisciplineTags = value;
		}
	}

	get hashtagTags(): Tag[] {
		return this.assignedHashtagTags;
	}
	set hashtagTags(value: Tag[]) {
		if( value != null )
		{
			this.assignedHashtagTags = value;
		}
	}

	private initialMultipleDisciplineTagItems(selectedItem?: Tag): Observable<Tag[]> {
		var tagLookup = new TagLookup();
		tagLookup.excludedIds = this.assignedDisciplineTags.map(x => x.id);
		tagLookup.isActive = [IsActive.Active];
		tagLookup.type = [TagType.Discipline];
		tagLookup.appliesTo = [TagAppliesTo.User, TagAppliesTo.All];
		tagLookup.project = {
			fields: [
				nameof<Tag>(x => x.id),
				nameof<Tag>(x => x.label)
			]
		}
		return this.tagService.query(tagLookup).pipe(map(x => x.items));
	}

	private disciplineTagMultipleFilterFn(searchQuery: string, selectedItem?: Tag): Observable<Tag[]> {
		var tagLookup = new TagLookup();
		tagLookup.excludedIds = this.assignedDisciplineTags.map(x => x.id);
		tagLookup.isActive = [IsActive.Active];
		tagLookup.type = [TagType.Discipline];
		tagLookup.appliesTo = [TagAppliesTo.User, TagAppliesTo.All];
		tagLookup.like = this.filterService.transformLike(searchQuery);
		tagLookup.project = {
			fields: [
				nameof<Tag>(x => x.id),
				nameof<Tag>(x => x.label)
			]
		}
		return this.tagService.query(tagLookup).pipe(map(x => x.items));
	}

	private initialMultipleHashtagTagItems(selectedItem?: Tag): Observable<Tag[]> {
		var tagLookup = new TagLookup();
		tagLookup.excludedIds = this.assignedHashtagTags.map(x => x.id);
		tagLookup.isActive = [IsActive.Active];
		tagLookup.type = [TagType.Hashtag];
		tagLookup.appliesTo = [TagAppliesTo.User, TagAppliesTo.All];
		tagLookup.project = {
			fields: [
				nameof<Tag>(x => x.id),
				nameof<Tag>(x => x.label)
			]
		}
		return this.tagService.query(tagLookup).pipe(map(x => x.items));
	}

	private hashtagTagMultipleFilterFn(searchQuery: string, selectedItem?: Tag): Observable<Tag[]> {
		var tagLookup = new TagLookup();
		tagLookup.excludedIds = this.assignedHashtagTags.map(x => x.id);
		tagLookup.isActive = [IsActive.Active];
		tagLookup.type = [TagType.Hashtag];
		tagLookup.appliesTo = [TagAppliesTo.User, TagAppliesTo.All];
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
