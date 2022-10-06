using Cite.EvalIt.Common;
using Cite.EvalIt.Data.Context;
using Cite.EvalIt.Query;
using Cite.EvalIt.Service.DataObject;
using Cite.EvalIt.Service.DataObjectReview;
using Cite.Tools.Data.Query;
using Cite.Tools.Logging.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Cite.EvalIt.Web.Tasks.RankRecalculator
{
	public class RankRecalculatorTask : Microsoft.Extensions.Hosting.BackgroundService
	{
		private readonly ILogger _logging;
		private readonly IServiceProvider _serviceProvider;
		private readonly RankRecalculatorConfig _recalculatorConfig;

		private Task activeTask = null;
		private Guid? activeTaskId = null;

		public RankRecalculatorTask(
			ILogger<RankRecalculatorTask> logging,
			RankRecalculatorConfig recalculatorConfig,
			IServiceProvider serviceProvider)
		{
			this._logging = logging;
			this._recalculatorConfig = recalculatorConfig;
			this._serviceProvider = serviceProvider;
		}

		protected override async Task ExecuteAsync(CancellationToken stoppingToken)
		{
			this._logging.Debug("starting...");

			stoppingToken.Register(() => this._logging.Information($"requested to stop..."));
			stoppingToken.ThrowIfCancellationRequested();

			var tokenSource = new CancellationTokenSource();

			while (!stoppingToken.IsCancellationRequested)
			{
				try
				{
					this._logging.Debug($"going to sleep for {this._recalculatorConfig.IntervalSeconds} seconds...");
					await Task.Delay(TimeSpan.FromSeconds(this._recalculatorConfig.IntervalSeconds), stoppingToken);
				}
				catch (TaskCanceledException ex)
				{
					this._logging.Information($"Task canceled: {ex.Message}");
					break;
				}
				catch (System.Exception ex)
				{
					this._logging.Error(ex, "Error while delaying to recalculate ranks. Continuing");
				}

                try
                {
					if(tokenSource.Token.IsCancellationRequested)
                    {
						tokenSource.Dispose();
						tokenSource = new CancellationTokenSource();
                    }
					await this.Process(tokenSource);
				}
				catch (System.Exception ex)
                {

					//log
					this._logging.Error(ex, "Error while recalculating ranks, Continuing");
					continue;
                }
			}

			this._logging.Information("returning...");

			return;
		}


		private async Task Process(CancellationTokenSource tokenSource)
		{
			var token = tokenSource.Token;

			using (var serviceScope = this._serviceProvider.CreateScope())
			{
				using (AppDbContext dbContext = serviceScope.ServiceProvider.GetService<AppDbContext>())
				{
					QueryFactory queryFactory = serviceScope.ServiceProvider.GetService<QueryFactory>();

					if (this.activeTask == null)
					{
						Data.RankRecalculationTask currentTaskCandidate = await queryFactory.Query<RankRecalculationTaskQuery>()
							.IsActive(IsActive.Active)
							.Status(new RankRecalculationTaskStatus[] { RankRecalculationTaskStatus.Pending, RankRecalculationTaskStatus.Processing, RankRecalculationTaskStatus.Cancelled })
							.Ordering(new Ordering().AddAscending(nameof(Data.RankRecalculationTask.CreatedAt)))
							.FirstAsync();

						if (currentTaskCandidate == null) return;

						currentTaskCandidate.TaskStatus = currentTaskCandidate.TaskStatus == RankRecalculationTaskStatus.Pending ? RankRecalculationTaskStatus.Processing : RankRecalculationTaskStatus.Cancelled;
						currentTaskCandidate.UpdatedAt = DateTime.UtcNow;

						using (var transaction = await dbContext.Database.BeginTransactionAsync())
						{
							var saved = false;
							while (!saved)
							{
								try
								{
									await dbContext.SaveChangesAsync();
									transaction.Commit();

									saved = true;
								}
								catch (DbUpdateConcurrencyException ex)
								{
									this._logging.Information(ex, $"Concurrency error when updating ranking db, attempting to resolve");

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

                                                if (property.Name == nameof(Data.RankRecalculationTask.TaskStatus)) proposedValues[property] = databaseValue;
                                                else proposedValues[property] = proposedValue;
                                            }
                                            entry.OriginalValues.SetValues(databaseValues);
										}
									}
								}
								catch (System.Exception ex)
								{
									this._logging.Error(ex, $"Error updating processing task: {ex.Message}");
									transaction.Rollback();
								}
							}
						}

						this.activeTask = currentTaskCandidate.TaskStatus == RankRecalculationTaskStatus.Processing ? this.RecalculateRanks(currentTaskCandidate.Id, currentTaskCandidate.ReviewRankingsToCalculate, currentTaskCandidate.ObjectRankingsToCalculate, token) : Task.CompletedTask;
						this.activeTaskId = currentTaskCandidate.Id;
					}
					else
					{
						Data.RankRecalculationTask currentTaskCandidate = await queryFactory.Query<RankRecalculationTaskQuery>()
							.IsActive(IsActive.Active)
							.Ids(this.activeTaskId.Value)
							.Status(new RankRecalculationTaskStatus[] { RankRecalculationTaskStatus.Processing, RankRecalculationTaskStatus.Cancelled })
							.Ordering(new Ordering().AddAscending(nameof(Data.RankRecalculationTask.CreatedAt)))
							.FirstAsync();

						if (currentTaskCandidate == null) throw new System.Exception();

						if (currentTaskCandidate.TaskStatus == RankRecalculationTaskStatus.Cancelled)
                        {
							tokenSource.Cancel();
							await this.activeTask;

							using (var transaction = await dbContext.Database.BeginTransactionAsync())
							{
								currentTaskCandidate = await queryFactory.Query<RankRecalculationTaskQuery>()
									.IsActive(IsActive.Active)
									.Ids(this.activeTaskId.Value)
									.Ordering(new Ordering().AddAscending(nameof(Data.RankRecalculationTask.CreatedAt)))
									.FirstAsync();

								currentTaskCandidate.TaskStatus = RankRecalculationTaskStatus.Aborted;
								currentTaskCandidate.UpdatedAt = DateTime.UtcNow;
								currentTaskCandidate.FinishedAt = DateTime.UtcNow;

								dbContext.Update(currentTaskCandidate);

								var saved = false;
								while (!saved)
                                {
									try
									{
										await dbContext.SaveChangesAsync();

										transaction.Commit();

										saved = true;
									}
									catch (DbUpdateConcurrencyException ex)
									{
										this._logging.Information(ex, $"Concurrency error when updating ranking db, attempting to resolve");

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

													proposedValues[property] = proposedValue;
												}
												entry.OriginalValues.SetValues(databaseValues);
											}
										}
									}
									catch (System.Exception ex)
									{
										this._logging.Error(ex, $"Error updating aborted task: {ex.Message}");
										transaction.Rollback();
										break;
									}
								}
							}

							this.activeTask = null;
							this.activeTaskId = null;
						}
						else
                        {
							if( activeTask.IsCompleted )
                            {
								using (var transaction = await dbContext.Database.BeginTransactionAsync())
								{
									currentTaskCandidate = await queryFactory.Query<RankRecalculationTaskQuery>()
										.IsActive(IsActive.Active)
										.Ids(this.activeTaskId.Value)
										.Ordering(new Ordering().AddAscending(nameof(Data.RankRecalculationTask.CreatedAt)))
										.FirstAsync();

									currentTaskCandidate.TaskStatus = RankRecalculationTaskStatus.Successful;
									currentTaskCandidate.UpdatedAt = DateTime.UtcNow;
									currentTaskCandidate.FinishedAt = DateTime.UtcNow;

									dbContext.Update(currentTaskCandidate);

									var saved = false;
									while (!saved)
									{
										try
										{
											await dbContext.SaveChangesAsync();

											transaction.Commit();

											saved = true;
										}
										catch (DbUpdateConcurrencyException ex)
										{
											this._logging.Information(ex, $"Concurrency error when updating ranking db, attempting to resolve");

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

														proposedValues[property] = proposedValue;
													}
													entry.OriginalValues.SetValues(databaseValues);
												}
											}
										}
										catch (System.Exception ex)
										{
											this._logging.Error(ex, $"Error updating aborted task: {ex.Message}");
											transaction.Rollback();
											break;
										}
									}
								}

								this.activeTask = null;
								this.activeTaskId = null;
							}
                        }
					}
				}
			}
		}

		private async Task RecalculateRanks(Guid taskId, int reviewsToRecalculate, int objectsToRecalculate, CancellationToken ct)
        {
			await this.RecalculateReviewRanks(taskId, reviewsToRecalculate, ct);
            await this.RecalculateObjectRanks(taskId, objectsToRecalculate, ct);
        }

		private async Task RecalculateReviewRanks(Guid taskId, int itemsToCalculate, CancellationToken ct)
        {
			int totalSuccesful = 0;
			int totalFailed = 0;

			if (itemsToCalculate == 0) return;

			using (var serviceScope = this._serviceProvider.CreateScope())
			{
				DataObjectReviewQuery query = serviceScope.ServiceProvider.GetService<DataObjectReviewQuery>();
				IDataObjectReviewService reviewService = serviceScope.ServiceProvider.GetService<IDataObjectReviewService>();
				AppMongoDbContext mongoDbContext = serviceScope.ServiceProvider.GetService<AppMongoDbContext>();

				Paging page = new Paging() { Size = this._recalculatorConfig.BatchSize, Offset = 0 };
				Ordering order = new Ordering().AddAscending(nameof(Data.DataObjectReview.CreatedAt));

				IEnumerable<Data.DataObjectReview> reviews = await query.Ordering(order).Pagination(page).Collect();

				bool useTransaction = false;

				using (AppDbContext dbContext = serviceScope.ServiceProvider.GetService<AppDbContext>())
				{
					using ( var session = await mongoDbContext.StartSessionAsync() )
                    {
						if( mongoDbContext.SupportTransaction())
                        {
							try
							{
								mongoDbContext.StartTransaction();
								useTransaction = true;
							}
							catch (System.NotSupportedException ex)
							{
								this._logging.LogTrace("transactions not supported; ", ex);
							}
                        }

						while ( reviews.Count() > 0 && !ct.IsCancellationRequested )
						{
							var updates = new List<WriteModel<Data.DataObject>>();
							foreach (var review in reviews)
							{
								//await Task.Delay(1000); // TODO: Remove when done testing
								try
								{
									float? reviewRank = await reviewService.ReviewRankCalculate(review);

									if (reviewRank == null)
									{
										this._logging.Information($"Recalculation failed for review {review.Id}");
										totalFailed++;
									}
									else
									{
										review.RankScore = reviewRank;
										FilterDefinition<Data.DataObject> reviewFilter = Builders<Data.DataObject>.Filter.ElemMatch(x => x.Reviews, Builders<Data.DataObjectReview>.Filter.Eq(r => r.Id, review.Id));
										var update = Builders<Data.DataObject>.Update.Set(nameof(Data.DataObject.Reviews) + ".$", review);
										updates.Add(new UpdateOneModel<Data.DataObject>(reviewFilter, update));

										totalSuccesful++;
									}
								}
								catch (System.Exception ex)
								{
									this._logging.Error(ex, $"Error while recalculating rank for review {review.Id} : {ex.Message}");
									totalFailed++;
								}
							}

							if (updates.Count > 0)
							{
								try
								{
									await mongoDbContext.BulkWriteAsync(updates, new BulkWriteOptions() { IsOrdered = false });
									if(useTransaction) await mongoDbContext.CommitTransactionAsync();
								}
								catch (System.Exception ex)
								{
									this._logging.Error(ex, $"Error while writing reviews to database after rank recalculation: {ex.Message}");
									totalSuccesful -= updates.Count;
									totalFailed += updates.Count;
									if(useTransaction) await mongoDbContext.AbortTransactionAsync();
								}
							}

							using (var transaction = await dbContext.Database.BeginTransactionAsync())
							{
								QueryFactory queryFactory = serviceScope.ServiceProvider.GetService<QueryFactory>();

								Data.RankRecalculationTask currentTask = await queryFactory.Query<RankRecalculationTaskQuery>().Ids(taskId).FirstAsync();
								if (currentTask == null) throw new System.Exception();

								currentTask.SuccessfulReviewRankings = totalSuccesful;
								currentTask.FailedReviewRankings = totalFailed;
								currentTask.UpdatedAt = DateTime.UtcNow;

								dbContext.Update(currentTask);

								var saved = false;
								while (!saved)
								{
									try
									{
										await dbContext.SaveChangesAsync();

										transaction.Commit();

										saved = true;
									}
									catch (DbUpdateConcurrencyException ex)
									{
										this._logging.Information(ex, $"Concurrency error when updating ranking db, attempting to resolve");

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

													if (property.Name == nameof(Data.RankRecalculationTask.SuccessfulReviewRankings)) proposedValues[property] = proposedValue;
													else if (property.Name == nameof(Data.RankRecalculationTask.FailedReviewRankings)) proposedValues[property] = proposedValue;
													else if (property.Name == nameof(Data.RankRecalculationTask.UpdatedAt)) proposedValues[property] = proposedValue;
													else proposedValues[property] = databaseValue;
												}
												entry.OriginalValues.SetValues(databaseValues);
											}
										}
									}
									catch (System.Exception ex)
									{
										this._logging.Error(ex, $"Error getting current task");
										transaction.Rollback();
										return;
									}
								}
							}
						
							page.Offset += page.Size;
							if (page.Offset + page.Size > itemsToCalculate) page.Size = itemsToCalculate - page.Offset;
							if (page.Size > 0) reviews = await query.Ordering(order).Pagination(page).Collect();
							else reviews = new List<Data.DataObjectReview>();
						}
                    }
                }
			}
			return;
		}

		private async Task RecalculateObjectRanks(Guid taskId, int itemsToCalculate, CancellationToken ct)
        {
			int totalSuccesful = 0;
			int totalFailed = 0;

			if (itemsToCalculate == 0) return;

			using (var serviceScope = this._serviceProvider.CreateScope())
			{
				DataObjectQuery query = serviceScope.ServiceProvider.GetService<DataObjectQuery>();
				IDataObjectService objectService = serviceScope.ServiceProvider.GetService<IDataObjectService>();
				AppMongoDbContext mongoDbContext = serviceScope.ServiceProvider.GetService<AppMongoDbContext>();

				Paging page = new Paging() { Size = this._recalculatorConfig.BatchSize, Offset = 0 };
				Ordering order = new Ordering().AddAscending(nameof(Data.DataObjectReview.CreatedAt));

				IEnumerable<Data.DataObject> objects = await query.Ordering(order).Pagination(page).Collect();

				bool useTransaction = false;

				using (AppDbContext dbContext = serviceScope.ServiceProvider.GetService<AppDbContext>())
				{
					using (var session = await mongoDbContext.StartSessionAsync())
					{
						if (mongoDbContext.SupportTransaction())
						{
							try
							{
								mongoDbContext.StartTransaction();
								useTransaction = true;
							}
							catch (System.NotSupportedException ex)
							{
								this._logging.LogTrace("transactions not supported; ", ex);
							}
						}

						while (objects.Count() > 0 && !ct.IsCancellationRequested)
						{
							var updates = new List<WriteModel<Data.DataObject>>();
							foreach (var obj in objects)
							{
								//await Task.Delay(1000); // TODO: Remove when done testing
								try
								{
									float? objectRank = await objectService.ObjectRankCalculate(obj);

									if (objectRank == null)
									{
										this._logging.Information($"Recalculation failed for data object {obj.Id}");
										totalFailed++;
									}
									else
									{
										obj.RankScore = objectRank;
										FilterDefinition<Data.DataObject> objectFilter = Builders<Data.DataObject>.Filter.Eq(o => o.Id, obj.Id);
										updates.Add(new ReplaceOneModel<Data.DataObject>(objectFilter, obj));

										totalSuccesful++;
									}
								}
								catch (System.Exception ex)
								{
									this._logging.Error(ex, $"Error while recalculating rank for data object {obj.Id} : {ex.Message}");
									totalFailed++;
								}
							}

							if (updates.Count > 0)
							{
								try
								{
									await mongoDbContext.BulkWriteAsync(updates, new BulkWriteOptions() { IsOrdered = false });
									if (useTransaction) await mongoDbContext.CommitTransactionAsync();
								}
								catch (System.Exception ex)
								{
									this._logging.Error(ex, $"Error while writing objects to database after rank recalculation: {ex.Message}");
									totalSuccesful -= updates.Count;
									totalFailed += updates.Count;
									if (useTransaction) await mongoDbContext.AbortTransactionAsync();
								}
							}

							using (var transaction = await dbContext.Database.BeginTransactionAsync())
							{
								QueryFactory queryFactory = serviceScope.ServiceProvider.GetService<QueryFactory>();

								Data.RankRecalculationTask currentTask = await queryFactory.Query<RankRecalculationTaskQuery>().Ids(taskId).FirstAsync();
								if (currentTask == null) throw new System.Exception();

								currentTask.SuccessfulObjectRankings = totalSuccesful;
								currentTask.FailedObjectRankings = totalFailed;
								currentTask.UpdatedAt = DateTime.UtcNow;

								dbContext.Update(currentTask);

								var saved = false;
								while (!saved)
								{
									try
									{
										await dbContext.SaveChangesAsync();

										transaction.Commit();

										saved = true;
									}
									catch (DbUpdateConcurrencyException ex)
									{
										this._logging.Information(ex, $"Concurrency error when updating ranking db, attempting to resolve");

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

													if (property.Name == nameof(Data.RankRecalculationTask.SuccessfulObjectRankings)) proposedValues[property] = proposedValue;
													else if (property.Name == nameof(Data.RankRecalculationTask.FailedObjectRankings)) proposedValues[property] = proposedValue;
													else if (property.Name == nameof(Data.RankRecalculationTask.UpdatedAt)) proposedValues[property] = proposedValue;
													else proposedValues[property] = databaseValue;
												}
												entry.OriginalValues.SetValues(databaseValues);
											}
										}
									}
									catch (System.Exception ex)
									{
										this._logging.Error(ex, $"Error getting current task");
										transaction.Rollback();
										return;
									}
								}
							}

							page.Offset += page.Size;
							if (page.Offset + page.Size > itemsToCalculate) page.Size = itemsToCalculate - page.Offset;
							objects = await query.Ordering(order).Pagination(page).Collect();
						}
					}
				}
			}
			return;
		}
	}
}
