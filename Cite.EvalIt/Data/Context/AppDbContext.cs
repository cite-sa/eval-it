using Cite.EvalIt.Common;
using Cite.EvalIt.ErrorCode;
using Cite.Tools.Exception;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Cite.EvalIt.Data.Context
{
	//TODO: Update with data classes
	public class AppDbContext : DbContext
	{
		public AppDbContext(
			DbContextOptions<AppDbContext> options,
            DbProviderConfig config,
			ErrorThesaurus errors) : base(options)
		{
			this._config = config;
			this._errors = errors;
		}

		protected readonly DbProviderConfig _config;
		protected readonly ErrorThesaurus _errors;
		public DbSet<QueueInbox> QueueInboxes { get; set; }
        public DbSet<QueueOutbox> QueueOutboxes { get; set; }
		public DbSet<RankRecalculationTask> RankRecalculationTasks { get; set; }
		public DbSet<VersionInfo> VersionInfos { get; set; }

		public override int SaveChanges(bool acceptAllChangesOnSuccess)
		{
			return base.SaveChanges(acceptAllChangesOnSuccess);
		}

		public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default(CancellationToken))
		{
			return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
		}

		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			switch (this._config.Provider)
			{
				case DbProviderConfig.DbProvider.SQLServer:
					{
						//QueueInbox
						modelBuilder.Entity<QueueInbox>().ToTable(this.PrefixTable("queue_inbox"));
						modelBuilder.Entity<QueueInbox>().Property(x => x.Id).HasColumnName("id");
						modelBuilder.Entity<QueueInbox>().Property(x => x.Queue).HasColumnName("queue");
						modelBuilder.Entity<QueueInbox>().Property(x => x.Exchange).HasColumnName("exchange");
						modelBuilder.Entity<QueueInbox>().Property(x => x.Route).HasColumnName("route");
						modelBuilder.Entity<QueueInbox>().Property(x => x.ApplicationId).HasColumnName("application_id");
						modelBuilder.Entity<QueueInbox>().Property(x => x.MessageId).HasColumnName("message_id");
						modelBuilder.Entity<QueueInbox>().Property(x => x.Message).HasColumnName("message");
						modelBuilder.Entity<QueueInbox>().Property(x => x.IsActive).HasColumnName("is_active");
						modelBuilder.Entity<QueueInbox>().Property(x => x.Status).HasColumnName("status");
						modelBuilder.Entity<QueueInbox>().Property(x => x.RetryCount).HasColumnName("retry_count");
						modelBuilder.Entity<QueueInbox>().Property(x => x.CreatedAt).HasColumnName("created_at");
						modelBuilder.Entity<QueueInbox>().Property(x => x.UpdatedAt).HasColumnName("updated_at");
						//QueueOutbox
						modelBuilder.Entity<QueueOutbox>().ToTable(this.PrefixTable("queue_outbox"));
						modelBuilder.Entity<QueueOutbox>().Property(x => x.Id).HasColumnName("id");
						modelBuilder.Entity<QueueOutbox>().Property(x => x.Exchange).HasColumnName("exchange");
						modelBuilder.Entity<QueueOutbox>().Property(x => x.Route).HasColumnName("route");
						modelBuilder.Entity<QueueOutbox>().Property(x => x.MessageId).HasColumnName("message_id");
						modelBuilder.Entity<QueueOutbox>().Property(x => x.Message).HasColumnName("message");
						modelBuilder.Entity<QueueOutbox>().Property(x => x.IsActive).HasColumnName("is_active");
						modelBuilder.Entity<QueueOutbox>().Property(x => x.NotifyStatus).HasColumnName("status");
						modelBuilder.Entity<QueueOutbox>().Property(x => x.RetryCount).HasColumnName("retry_count");
						modelBuilder.Entity<QueueOutbox>().Property(x => x.PublishedAt).HasColumnName("published_at");
						modelBuilder.Entity<QueueOutbox>().Property(x => x.ConfirmedAt).HasColumnName("confirmed_at");
						modelBuilder.Entity<QueueOutbox>().Property(x => x.CreatedAt).HasColumnName("created_at");
						modelBuilder.Entity<QueueOutbox>().Property(x => x.UpdatedAt).HasColumnName("updated_at");
						//RankRecalculationTask
						modelBuilder.Entity<RankRecalculationTask>().ToTable(this.PrefixTable("rank_recalculation_task"));
						modelBuilder.Entity<RankRecalculationTask>().Property(x => x.Id).HasColumnName("id");
						modelBuilder.Entity<RankRecalculationTask>().Property(x => x.ReviewRankingsToCalculate).HasColumnName("review_rankings_to_calculate");
						modelBuilder.Entity<RankRecalculationTask>().Property(x => x.SuccessfulReviewRankings).HasColumnName("successful_review_rankings");
						modelBuilder.Entity<RankRecalculationTask>().Property(x => x.FailedReviewRankings).HasColumnName("failed_review_rankings");
						modelBuilder.Entity<RankRecalculationTask>().Property(x => x.ObjectRankingsToCalculate).HasColumnName("object_rankings_to_calculate");
						modelBuilder.Entity<RankRecalculationTask>().Property(x => x.SuccessfulObjectRankings).HasColumnName("successful_object_rankings");
						modelBuilder.Entity<RankRecalculationTask>().Property(x => x.FailedObjectRankings).HasColumnName("failed_object_rankings");
						modelBuilder.Entity<RankRecalculationTask>().Property(x => x.IsActive).HasColumnName("is_active");
						modelBuilder.Entity<RankRecalculationTask>().Property(x => x.RequestingUserId).HasColumnName("requesting_user_id");
						modelBuilder.Entity<RankRecalculationTask>().Property(x => x.TaskStatus).HasColumnName("status");
						modelBuilder.Entity<RankRecalculationTask>().Property(x => x.CreatedAt).HasColumnName("created_at");
						modelBuilder.Entity<RankRecalculationTask>().Property(x => x.UpdatedAt).HasColumnName("updated_at");
						modelBuilder.Entity<RankRecalculationTask>().Property(x => x.FinishedAt).HasColumnName("finished_at");
						//VersionInfo
						modelBuilder.Entity<VersionInfo>().ToTable(this.PrefixTable("version_info"));
                        modelBuilder.Entity<VersionInfo>().Property(x => x.Key).HasColumnName("key");
                        modelBuilder.Entity<VersionInfo>().Property(x => x.Version).HasColumnName("version");
                        modelBuilder.Entity<VersionInfo>().Property(x => x.ReleasedAt).HasColumnName("released_at");
                        modelBuilder.Entity<VersionInfo>().Property(x => x.DeployedAt).HasColumnName("deployed_at");
                        modelBuilder.Entity<VersionInfo>().Property(x => x.Description).HasColumnName("description");

						break;
					}
				case DbProviderConfig.DbProvider.PostgreSQL:
					{
						//QueueInbox
						modelBuilder.Entity<QueueInbox>().ToTable(this.PrefixTable("queue_inbox"));
						modelBuilder.Entity<QueueInbox>().Property(x => x.Id).HasColumnName("id");
						modelBuilder.Entity<QueueInbox>().Property(x => x.Queue).HasColumnName("queue");
						modelBuilder.Entity<QueueInbox>().Property(x => x.Exchange).HasColumnName("exchange");
						modelBuilder.Entity<QueueInbox>().Property(x => x.Route).HasColumnName("route");
						modelBuilder.Entity<QueueInbox>().Property(x => x.ApplicationId).HasColumnName("application_id");
						modelBuilder.Entity<QueueInbox>().Property(x => x.MessageId).HasColumnName("message_id");
						modelBuilder.Entity<QueueInbox>().Property(x => x.Message).HasColumnName("message");
						modelBuilder.Entity<QueueInbox>().Property(x => x.IsActive).HasColumnName("is_active");
						modelBuilder.Entity<QueueInbox>().Property(x => x.Status).HasColumnName("status");
						modelBuilder.Entity<QueueInbox>().Property(x => x.RetryCount).HasColumnName("retry_count");
						modelBuilder.Entity<QueueInbox>().Property(x => x.CreatedAt).HasColumnName("created_at");
						modelBuilder.Entity<QueueInbox>().Property(x => x.UpdatedAt).HasColumnName("updated_at");
						//QueueOutbox
						modelBuilder.Entity<QueueOutbox>().ToTable(this.PrefixTable("queue_outbox"));
						modelBuilder.Entity<QueueOutbox>().Property(x => x.Id).HasColumnName("id");
						modelBuilder.Entity<QueueOutbox>().Property(x => x.Exchange).HasColumnName("exchange");
						modelBuilder.Entity<QueueOutbox>().Property(x => x.Route).HasColumnName("route");
						modelBuilder.Entity<QueueOutbox>().Property(x => x.MessageId).HasColumnName("message_id");
						modelBuilder.Entity<QueueOutbox>().Property(x => x.Message).HasColumnName("message");
						modelBuilder.Entity<QueueOutbox>().Property(x => x.IsActive).HasColumnName("is_active");
						modelBuilder.Entity<QueueOutbox>().Property(x => x.NotifyStatus).HasColumnName("status");
						modelBuilder.Entity<QueueOutbox>().Property(x => x.RetryCount).HasColumnName("retry_count");
						modelBuilder.Entity<QueueOutbox>().Property(x => x.PublishedAt).HasColumnName("published_at");
						modelBuilder.Entity<QueueOutbox>().Property(x => x.ConfirmedAt).HasColumnName("confirmed_at");
						modelBuilder.Entity<QueueOutbox>().Property(x => x.CreatedAt).HasColumnName("created_at");
						modelBuilder.Entity<QueueOutbox>().Property(x => x.UpdatedAt).HasColumnName("updated_at");
						//RankRecalculationTask
						modelBuilder.Entity<RankRecalculationTask>().ToTable(this.PrefixTable("rank_recalculation_task"));
						modelBuilder.Entity<RankRecalculationTask>().Property(x => x.Id).HasColumnName("id");
						modelBuilder.Entity<RankRecalculationTask>().Property(x => x.ReviewRankingsToCalculate).HasColumnName("review_rankings_to_calculate");
						modelBuilder.Entity<RankRecalculationTask>().Property(x => x.SuccessfulReviewRankings).HasColumnName("successful_review_rankings");
						modelBuilder.Entity<RankRecalculationTask>().Property(x => x.FailedReviewRankings).HasColumnName("failed_review_rankings");
						modelBuilder.Entity<RankRecalculationTask>().Property(x => x.ObjectRankingsToCalculate).HasColumnName("object_rankings_to_calculate");
						modelBuilder.Entity<RankRecalculationTask>().Property(x => x.SuccessfulObjectRankings).HasColumnName("successful_object_rankings");
						modelBuilder.Entity<RankRecalculationTask>().Property(x => x.FailedObjectRankings).HasColumnName("failed_object_rankings");
						modelBuilder.Entity<RankRecalculationTask>().Property(x => x.IsActive).HasColumnName("is_active");
						modelBuilder.Entity<RankRecalculationTask>().Property(x => x.RequestingUserId).HasColumnName("requesting_user_id");
						modelBuilder.Entity<RankRecalculationTask>().Property(x => x.TaskStatus).HasColumnName("status");
						modelBuilder.Entity<RankRecalculationTask>().Property(x => x.CreatedAt).HasColumnName("created_at");
						modelBuilder.Entity<RankRecalculationTask>().Property(x => x.UpdatedAt).HasColumnName("updated_at");
						modelBuilder.Entity<RankRecalculationTask>().Property(x => x.FinishedAt).HasColumnName("finished_at");
						//VersionInfo
						modelBuilder.Entity<VersionInfo>().ToTable(this.PrefixTable("version_info"));
                        modelBuilder.Entity<VersionInfo>().Property(x => x.Key).HasColumnName("key");
                        modelBuilder.Entity<VersionInfo>().Property(x => x.Version).HasColumnName("version");
                        modelBuilder.Entity<VersionInfo>().Property(x => x.ReleasedAt).HasColumnName("released_at");
                        modelBuilder.Entity<VersionInfo>().Property(x => x.DeployedAt).HasColumnName("deployed_at");
                        modelBuilder.Entity<VersionInfo>().Property(x => x.Description).HasColumnName("description");

						break;
					}
				default: throw new MyApplicationException(this._errors.SystemError.Code, this._errors.SystemError.Message);
			}

			modelBuilder.Entity<QueueInbox>().Property(x => x.UpdatedAt).IsConcurrencyToken();
			modelBuilder.Entity<QueueOutbox>().Property(x => x.UpdatedAt).IsConcurrencyToken();
			modelBuilder.Entity<RankRecalculationTask>().Property(x => x.UpdatedAt).IsConcurrencyToken();

			DateTimeToTicksConverter dateTimeToTicksConverter = new DateTimeToTicksConverter();
			switch (this._config.Provider)
			{
				case DbProviderConfig.DbProvider.PostgreSQL:
					{
						modelBuilder.Entity<QueueInbox>().Property(x => x.UpdatedAt).HasConversion(dateTimeToTicksConverter);
						modelBuilder.Entity<QueueOutbox>().Property(x => x.UpdatedAt).HasConversion(dateTimeToTicksConverter);
						modelBuilder.Entity<RankRecalculationTask>().Property(x => x.UpdatedAt).HasConversion(dateTimeToTicksConverter);
						break;
					}
				case DbProviderConfig.DbProvider.SQLServer:
				default: break;
			}
		}

		private String PrefixTable(String name)
		{
			if (String.IsNullOrEmpty(this._config.TablePrefix)) return name;
			return $"{this._config.TablePrefix}{name}";
		}
	}
}
