using Cite.EvalIt.Model;
using Cite.Tools.FieldSet;
using System;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectReview
{
	public interface IDataObjectReviewService
	{
		Task<Model.DataObjectReview> PersistAsync(Guid currUserId, Guid dataObjectId, DataObjectReviewPersist review, IFieldSet fields = null);
		Task DeleteAndSaveAsync(Guid currentUserId, Guid dataObjectId, Guid reviewId);
		Task<float?> ReviewRankCalculate(Data.DataObjectReview review);
	}
}
