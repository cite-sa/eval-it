using Cite.Tools.FieldSet;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObject
{
	public interface IDataObjectService
	{
		Task<Model.DataObject> PersistAsync(Model.DataObjectPersist model, IFieldSet fields = null);
		Task DeleteAndSaveAsync(Guid id);
		Task<float?> ObjectRankCalculate(Data.DataObject dataObject);
		Task<Model.DataObject> SetTags(Guid dataObjectId, IEnumerable<Guid> tagIds, IFieldSet fields = null);
	}
}
