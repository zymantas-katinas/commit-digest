import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { SupabaseService } from "./supabase.service";
import { GitHubService } from "./github.service";
import { LLMService } from "./llm.service";
import { NotificationService } from "./notification.service";
import { EncryptionService } from "./encryption.service";

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private supabaseService: SupabaseService,
    private githubService: GitHubService,
    private llmService: LLMService,
    private notificationService: NotificationService,
    private encryptionService: EncryptionService,
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

    try {
      // Get repository details
      const repository = await this.supabaseService.getRepositoryById(
        config.repository_id,
      );
      if (!repository) {
        this.logger.error(`Repository not found for config ${configId}`);
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
        await this.updateConfigurationStatus(
          config,
          "success",
          "No new commits found",
        );
        return;
      }

      // Generate summary
      const timeframe = this.isDailySchedule(config.schedule) ? "day" : "week";
      const summary = await this.llmService.generateCommitSummary(
        commits,
        timeframe,
      );

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

      // Update configuration
      const status = webhookSuccess ? "success" : "failed";
      await this.updateConfigurationStatus(config, status, summary);

      this.logger.log(
        `Report configuration ${configId} processed successfully`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing report configuration ${configId}:`,
        error,
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
