using Cite.Tools.FieldSet;
using System;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.Tag
{
	public interface ITagService
	{
		Task<Model.Tag> PersistAsync(Model.TagPersist model, IFieldSet fields = null);
		Task DeleteAndSaveAsync(Guid id);
	}
}
