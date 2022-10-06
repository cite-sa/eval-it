using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.Common
{
	public class NotificationFieldData
	{
		public class FieldInfo
		{
			public enum DataType : short
			{
				Integer = 0,
				Decimal = 1,
				Double = 2,
				DateTime = 3,
				TimeSpan = 4,
				String = 5
			}
			public String Key { get; set; }
			public DataType Type { get; set; }
			public String Value { get; set; }
		}
		public List<FieldInfo> Fields { get; set; }
	}
}
