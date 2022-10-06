import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { BackendErrorValidator, E164PhoneValidator } from '@common/forms/validation/custom-validator';
import { ValidationErrorModel } from '@common/forms/validation/error-model/validation-error-model';
import { Validation, ValidationContext } from '@common/forms/validation/validation-context';
import { Guid } from '@common/types/guid';
import { ContactInfoType } from '@user-service/core/enum/contact-info-type.enum';
import { UserContactInfoPatch, UserServiceUser, UserServiceUserContactInfo, UserServiceUserContactInfoPersist } from '@user-service/core/model/user.model';

export class UserProfileContactInfoEditorModel implements UserContactInfoPatch {
	id: Guid;
	hash: string;
	contacts: UserContactInfoEditorModel[];

	public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();
	protected formBuilder: FormBuilder = new FormBuilder();

	constructor() { }

	public fromModel(item: UserServiceUser): UserProfileContactInfoEditorModel {
		this.id = item.id;
		this.hash = item.hash;
		if (item.contacts) { this.contacts = item.contacts.filter(x => x.type !== ContactInfoType.Email).map(x => new UserContactInfoEditorModel().fromModel(x)); }
		if (!this.contacts) { this.contacts = []; }
		if (this.contacts.filter(x => x.type === ContactInfoType.MobilePhone)[0] === undefined) { this.contacts.unshift(new UserContactInfoEditorModel(ContactInfoType.MobilePhone)); }
		if (this.contacts.filter(x => x.type === ContactInfoType.LandLinePhone)[0] === undefined) { this.contacts.push(new UserContactInfoEditorModel(ContactInfoType.LandLinePhone)); }

		return this;
	}

	buildForm(disabled: boolean = false): FormGroup {
		const context = this.createValidationContext();

		const contactsFormArray = new Array<FormGroup>();
		if (this.contacts) {
			for (let i = 0; i < this.contacts.length; i++) {
				const contact = this.contacts[i];
				contactsFormArray.push(contact.buildForm(context.getValidation('contacts[' + i + ']').descendantValidations, disabled));
			}
		}

		return this.formBuilder.group({
			id: [{ value: this.id, disabled: disabled }, context.getValidation('id').validators],
			hash: [{ value: this.hash, disabled: disabled }, context.getValidation('hash').validators],
			contacts: this.formBuilder.array(contactsFormArray),
		});
	}

	createValidationContext(): ValidationContext {
		const baseContext: ValidationContext = new ValidationContext();
		const baseValidationArray: Validation[] = new Array<Validation>();
		baseValidationArray.push({ key: 'id', validators: [BackendErrorValidator(this.validationErrorModel, 'Id')] });
		baseValidationArray.push({ key: 'hash', validators: [BackendErrorValidator(this.validationErrorModel, 'Hash')] });

		if (this.contacts) {
			for (let i = 0; i < this.contacts.length; i++) {
				const contact = this.contacts[i];
				const contactContext = contact.createValidationContextSubItem(`Contacts[${i}]`, this.validationErrorModel);
				baseValidationArray.push({ key: `contacts[${i}]`, descendantValidations: contactContext });
			}
		}

		baseContext.validation = baseValidationArray;
		return baseContext;
	}
}

export class UserContactInfoEditorModel implements UserServiceUserContactInfoPersist {
	type: ContactInfoType;
	value: string;

	public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();
	protected formBuilder: FormBuilder = new FormBuilder();

	constructor(type?: ContactInfoType) { this.type = type; }

	public fromModel(item: UserServiceUserContactInfo): UserContactInfoEditorModel {
		this.type = item.type;
		this.value = item.value;
		return this;
	}

	buildForm(context: ValidationContext, disabled: boolean = false): FormGroup {
		return this.formBuilder.group({
			type: [{ value: this.type, disabled: disabled }, context.getValidation('type').validators],
			value: [{ value: this.value, disabled: disabled }, this.getValidatorsForType(this.type, context)],
		});
	}

	getValidatorsForType(contactInfoType: ContactInfoType, context: ValidationContext): ValidatorFn[] {
		switch (contactInfoType) {
			case ContactInfoType.Email:
				return context.getValidation('emailValue').validators;
			case ContactInfoType.MobilePhone:
				return context.getValidation('mobilePhoneValue').validators;
			case ContactInfoType.LandLinePhone:
				return context.getValidation('landlinePhoneValue').validators;
			default:
				return context.getValidation('value').validators;
		}
	}
	createValidationContextSubItem(baseProperty: string, validationEM: ValidationErrorModel): ValidationContext {
		this.validationErrorModel = validationEM;
		const baseContext: ValidationContext = new ValidationContext();
		const baseValidationArray: Validation[] = new Array<Validation>();
		baseValidationArray.push({ key: 'type', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, `${baseProperty}.Type`)] });
		baseValidationArray.push({ key: 'value', validators: [BackendErrorValidator(this.validationErrorModel, `${baseProperty}.Value`)] });
		baseValidationArray.push({ key: 'emailValue', validators: [BackendErrorValidator(this.validationErrorModel, `${baseProperty}.Value`)] });
		baseValidationArray.push({ key: 'mobilePhoneValue', validators: [E164PhoneValidator(), BackendErrorValidator(this.validationErrorModel, `${baseProperty}.Value`)] });
		baseValidationArray.push({ key: 'landlinePhoneValue', validators: [E164PhoneValidator(), BackendErrorValidator(this.validationErrorModel, `${baseProperty}.Value`)] });
		baseContext.validation = baseValidationArray;

		return baseContext;
	}
}
