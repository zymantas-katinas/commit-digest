import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { SupabaseService } from "./supabase.service";
import { GitHubService } from "./github.service";
import { LLMService } from "./llm.service";
import { NotificationService } from "./notification.service";
import { EncryptionService } from "./encryption.service";
import { ReportRunsService } from "./report-runs.service";
import { isScheduleDue, parseNextRunTime } from "../utils/cron-utils";

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  private lastRunTime: Date | null = null;
  private totalConfigsProcessed = 0;
  private successfulRuns = 0;
  private failedRuns = 0;
  private lastMemoryReset = Date.now();

  constructor(
    private supabaseService: SupabaseService,
    private githubService: GitHubService,
    private llmService: LLMService,
    private notificationService: NotificationService,
    private encryptionService: EncryptionService,
    private reportRunsService: ReportRunsService,
  ) {
    this.logger.log(
      "🚀 SchedulerService instantiated - cron jobs should be registered",
    );
    this.logger.log(
      "📅 Hourly report generation cron: @Cron(CronExpression.EVERY_HOUR)",
    );
    this.logger.log(
      "💓 Debug heartbeat cron: @Cron('0 * * * * *') - every minute",
    );
    this.logger.log("🔔 Test cron: @Cron('*/30 * * * * *') - every 30 seconds");
  }

  @Cron("0 * * * * *") // Changed to every 10 minutes for better memory management
  async handleReportGeneration() {
    const startTime = new Date();
    this.lastRunTime = startTime;

    // Reset counters every hour to prevent memory accumulation
    if (Date.now() - this.lastMemoryReset > 60 * 60 * 1000) {
      this.resetCounters();
      if (global.gc) {
        this.logger.log("🧹 Running garbage collection");
        global.gc();
      }
    }

    try {
      const dueConfigurations =
        await this.supabaseService.getDueReportConfigurations();

      // Only log details when there are configurations to process
      if (dueConfigurations.length > 0) {
        this.logger.log(
          `🚀 Starting scheduled report generation at ${startTime.toISOString()}`,
        );
        this.logger.log(`⏰ Current time: ${startTime.toLocaleString()}`);
        this.logger.log(
          `📋 Found ${dueConfigurations.length} due report configurations`,
        );

        // Log schedule details for debugging
        for (const config of dueConfigurations) {
          // Get user timezone for accurate logging
          const userTimezone = await this.supabaseService.getUserTimezone(
            config.user_id,
          );
          const nextRunTime = parseNextRunTime(
            config.schedule,
            config.last_run_at ? new Date(config.last_run_at) : new Date(),
            userTimezone,
          );
          this.logger.log(
            `📅 DUE Config ${config.id}: schedule="${config.schedule}", timezone="${userTimezone}", last_run=${config.last_run_at || "never"}, next_scheduled=${nextRunTime?.toISOString() || "unknown"}, name="${config.name || "unnamed"}"`,
          );
        }
      } else {
        // Minimal logging when nothing to do
        this.logger.debug(
          `🔍 Scheduler check at ${startTime.toISOString()} - no configurations due`,
        );
      }

      if (dueConfigurations.length === 0) {
        return;
      }

      let processedCount = 0;
      let successCount = 0;
      let failedCount = 0;

      for (const config of dueConfigurations) {
        try {
          await this.processReportConfiguration(config);
          successCount++;
        } catch (error) {
          failedCount++;
          this.logger.error(
            `❌ Failed to process config ${config.id}:`,
            error.message,
          );
        }
        processedCount++;
      }

      this.totalConfigsProcessed += processedCount;
      this.successfulRuns += successCount;
      this.failedRuns += failedCount;

      this.logger.log(
        `✅ Batch complete: ${successCount} successful, ${failedCount} failed out of ${processedCount} configurations`,
      );
    } catch (error) {
      this.logger.error(
        "💥 Critical error in scheduled report generation:",
        error,
      );
    }
  }

  /**
   * Get scheduler statistics for health monitoring
   */
  getSchedulerStats() {
    return {
      lastRunTime: this.lastRunTime,
      totalConfigsProcessed: this.totalConfigsProcessed,
      successfulRuns: this.successfulRuns,
      failedRuns: this.failedRuns,
      isRunning: this.lastRunTime
        ? Date.now() - this.lastRunTime.getTime() < 5 * 60 * 1000
        : false, // Consider running if last run was within 5 minutes
    };
  }

  /**
   * Manual trigger for testing scheduler logic
   */
  async triggerManualRun(): Promise<{
    success: boolean;
    message: string;
    stats: { processed: number; successful: number; failed: number };
  }> {
    this.logger.log("🔧 Manual scheduler trigger initiated");

    try {
      await this.handleReportGeneration();
      return {
        success: true,
        message: "Manual trigger completed successfully",
        stats: {
          processed: this.totalConfigsProcessed,
          successful: this.successfulRuns,
          failed: this.failedRuns,
        },
      };
    } catch (error) {
      this.logger.error("❌ Manual trigger failed:", error);
      return {
        success: false,
        message: `Manual trigger failed: ${error.message}`,
        stats: {
          processed: this.totalConfigsProcessed,
          successful: this.successfulRuns,
          failed: this.failedRuns,
        },
      };
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
      const pat = repository.encrypted_access_token
        ? this.encryptionService.decrypt(repository.encrypted_access_token)
        : null;

      // Calculate since date
      const sinceDate = this.calculateSinceDate(
        config.schedule,
        config.last_run_at,
      );

      console.log({
        sinceDate,
        schedule: config.schedule,
        lastRunAt: config.last_run_at,
      });

      // Fetch commits
      const commits = await this.githubService.fetchCommits(
        repository.github_url,
        config.branch,
        pat,
        sinceDate,
      );

      if (commits.length === 0) {
        this.logger.log(`No new commits found for config ${configId}`);

        // Create a "no commits" message to send via webhook
        const timeframe = this.isDailySchedule(config.schedule)
          ? "day"
          : "week";
        const noCommitsMessage =
          `📊 **Git Report - No Activity**\n\n` +
          `**Repository:** ${repository.github_url}\n` +
          `**Branch:** ${config.branch}\n` +
          `**Period:** ${this.formatDateRange(sinceDate, new Date())}\n\n` +
          `✅ No new commits found in the last ${timeframe}.\n\n` +
          `This means your repository has been quiet - no changes were made during this period. ` +
          `You'll receive your next report according to your schedule: \`${config.schedule}\``;

        // Send webhook even when no commits
        const webhookSuccess = await this.notificationService.sendWebhook(
          config.webhook_url,
          noCommitsMessage,
          {
            repository: repository.github_url,
            branch: config.branch,
            commitsCount: 0,
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

        await this.reportRunsService.markRunAsSuccess(
          reportRun.id,
          config.user_id,
          {
            tokens_used: 0,
            cost_usd: 0,
            commits_processed: 0,
            commit_range_from: sinceDate.toISOString(),
            commit_range_to: new Date().toISOString(),
            report_content: noCommitsMessage,
          },
        );

        // Update configuration with appropriate status
        const status = webhookSuccess ? "success" : "failed";
        await this.updateConfigurationStatus(config, status, noCommitsMessage);

        this.logger.log(
          `Report configuration ${configId} processed successfully (no commits). Webhook sent: ${webhookSuccess}`,
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

      // Create formatted report with metadata header
      const formattedReport =
        `📊 **Git Report - ${commits.length} ${commits.length === 1 ? "Commit" : "Commits"}**\n\n` +
        `**Repository:** ${repository.github_url}\n` +
        `**Branch:** ${config.branch}\n` +
        `**Period:** ${this.formatDateRange(sinceDate, new Date())}\n` +
        `**Commits:** ${commits.length}\n\n` +
        `---\n\n` +
        summary;

      // Send webhook with metadata
      const webhookSuccess = await this.notificationService.sendWebhook(
        config.webhook_url,
        formattedReport,
        {
          repository: repository.github_url,
          branch: config.branch,
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
          report_content: formattedReport,
        },
      );

      // Update configuration
      const status = webhookSuccess ? "success" : "failed";
      await this.updateConfigurationStatus(config, status, formattedReport);

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
   * - If this is the first run (no lastRunAt), use a default lookback period
   * - If there was a previous run, fetch commits since that timestamp
   * - For daily schedules: default to 1 day ago
   * - For weekly schedules: default to 7 days ago
   * - For custom cron schedules: default to 1 day ago
   */
  private calculateSinceDate(schedule: string, lastRunAt?: string): Date {
    if (lastRunAt) {
      return new Date(lastRunAt);
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

  /**
   * Format date range for reports
   */
  private formatDateRange(sinceDate: Date, endDate: Date): string {
    const formatOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    };

    return `${sinceDate.toLocaleDateString("en-US", formatOptions)} - ${endDate.toLocaleDateString("en-US", formatOptions)}`;
  }

  private async updateConfigurationStatus(
    config: any,
    status: string,
    reportContent?: string,
  ) {
    const updates: any = {
      last_run_status: status,
      last_run_at: new Date().toISOString(),
    };

    if (reportContent) {
      updates.last_run_content = reportContent;
    }

    await this.supabaseService.updateReportConfiguration(
      config.id,
      config.user_id,
      updates,
    );
  }

  /**
   * Debug method to check if a configuration should be due
   */
  private async debugScheduleCheck(config: any): Promise<boolean> {
    const now = new Date();
    const userTimezone = await this.supabaseService.getUserTimezone(
      config.user_id,
    );

    this.logger.debug(`🔍 Debugging schedule for config ${config.id}:`);
    this.logger.debug(`   Schedule: ${config.schedule}`);
    this.logger.debug(`   Timezone: ${userTimezone}`);
    this.logger.debug(`   Last run: ${config.last_run_at || "never"}`);
    this.logger.debug(`   Enabled: ${config.enabled}`);
    this.logger.debug(`   Current time: ${now.toISOString()}`);

    if (!config.enabled) {
      this.logger.debug(`   ❌ Configuration is disabled`);
      return false;
    }

    const isDue = isScheduleDue(
      config.schedule,
      config.last_run_at,
      userTimezone,
    );
    const nextRunTime = parseNextRunTime(
      config.schedule,
      config.last_run_at ? new Date(config.last_run_at) : new Date(),
      userTimezone,
    );

    this.logger.debug(
      `   Next run time: ${nextRunTime?.toISOString() || "unknown"}`,
    );
    this.logger.debug(`   Is due: ${isDue}`);

    if (nextRunTime) {
      this.logger.debug(
        `   Time until next run: ${nextRunTime.getTime() - now.getTime()}ms`,
      );
    }

    return isDue;
  }

  /**
   * Debug cron to verify scheduling is working - runs every minute
   * DISABLED: This was causing memory issues by running too frequently
   */
  // @Cron("0 * * * * *") // Every minute at 0 seconds
  // async debugCronHeartbeat() {
  //   const now = new Date();
  //   this.logger.log(
  //     `💓 Cron heartbeat: ${now.toISOString()} (${now.toLocaleString()})`,
  //   );
  //   this.lastRunTime = now; // Update for health check
  // }

  private resetCounters() {
    this.logger.log(
      `🔄 Resetting counters - Previous: processed=${this.totalConfigsProcessed}, successful=${this.successfulRuns}, failed=${this.failedRuns}`,
    );
    this.totalConfigsProcessed = 0;
    this.successfulRuns = 0;
    this.failedRuns = 0;
    this.lastMemoryReset = Date.now();
  }
}
