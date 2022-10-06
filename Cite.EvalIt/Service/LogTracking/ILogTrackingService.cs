using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.Service.LogTracking
{
	public interface ILogTrackingService
	{
		void Trace(String correlationId, String message);
	}
}
