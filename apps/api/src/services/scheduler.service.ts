import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { SupabaseService } from "./supabase.service";
import { GitHubService } from "./github.service";
import { LLMService } from "./llm.service";
import { NotificationService } from "./notification.service";
import { EncryptionService } from "./encryption.service";
import { ReportRunsService } from "./report-runs.service";

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private supabaseService: SupabaseService,
    private githubService: GitHubService,
    private llmService: LLMService,
    private notificationService: NotificationService,
    private encryptionService: EncryptionService,
    private reportRunsService: ReportRunsService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleReportGeneration() {
    this.logger.log("Starting scheduled report generation...");

    try {
      const dueConfigurations =
        await this.supabaseService.getDueReportConfigurations();
      this.logger.log(
        `Found ${dueConfigurations.length} due report configurations`,
      );

      for (const config of dueConfigurations) {
        await this.processReportConfiguration(config);
      }
    } catch (error) {
      this.logger.error("Error in scheduled report generation:", error);
    }
  }

  private async processReportConfiguration(config: any) {
    const configId = config.id;
    this.logger.log(`Processing report configuration ${configId}`);

    // Check usage limits first
    const canRun = await this.reportRunsService.checkUsageLimit(config.user_id);
    if (!canRun) {
      this.logger.warn(
        `User ${config.user_id} has exceeded monthly usage limit`,
      );
      await this.updateConfigurationStatus(
        config,
        "failed",
        "Monthly usage limit exceeded",
      );
      return;
    }

    // Create report run record
    let reportRun;
    try {
      reportRun = await this.reportRunsService.createReportRun({
        user_id: config.user_id,
        repository_id: config.repository_id,
        report_configuration_id: config.id,
        configuration_snapshot: {
          schedule: config.schedule,
          webhook_url: config.webhook_url,
          name: config.name,
        },
        model_used: "gpt-4o-mini", // Default model
      });
      this.logger.log(
        `Created report run ${reportRun.id} for config ${configId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to create report run for config ${configId}:`,
        error,
      );
      return;
    }

    try {
      // Get repository details
      const repository = await this.supabaseService.getRepositoryById(
        config.repository_id,
      );
      if (!repository) {
        this.logger.error(`Repository not found for config ${configId}`);
        await this.reportRunsService.markRunAsFailed(
          reportRun.id,
          config.user_id,
          "Repository not found",
          "REPOSITORY_NOT_FOUND",
        );
        return;
      }

      // Decrypt PAT
      const pat = this.encryptionService.decrypt(
        repository.encrypted_access_token,
      );

      // Calculate since date
      const sinceDate = this.calculateSinceDate(
        config.schedule,
        config.last_run_timestamp,
      );

      // Fetch commits
      const commits = await this.githubService.fetchCommits(
        repository.github_url,
        repository.branch,
        pat,
        sinceDate,
      );

      if (commits.length === 0) {
        this.logger.log(`No new commits found for config ${configId}`);
        await this.reportRunsService.markRunAsSuccess(
          reportRun.id,
          config.user_id,
          {
            tokens_used: 0,
            cost_usd: 0,
            commits_processed: 0,
            commit_range_from: sinceDate.toISOString(),
            commit_range_to: new Date().toISOString(),
            report_content: "No new commits found",
          },
        );
        await this.updateConfigurationStatus(
          config,
          "success",
          "No new commits found",
        );
        return;
      }

      // Generate summary
      const timeframe = this.isDailySchedule(config.schedule) ? "day" : "week";
      const summaryResult = await this.llmService.generateCommitSummary(
        commits,
        timeframe,
      );

      // Extract tokens and cost information
      const tokensUsed = summaryResult.tokensUsed;
      const costUsd = summaryResult.costUsd;
      const summary = summaryResult.summary;

      // Send webhook with metadata
      const webhookSuccess = await this.notificationService.sendWebhook(
        config.webhook_url,
        summary,
        {
          repository: repository.github_url,
          branch: repository.branch,
          commitsCount: commits.length,
          dateRange: {
            since: sinceDate.toISOString(),
            until: new Date().toISOString(),
          },
          isTest: false,
        },
      );

      // Update webhook delivery status
      await this.reportRunsService.updateWebhookDelivery(
        reportRun.id,
        config.user_id,
        webhookSuccess,
        webhookSuccess ? 200 : 500,
      );

      // Mark run as successful
      await this.reportRunsService.markRunAsSuccess(
        reportRun.id,
        config.user_id,
        {
          tokens_used: tokensUsed,
          cost_usd: costUsd,
          commits_processed: commits.length,
          commit_range_from:
            commits[commits.length - 1]?.sha || sinceDate.toISOString(),
          commit_range_to: commits[0]?.sha || new Date().toISOString(),
          report_content: summary,
        },
      );

      // Update configuration
      const status = webhookSuccess ? "success" : "failed";
      await this.updateConfigurationStatus(config, status, summary);

      this.logger.log(
        `Report configuration ${configId} processed successfully. Tokens used: ${tokensUsed}, Cost: $${costUsd}`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing report configuration ${configId}:`,
        error,
      );

      // Mark run as failed
      await this.reportRunsService.markRunAsFailed(
        reportRun.id,
        config.user_id,
        error.message || "Unknown error",
        error.code || "UNKNOWN_ERROR",
      );

      await this.updateConfigurationStatus(config, "failed", null);
    }
  }

  /**
   * Calculate the date from which to fetch commits.
   *
   * Logic:
   * - If this is the first run (no lastRunTimestamp), use a default lookback period
   * - If there was a previous run, fetch commits since that timestamp
   * - For daily schedules: default to 1 day ago
   * - For weekly schedules: default to 7 days ago
   * - For custom cron schedules: default to 1 day ago
   */
  private calculateSinceDate(
    schedule: string,
    lastRunTimestamp?: string,
  ): Date {
    if (lastRunTimestamp) {
      return new Date(lastRunTimestamp);
    }

    const now = new Date();

    // Parse common cron patterns to determine frequency
    if (this.isDailySchedule(schedule)) {
      return new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
    } else if (this.isWeeklySchedule(schedule)) {
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    } else {
      // Default to 1 day for custom schedules
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Check if a cron schedule represents a daily frequency
   */
  private isDailySchedule(schedule: string): boolean {
    // Daily patterns: "0 9 * * *", "30 8 * * *", etc.
    // Third field (day of month) and fifth field (day of week) should be *
    const parts = schedule.split(" ");
    return parts.length === 5 && parts[2] === "*" && parts[4] === "*";
  }

  /**
   * Check if a cron schedule represents a weekly frequency
   */
  private isWeeklySchedule(schedule: string): boolean {
    // Weekly patterns: "0 9 * * 1", "0 9 * * MON", etc.
    // Fifth field (day of week) should not be *
    const parts = schedule.split(" ");
    return parts.length === 5 && parts[4] !== "*";
  }

  private async updateConfigurationStatus(
    config: any,
    status: string,
    reportContent?: string,
  ) {
    const updates: any = {
      last_run_status: status,
      last_run_timestamp: new Date().toISOString(),
    };

    if (reportContent) {
      updates.last_report_content = reportContent;
    }

    await this.supabaseService.updateReportConfiguration(
      config.id,
      config.user_id,
      updates,
    );
  }
}
