using Cite.EvalIt.Model;
using Cite.Tools.FieldSet;
using System;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.DataObjectReviewFeedback
{
	public interface IDataObjectReviewFeedbackService
	{
		Task<Model.DataObjectReviewFeedback> PersistAsync(Guid currUserId, Guid dataObjectId, Guid reviewId, DataObjectReviewFeedbackPersist review, IFieldSet fields = null);
		Task DeleteAndSaveAsync(Guid currentUserId, Guid dataObjectId, Guid reviewId, Guid feedbackId);
	}
}
