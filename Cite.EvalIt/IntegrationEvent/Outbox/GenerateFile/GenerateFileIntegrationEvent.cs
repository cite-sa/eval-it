using System;
using System.Collections.Generic;
using System.Text;

namespace Cite.EvalIt.IntegrationEvent.Outbox
{
	public class GenerateFileIntegrationEvent : TrackedEvent
	{
		public Guid Id { get; set; }
		public Guid UserId { get; set; }
		public String Data { get; set; }
		public Guid? TemplateId { get; set; }
		public Guid? TemplateKey { get; set; }
		public String Lanuage { get; set; }
		public String FileName { get; set; }
		public Boolean? AsPdf { get; set; }
		public Guid FileId { get; set; }
		public int Lifetime { get; set; }
	}
}
