using Cite.EvalIt.Authorization;
using Cite.EvalIt.Query;
using Cite.Tools.Common.Extensions;
using Cite.Tools.Data.Builder;
using Cite.Tools.Data.Query;
using Cite.Tools.FieldSet;
using Cite.Tools.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Cite.Tools.Auth.Claims;

namespace Cite.EvalIt.Web.Model
{
	public class Account
	{
		public class ProfileInfo
		{
			public String Timezone { get; set; }
			public String Culture { get; set; }
			public String Language { get; set; }
		}

		public class PrincipalInfo
		{
			public Guid? Subject { get; set; }
			[LogSensitive]
			public String Name { get; set; }
			public List<String> Scope { get; set; }
			public String Client { get; set; }
			public DateTime? NotBefore { get; set; }
			public DateTime? AuthenticatedAt { get; set; }
			public DateTime? ExpiresAt { get; set; }
			[LogSensitive]
			public Dictionary<String, List<String>> More { get; set; }
		}

		public Boolean IsAuthenticated { get; set; }
		public PrincipalInfo Principal { get; set; }
		public List<String> Permissions { get; set; }
		public ProfileInfo Profile { get; set; }
	}

	public class AccountBuilder
	{
		private readonly IQueryingService _queryingService;
		private readonly UserQuery _userQuery;
		private readonly BuilderFactory _builderFactory;
		private readonly IPermissionPolicyService _permissionPolicyService;
		private readonly ClaimExtractor _extractor;
		private readonly PermissionPolicyConfig _permissionConfig;

		public AccountBuilder(
			IQueryingService queryingService,
			UserQuery userQuery,
			BuilderFactory builderFactory,
			IPermissionPolicyService permissionPolicyService,
			ClaimExtractor extractor,
			PermissionPolicyConfig permissionConfig)
		{
			this._queryingService = queryingService;
			this._userQuery = userQuery;
			this._builderFactory = builderFactory;
			this._permissionPolicyService = permissionPolicyService;
			this._extractor = extractor;
			this._permissionConfig = permissionConfig;
		}

		private List<String> _additionalClaimKeys;
		private List<String> AdditionalClaimKeys
		{
			get
			{
				if (this._additionalClaimKeys == null)
				{
					this._additionalClaimKeys = this._extractor.KnownPublicKeys.Except(new String[] {
						ClaimExtractorKeys.Subject,
						ClaimExtractorKeys.Name,
						ClaimExtractorKeys.Scope,
						ClaimExtractorKeys.Client,
						ClaimExtractorKeys.NotBefore,
						ClaimExtractorKeys.AuthenticatedAt,
						ClaimExtractorKeys.ExpiresAt,
						ClaimExtractorKeys.Roles,
						ClaimExtractorKeys.Tenant
					}).ToList();
				}
				return this._additionalClaimKeys;
			}
		}

		//TODO: depending on the requested fields, we might be able to remove some data collection. add some field checking conditions
		public async Task<Account> Build(IFieldSet fields, ClaimsPrincipal principal)
		{
			Account model = new Account();
			if (principal == null)
			{
				model.IsAuthenticated = false;
				return model;
			}
			else model.IsAuthenticated = true;

			EvalIt.Model.User user = null;

			Guid? subjectId = this._extractor.SubjectGuid(principal);

			if (subjectId.HasValue)
			{
				IFieldSet userFields = new FieldSet(
					nameof(EvalIt.Model.User.Id),
					new String[] { nameof(EvalIt.Model.User.Profile), nameof(EvalIt.Model.UserProfile.Timezone) }.AsIndexer(),
					new String[] { nameof(EvalIt.Model.User.Profile), nameof(EvalIt.Model.UserProfile.Language) }.AsIndexer(),
					new String[] { nameof(EvalIt.Model.User.Profile), nameof(EvalIt.Model.UserProfile.Culture) }.AsIndexer());

				var data = await this._userQuery.Ids(subjectId.Value).Collect();
				user = (await this._builderFactory.Builder<EvalIt.Model.UserBuilder>().Build(userFields, data)).FirstOrDefault();
			}

			IFieldSet principalFields = fields.ExtractPrefixed(nameof(Account.Principal).AsIndexerPrefix());
			IFieldSet profileFields = fields.ExtractPrefixed(nameof(Account.Profile).AsIndexerPrefix());

			if (!principalFields.IsEmpty()) model.Principal = new Account.PrincipalInfo();
			if (principalFields.HasField(nameof(Account.Principal.Subject))) model.Principal.Subject = subjectId;
			if (principalFields.HasField(nameof(Account.Principal.Name))) model.Principal.Name = this._extractor.Name(principal);
			if (principalFields.HasField(nameof(Account.Principal.Scope))) model.Principal.Scope = this._extractor.Scope(principal);
			if (principalFields.HasField(nameof(Account.Principal.Client))) model.Principal.Client = this._extractor.Client(principal);
			if (principalFields.HasField(nameof(Account.Principal.NotBefore))) model.Principal.NotBefore = this._extractor.NotBefore(principal);
			if (principalFields.HasField(nameof(Account.Principal.AuthenticatedAt))) model.Principal.AuthenticatedAt = this._extractor.AuthenticatedAt(principal);
			if (principalFields.HasField(nameof(Account.Principal.ExpiresAt))) model.Principal.ExpiresAt = this._extractor.ExpiresAt(principal);
			if (principalFields.HasField(nameof(Account.Principal.More)))
			{
				model.Principal.More = new Dictionary<string, List<string>>();
				foreach (String key in this.AdditionalClaimKeys)
				{
					if (!model.Principal.More.ContainsKey(key)) model.Principal.More.Add(key, new List<string>());
					model.Principal.More[key].AddRange(this._extractor.AsStrings(principal, key));
				}
			}

			if (fields.HasField(nameof(Account.Permissions)))
			{
				HashSet<String> permissions = new HashSet<string>(this._permissionPolicyService.PermissionsOfRoles(this._extractor.Roles(principal)));
				if (this._permissionConfig.ExtendedClaims != null)
				{
					foreach (String claimType in this._permissionConfig.ExtendedClaims)
					{
						permissions.AddRange(this._permissionPolicyService.PermissionsOfClaims(claimType, this._extractor.AsStrings(principal, claimType)));
					}
				}
				model.Permissions = new List<string>(permissions);
			}

			if (!profileFields.IsEmpty()) model.Profile = new Account.ProfileInfo();
			if (profileFields.HasField(nameof(Account.Profile.Language))) model.Profile.Language = user?.Profile?.Language;
			if (profileFields.HasField(nameof(Account.Profile.Timezone))) model.Profile.Timezone = user?.Profile?.Timezone;
			if (profileFields.HasField(nameof(Account.Profile.Culture))) model.Profile.Culture = user?.Profile?.Culture;

			return model;
		}
	}
}
