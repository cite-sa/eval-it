using Cite.EvalIt.Common;
using Cite.Tools.Data.Query;
using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.Query
{
	public class TagLookup : Lookup
	{
		public String Like { get; set; }
		public List<Guid> Ids { get; set; }
		public List<Guid> ExcludedIds { get; set; }
		public List<Guid> UserIds { get; set; }
		public List<Guid> ExcludedUserIds { get; set; }
		public List<Guid> DataObjectIds { get; set; }
		public List<Guid> ExcludedDataObjectIds { get; set; }
		public List<IsActive> IsActive { get; set; }
		public List<TagAppliesTo> AppliesTo { get; set; }
		public List<TagType> Type { get; set; }
	}
}
