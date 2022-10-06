using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.Common
{
	public class BoundedType<T> where T : IComparable
	{
		public T Value { get; set; }
		public UpperBoundType UpperBoundType { get; set; }
	}

	public static class Extensions
    {
		public static int SearchBoundList<T>(this List<BoundedType<T>> data, T value) where T : IComparable
		{
			int startIndex = 0;
			int endIndex = data.Count - 1;

			if (endIndex == -1) return 0;

			if (data[endIndex].Value.CompareTo(value) < 0 || (data[endIndex].Value.CompareTo(value) == 0 && data[endIndex].UpperBoundType == Common.UpperBoundType.Exclusive)) return endIndex + 1;
			if (data[startIndex].Value.CompareTo(value) > 0 || (data[startIndex].Value.CompareTo(value) == 0 && data[startIndex].UpperBoundType == Common.UpperBoundType.Inclusive)) return startIndex;

			while (startIndex < endIndex - 1)
			{
				int middleIndex = startIndex + ((endIndex - startIndex) / 2);
				if (data[middleIndex].Value.CompareTo(value) == 0 && data[middleIndex].UpperBoundType == Common.UpperBoundType.Inclusive) return middleIndex;
				else if (data[middleIndex].Value.CompareTo(value) > 0) endIndex = middleIndex;
				else startIndex = middleIndex;
			}

			return endIndex;
		}
	}

	public class RangePartition<T> where T : IComparable
	{
		public StrategyRangeInterpretation? RangeInterpretation { get; set; }
		public List<BoundedType<T>> RangeBounds { get; set; }
		public List<T> RangeValues { get; set; }
	}
}
