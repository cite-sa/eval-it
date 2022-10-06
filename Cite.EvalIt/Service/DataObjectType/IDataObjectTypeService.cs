using Cite.EvalIt.Model;
using Cite.Tools.FieldSet;
using System;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectType
{
	public interface IDataObjectTypeService
	{
		Task<Model.DataObjectType> PersistAsync(Model.DataObjectTypePersist model, IFieldSet fields = null);
		Task DeleteAndSaveAsync(Guid id);
		Task<Model.DataObjectTypeRankingMethodology> PersistRankingMethodology(Guid dataObjectTypeId, DataObjectTypeRankingMethodologyPersist model, IFieldSet fields = null);
		Task<Model.DataObjectTypeRankingMethodology> DeleteRankingMethodology(Guid dataObjectTypeId, Guid rankingConfigurationId, IFieldSet fields = null);
	}
}
