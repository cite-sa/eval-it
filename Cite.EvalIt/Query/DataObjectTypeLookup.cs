using Cite.EvalIt.Common;
using Cite.Tools.Data.Query;
using System;
using System.Collections.Generic;

namespace Cite.EvalIt.Query
{
	public class DataObjectTypeLookup : Lookup
	{
		public string Like { get; set; }
		public List<Guid> Ids { get; set; }
		public List<Guid> ExcludedIds { get; set; }
		public List<IsActive> IsActive { get; set; }
	}
}
