using Cite.EvalIt.Common;
using Cite.EvalIt.Common.Validation;
using Cite.EvalIt.Convention;
using Cite.EvalIt.ErrorCode;
using Cite.EvalIt.Service.DataObjectType.DataObjectAttributeHelper;
using Cite.EvalIt.Service.DataObjectType.RegistrationInformationInputOptionHelper;
using Cite.Tools.Validation;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Cite.EvalIt.Model
{
	public class DataObject
	{
		[BsonId]
		[BsonIgnoreIfDefault]
		public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public List<Data.PersistentID> UserDefinedIds { get; set; }
		public Guid UserId { get; set; }
		public User User { get; set; }
		public Guid? DataObjectTypeId {get; set;}
		public DataObjectType DataObjectType { get; set; }
		public DataObjectAttributeData AttributeData { get; set; }
		public IEnumerable<DataObjectReview> Reviews { get; set; }
		public float? RankScore { get; set; }
		public IsActive IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public String Hash { get; set; }
		public bool CanWriteReview { get; set; }
		public bool CanEdit { get; set; }
		public IEnumerable<Tag> AssignedTagIds { get; set; }
    }
    public class DataObjectPersist
	{
		public Guid? Id { get; set; }
		public string Title { get; set; }
        public string Description { get; set; }
        public List<Data.PersistentID> UserDefinedIds { get; set; }
		public Guid UserId { get; set; }
        public Guid DataObjectTypeId { get; set; }
		public DataObjectTypePersist DataObjectType { get; set; }
		public DataObjectAttributeDataPersist AttributeData { get; set; }
		public String Hash { get; set; }
		public class DataObjectPersistValidator : BaseValidator<DataObjectPersist>
		{
            public DataObjectPersistValidator(
                DataObjectAttributeHelperFactory<DataObjectAttributeType, IDataObjectAttributeHelper> dataObjectAttributeHelperFactory,
				RegistrationInformationInputOptionHelperFactory<RegistrationInformationType, IRegistrationInformationInputOptionHelper> registrationInformationInputOptionHelperFactory,
				IConventionService conventionService,
				IStringLocalizer<Resources.MySharedResources> localizer,
				ValidatorFactory validatorFactory,
				ILogger<DataObjectPersist> logger,
				Query.DataObjectTypeQuery typeQuery,
				Query.DataObjectQuery objectQuery,
				ErrorThesaurus errors) : base(conventionService, validatorFactory, logger, errors)
			{
				this._typeQuery = typeQuery;
				this._objectQuery = objectQuery;
				this._localizer = localizer;
                this._dataObjectAttributeHelperFactory = dataObjectAttributeHelperFactory;
				this._registrationInformationInputOptionHelperFactory = registrationInformationInputOptionHelperFactory;
			}

			private readonly IStringLocalizer<Resources.MySharedResources> _localizer;
			private readonly Query.DataObjectTypeQuery _typeQuery;
			private readonly Query.DataObjectQuery _objectQuery;
			private readonly DataObjectAttributeHelperFactory<DataObjectAttributeType, IDataObjectAttributeHelper> _dataObjectAttributeHelperFactory;
			private readonly RegistrationInformationInputOptionHelperFactory<RegistrationInformationType, IRegistrationInformationInputOptionHelper> _registrationInformationInputOptionHelperFactory;


			private async Task<bool> AttributesValidation(DataObjectPersist item)
            {
				var attributes = item.AttributeData?.Attributes;
				if (attributes == null) return false;
				Data.DataObjectType type = null; 

				foreach (var attribute in attributes)
                {
					this._validatorFactory.Validator<DataObjectAttributePersist.DataObjectAttributePersistValidator>().ValidateForce(attribute);
				}

				// Try to get self-contained type from object persist
				if (item.DataObjectType != null)
				{
					if (item.DataObjectType.Id != item.DataObjectTypeId) return false;
					if (item.DataObjectType.Info == null || item.DataObjectType.Info.InputOptions == null) return false;

					Data.RegistrationInformation info = new Data.RegistrationInformation
					{
						InputOptions = new List<Data.RegistrationInformationInputOption>()
					};

					foreach (var x in item.DataObjectType.Info.InputOptions.Where(x => x.IsActive == IsActive.Active))
					{
						var temp = this._registrationInformationInputOptionHelperFactory.ChildClass(x.OptionType).NewData();
						temp.Label = x.Label;
						temp.IsMandatory = x.IsMandatory;
						temp.MultiValue = x.MultiValue;
						temp.OptionId = x.OptionId.Value;
						temp.OptionType = x.OptionType;
						temp.IsActive = x.IsActive;
						this._registrationInformationInputOptionHelperFactory.ChildClass(x.OptionType).PersistChildClassFields(temp, (RegistrationInformationInputOptionPersist)x);

						info.InputOptions.Add(temp);
					}

					type = new Data.DataObjectType
					{
						Name = item.DataObjectType.Name,
						Id = item.DataObjectTypeId,
						Info = info
					};

					// Validate self-contained type against pre-existing type
					Data.DataObjectType existingType = (await _typeQuery.Ids(item.DataObjectTypeId).IsActive(IsActive.Active).Collect()).FirstOrDefault();

					if (existingType == null || type.Name != existingType.Name) return false;

					// Self-contained type's options should be a subset of the current existing type's, the only difference being their isActive status

					var dict = existingType.Info.InputOptions.ToDictionary(x => x.OptionId);

					foreach (var option in type.Info.InputOptions)
                    {
						if (!dict.ContainsKey(option.OptionId)) return false;
                    }

				}

				// Try to get self-contained type from object in db
				if (type == null && item.Id != null) type = (await _objectQuery.Ids(item.Id.Value).IsActive(IsActive.Active).Collect()).FirstOrDefault()?.DataObjectType;

				// Try to get type by type id
				if (type == null) type = (await _typeQuery.Ids(item.DataObjectTypeId).IsActive(IsActive.Active).Collect()).FirstOrDefault();

				// Failed to get type
				if (type == null) return false;

                foreach (var option in type.Info.InputOptions)
                {
					var attr = attributes.Where(a => a.OptionId == option.OptionId).FirstOrDefault();

                    if (attr == null && (!option.IsMandatory || option.IsActive == IsActive.Inactive)) continue;
                    else if (attr == null) return false;

                    if (!this._dataObjectAttributeHelperFactory.ChildClass(attr.AttributeType).Validate((DataObjectAttributePersist)attr, option)) return false;
                }

				return true;
            }

			private bool PIDValidation(DataObjectPersist item, out List<String> pidErrorList)
            {
				List<Data.PersistentID> pids = item.UserDefinedIds;
				pidErrorList = new List<String>();
				if (pids == null || pids.Count == 0) return false;

				foreach (var pid in pids)
                {
                    // Validate special pid cases
                    switch (pid.Type)
                    {
						case PersistentIDType.DOI:
							if (string.IsNullOrEmpty(pid.Value)) pidErrorList.Add(nameof(PersistentIDType.DOI));
							break;
						case PersistentIDType.URL:
							Uri uriResult;
							if( !Uri.TryCreate(pid.Value, UriKind.Absolute, out uriResult) || (uriResult.Scheme != Uri.UriSchemeHttp && uriResult.Scheme != Uri.UriSchemeHttps)) pidErrorList.Add(nameof(PersistentIDType.URL));
							break;
						default:
							if (string.IsNullOrEmpty(pid.Key)) pidErrorList.Add(" ");
							else if (string.IsNullOrEmpty(pid.Value)) pidErrorList.Add(pid.Key);
							break;
                    }
                }

				return pidErrorList.Count == 0;
            }

			protected override IEnumerable<ISpecification> Specifications(DataObjectPersist item)
			{
				List<String> pidErrorList = new List<string>();
				return new ISpecification[]{
					//id must be valid guid or null
					this.Spec()
						.Must(() => !(item.Id.HasValue) || ( item.Id.HasValue && this.IsValidGuid(item.Id)) )
						.FailOn(nameof(DataObjectPersist.Id)).FailWith(this._localizer["Validation_Required", nameof(DataObjectPersist.Id)]),
					//title must be non-empty & up to 250 characters
					this.Spec()
						.Must(() => (item.Title != null) && (item.Title.Length > 0) && (item.Title.Length <= 250) )
						.FailOn(nameof(DataObjectPersist.Title)).FailWith(this._localizer["Validation_Required", nameof(DataObjectPersist.Title)]),
                    //description must be non-empty
					this.Spec()
                        .Must(() => (item.Description != null) && (item.Description.Length > 0))
                        .FailOn(nameof(DataObjectPersist.Description)).FailWith(this._localizer["Validation_Required", nameof(DataObjectPersist.Description)]),
					//persistent ID validation
					this.Spec()
						.Must(() => this.PIDValidation((item), out pidErrorList))
						.FailOn(nameof(DataObjectPersist.UserDefinedIds)).FailWith(this._localizer["Validation_Required", nameof(DataObjectPersist.UserDefinedIds) + (pidErrorList.Any() ? ": " + pidErrorList.Aggregate((x,y) => x+ "," + y) : "")]),
					//object type id must be valid guid
					this.Spec()
						.Must(() => this.IsValidGuid(item.DataObjectTypeId) )
						.FailOn(nameof(DataObjectPersist.DataObjectTypeId)).FailWith(this._localizer["Validation_Required", nameof(DataObjectPersist.DataObjectTypeId)]),
					// Object Attribute must conform to specifications in Data Object Type Input 
					this.Spec()
						.Must(() => this.AttributesValidation(item).Result)
						.FailOn(nameof(DataObjectPersist.AttributeData)).FailWith(this._localizer["Validation_Required", nameof(DataObjectPersist.AttributeData)]),

				};
			}
		}
	}



}
