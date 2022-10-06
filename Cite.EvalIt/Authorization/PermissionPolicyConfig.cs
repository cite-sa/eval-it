using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.Authorization
{
	public class PermissionPolicyConfig
	{
		public class PermissionClaims
		{
			public String Claim { get; set; }
			public List<String> Values { get; set; }
		}

		public class PermissionRoles
		{
			public List<String> Roles { get; set; }
			public List<PermissionClaims> Claims { get; set; }
			public List<String> Clients { get; set; }
			public Boolean AllowAnonymous { get; set; } = false;
			public Boolean AllowAuthenticated { get; set; } = false;
		}

		public Dictionary<String, PermissionRoles> Policies { get; set; }
		public List<String> ExtendedClaims { get; set; }
	}
}
