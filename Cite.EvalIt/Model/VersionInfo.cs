using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.Model
{
	public class VersionInfo
	{
		public String Key { get; set; }
		public String Version { get; set; }
		public DateTime? ReleasedAt { get; set; }
		public DateTime? DeployedAt { get; set; }
		public String Description { get; set; }
	}
}
