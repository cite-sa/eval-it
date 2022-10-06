using Cite.EvalIt.Authorization;
using Cite.EvalIt.Common;
using Cite.EvalIt.Data.Context;
using Cite.EvalIt.Model;
using Cite.EvalIt.Query;
using Cite.Tools.Data.Builder;
using Cite.Tools.Data.Query;
using Cite.Tools.Exception;
using Cite.Tools.FieldSet;
using Cite.Tools.Logging;
using Cite.Tools.Logging.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace Cite.EvalIt.Service.RankRecalculationTask
{
	public class RankRecalculationTaskService : IRankRecalculationTaskService
	{
		private readonly BuilderFactory _builderFactory;
		private readonly QueryFactory _queryFactory;
		private readonly AppDbContext _queueDbContext;
		private readonly IAuthorizationService _authorizationService;
		private readonly ILogger<RankRecalculationTaskService> _logger;
		private readonly DataObjectReviewQuery _dataObjectReviewQuery;
		private readonly DataObjectQuery _dataObjectQuery;
		private readonly IStringLocalizer<Resources.MySharedResources> _localizer;

		public RankRecalculationTaskService(
			BuilderFactory builderFactory,
			QueryFactory queryFactory,
			AppDbContext queueDbContext,
			IAuthorizationService authorizationService,
			ILogger<RankRecalculationTaskService> logger,
			DataObjectReviewQuery dataObjectReviewQuery,
			DataObjectQuery dataObjectQuery,
			IStringLocalizer<Resources.MySharedResources> localizer
			)
		{
			this._builderFactory = builderFactory;
			this._queryFactory = queryFactory;
			this._queueDbContext = queueDbContext;
			this._authorizationService = authorizationService;
			this._logger = logger;
			this._dataObjectQuery = dataObjectQuery;
			this._dataObjectReviewQuery = dataObjectReviewQuery;
			this._localizer = localizer;
		}

		public async Task<Model.RankRecalculationTask> AddReviewRankRecalculationTask(Guid userId, IFieldSet fields = null)
		{
			this._logger.Debug(new MapLogEntry("adding task by user").And("user", userId));

			await this._authorizationService.AuthorizeForce(Permission.EditRankRecalculationTask);

			int? reviewCount = await this._dataObjectReviewQuery.CountAll();
			int? objectCount = await this._dataObjectQuery.CountAll();
			DateTime currTime = DateTime.UtcNow;

			Data.RankRecalculationTask task = new Data.RankRecalculationTask()
			{
				Id = new Guid(),
				RequestingUserId = userId,
				IsActive = IsActive.Active,
				CreatedAt = currTime,
				UpdatedAt = currTime,
				FinishedAt = null,
				ReviewRankingsToCalculate = reviewCount ?? 0,
				FailedReviewRankings = 0,
				SuccessfulReviewRankings = 0,
				ObjectRankingsToCalculate = objectCount ?? 0,
				FailedObjectRankings = 0,
				SuccessfulObjectRankings = 0,
				TaskStatus = RankRecalculationTaskStatus.Pending
			};

			this._queueDbContext.Add(task);
			await this._queueDbContext.SaveChangesAsync();

			return await this._builderFactory.Builder<RankRecalculationTaskBuilder>().Build(fields, task);
		}

		public async Task<Model.RankRecalculationTask> CancelReviewRankRecalculationTask(Guid taskId, Guid userId, IFieldSet fields = null)
		{
			this._logger.Debug(new MapLogEntry("cancelling").And("task", taskId).And("user", userId));

			Data.RankRecalculationTask task = await this._queryFactory.Query<RankRecalculationTaskQuery>()
				.Ids(taskId)
				.IsActive(IsActive.Active)
				.FirstAsync();

			if (task == null) throw new MyNotFoundException(this._localizer["General_ItemNotFound", taskId, nameof(Model.RankRecalculationTask)]);
			await this._authorizationService.AuthorizeOrOwnerForce(new OwnedResource(task.RequestingUserId), Permission.EditRankRecalculationTask);
			if (task.TaskStatus != RankRecalculationTaskStatus.Processing && task.TaskStatus != RankRecalculationTaskStatus.Pending) throw new MyValidationException("Task has finished or has been aborted");

			if (task.TaskStatus == RankRecalculationTaskStatus.Pending)
			{
				// Abort pending tasks immediately
				task.TaskStatus = RankRecalculationTaskStatus.Aborted;
				task.FinishedAt = DateTime.UtcNow;
			}
			else task.TaskStatus = RankRecalculationTaskStatus.Cancelled;
			task.UpdatedAt = DateTime.UtcNow;

			this._queueDbContext.Update(task);
			var saved = false;
			while (!saved)
            {
				try
				{
					await this._queueDbContext.SaveChangesAsync();
					saved = true;
				}
				catch (DbUpdateConcurrencyException ex)
				{
					this._logger.Information(ex, $"Concurrency error when updating ranking db, attempting to resolve");

					foreach (var entry in ex.Entries)
					{
						if (entry.Entity is Data.RankRecalculationTask)
						{
							var proposedValues = entry.CurrentValues;
							var databaseValues = entry.GetDatabaseValues();

							foreach (var property in proposedValues.Properties)
							{
								var proposedValue = proposedValues[property];
								var databaseValue = databaseValues[property];

								if (property.Name == nameof(Data.RankRecalculationTask.TaskStatus)) proposedValues[property] = proposedValue;
                                else proposedValues[property] = databaseValue;
							}
							entry.OriginalValues.SetValues(databaseValues);
						}
					}
				}
				catch (System.Exception ex)
                {
					this._logger.Information(ex, $"Unexpected error when canceling a rank recalculation task");
					return null;
                }
            }

			return await this._builderFactory.Builder<RankRecalculationTaskBuilder>().Build(fields, task);
		}
	}
}