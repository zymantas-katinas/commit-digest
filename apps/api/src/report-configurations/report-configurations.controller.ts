import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { SupabaseAuthGuard } from "../guards/supabase-auth.guard";
import { SupabaseService } from "../services/supabase.service";
import { GitHubService } from "../services/github.service";
import { LLMService } from "../services/llm.service";
import { NotificationService } from "../services/notification.service";
import { EncryptionService } from "../services/encryption.service";
import { ReportRunsService } from "../services/report-runs.service";
import { CreateReportConfigurationDto } from "../dto/create-report-configuration.dto";
import { UpdateReportConfigurationDto } from "../dto/update-report-configuration.dto";
import { ManualTriggerDto } from "../dto/manual-trigger.dto";

@Controller("report-configurations")
@UseGuards(SupabaseAuthGuard)
export class ReportConfigurationsController {
  constructor(
    private supabaseService: SupabaseService,
    private githubService: GitHubService,
    private llmService: LLMService,
    private notificationService: NotificationService,
    private encryptionService: EncryptionService,
    private reportRunsService: ReportRunsService,
  ) {}

  @Post()
  async createReportConfiguration(
    @Body() createReportConfigurationDto: CreateReportConfigurationDto,
    @Request() req,
  ) {
    try {
      const userId = req.user.id;

      // Verify that the repository belongs to the user
      const repository = await this.supabaseService.getRepositoryById(
        createReportConfigurationDto.repositoryId,
      );

      if (!repository || repository.user_id !== userId) {
        throw new HttpException("Repository not found", HttpStatus.NOT_FOUND);
      }

      // Check if user can create more report configurations for this repository
      const { data: canCreate, error: limitError } = await this.supabaseService[
        "supabase"
      ].rpc("can_user_create_report_config", {
        p_user_id: userId,
        p_repository_id: createReportConfigurationDto.repositoryId,
      });

      if (limitError) {
        console.error("Error checking report config limit:", limitError);
        throw new HttpException(
          "Unable to verify subscription limits",
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      if (!canCreate) {
        throw new HttpException(
          "Total report limit reached. Upgrade to add more report configurations.",
          HttpStatus.FORBIDDEN,
        );
      }

      const reportConfiguration =
        await this.supabaseService.createReportConfiguration(
          userId,
          createReportConfigurationDto.repositoryId,
          createReportConfigurationDto.branch,
          createReportConfigurationDto.schedule,
          createReportConfigurationDto.webhook_url,
          createReportConfigurationDto.name,
          createReportConfigurationDto.enabled,
        );

      return reportConfiguration;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to create report configuration",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getReportConfigurations(@Request() req) {
    try {
      const userId = req.user.id;
      const reportConfigurations =
        await this.supabaseService.getReportConfigurationsByUserId(userId);

      // Add total_runs count for each configuration
      const configurationsWithCounts = await Promise.all(
        reportConfigurations.map(async (config) => {
          const totalRuns =
            await this.reportRunsService.getConfigurationRunCount(config.id);
          return {
            ...config,
            total_runs: totalRuns,
          };
        }),
      );

      return configurationsWithCounts;
    } catch (error) {
      throw new HttpException(
        "Failed to fetch report configurations",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(":id")
  async getReportConfiguration(@Param("id") id: string, @Request() req) {
    try {
      const userId = req.user.id;
      const reportConfiguration =
        await this.supabaseService.getReportConfigurationById(id);

      if (!reportConfiguration || reportConfiguration.user_id !== userId) {
        throw new HttpException(
          "Report configuration not found",
          HttpStatus.NOT_FOUND,
        );
      }

      return reportConfiguration;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to fetch report configuration",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(":id")
  async updateReportConfiguration(
    @Param("id") id: string,
    @Body() updateReportConfigurationDto: UpdateReportConfigurationDto,
    @Request() req,
  ) {
    try {
      const userId = req.user.id;

      const reportConfiguration =
        await this.supabaseService.updateReportConfiguration(
          id,
          userId,
          updateReportConfigurationDto,
        );

      return reportConfiguration;
    } catch (error) {
      console.error("Update report configuration error:", error);
      throw new HttpException(
        "Failed to update report configuration",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(":id")
  async deleteReportConfiguration(@Param("id") id: string, @Request() req) {
    try {
      const userId = req.user.id;
      await this.supabaseService.deleteReportConfiguration(id, userId);
      return { message: "Report configuration deleted successfully" };
    } catch (error) {
      throw new HttpException(
        "Failed to delete report configuration",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(":id/test")
  async testWebhook(@Param("id") id: string, @Request() req) {
    try {
      const userId = req.user.id;

      // Get the report configuration
      const config = await this.supabaseService.getReportConfigurationById(id);
      if (!config || config.user_id !== userId) {
        return {
          success: false,
          message: "Report configuration not found",
          errorType: "NOT_FOUND",
        };
      }

      // Get repository details
      const repository = await this.supabaseService.getRepositoryById(
        config.repository_id,
      );
      if (!repository) {
        return {
          success: false,
          message: "Repository not found",
          errorType: "REPOSITORY_NOT_FOUND",
        };
      }

      let commits = [];
      let summaryResult = null;
      let webhookSuccess = false;
      let errorType = null;
      let errorMessage = null;

      try {
        // Decrypt PAT
        const pat = repository.encrypted_access_token
          ? this.encryptionService.decrypt(repository.encrypted_access_token)
          : null;

        // Calculate since date for testing (last 7 days for more commits)
        const sinceDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        // Fetch commits
        commits = await this.githubService.fetchCommits(
          repository.github_url,
          config.branch,
          pat,
          sinceDate,
        );

        if (commits.length === 0) {
          return {
            success: true,
            message: "Test completed - No commits found in the last 7 days",
            commitsFound: 0,
            webhookSent: false,
            tokensUsed: 0,
            costUsd: 0,
          };
        }

        // Generate summary
        summaryResult = await this.llmService.generateCommitSummary(
          commits,
          "week",
        );
      } catch (error) {
        if (error instanceof HttpException) {
          if (error.getStatus() === HttpStatus.UNAUTHORIZED) {
            errorType = "GITHUB_TOKEN_INVALID";
            errorMessage =
              "GitHub token is invalid or expired. Please update your repository access token.";
          } else if (error.getStatus() === HttpStatus.NOT_FOUND) {
            errorType = "GITHUB_REPOSITORY_NOT_FOUND";
            errorMessage =
              "Repository not found on GitHub. Check if the repository URL and branch are correct.";
          } else {
            errorType = "GITHUB_ERROR";
            errorMessage =
              "Failed to fetch commits from GitHub. Please check your repository settings.";
          }
        } else {
          errorType = "INTERNAL_ERROR";
          errorMessage = "Internal error while processing repository data.";
        }

        return {
          success: false,
          message: errorMessage,
          errorType,
          commitsFound: 0,
          webhookSent: false,
        };
      }

      // Try to send webhook
      try {
        webhookSuccess = await this.notificationService.sendWebhook(
          config.webhook_url,
          `# [TEST] ${summaryResult.summary}`,
          {
            repository: repository.github_url,
            branch: config.branch,
            commitsCount: commits.length,
            dateRange: {
              since: new Date(
                Date.now() - 7 * 24 * 60 * 60 * 1000,
              ).toISOString(),
              until: new Date().toISOString(),
            },
            isTest: true,
          },
        );

        if (!webhookSuccess) {
          errorType = "WEBHOOK_DELIVERY_FAILED";
          errorMessage =
            "Failed to deliver webhook. Check if the webhook URL is correct and accessible.";
        }
      } catch (error) {
        webhookSuccess = false;
        errorType = "WEBHOOK_ERROR";
        errorMessage =
          "Error occurred while sending webhook. Please verify the webhook URL.";
      }

      return {
        success: webhookSuccess,
        message: webhookSuccess
          ? "Test webhook sent successfully"
          : errorMessage,
        errorType: webhookSuccess ? null : errorType,
        commitsFound: commits.length,
        webhookSent: webhookSuccess,
        tokensUsed: summaryResult?.tokensUsed || 0,
        costUsd: summaryResult?.costUsd || 0,
        dateRange: {
          since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          until: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("Test webhook error:", error);
      return {
        success: false,
        message: "Internal server error occurred during test",
        errorType: "INTERNAL_ERROR",
        commitsFound: 0,
        webhookSent: false,
      };
    }
  }

  @Post(":id/manual-trigger")
  async manualTrigger(
    @Param("id") id: string,
    @Body() manualTriggerDto: ManualTriggerDto,
    @Request() req,
  ) {
    try {
      const userId = req.user.id;

      // Validate date range (max 31 days)
      const fromDate = new Date(manualTriggerDto.fromDate);
      const toDate = new Date(manualTriggerDto.toDate);
      const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (fromDate >= toDate) {
        return {
          success: false,
          message: "End date must be after start date",
          errorType: "INVALID_DATE_RANGE",
          commitsFound: 0,
          webhookSent: false,
        };
      }

      if (diffDays > 31) {
        return {
          success: false,
          message: "Date range cannot exceed 31 days",
          errorType: "INVALID_DATE_RANGE",
          commitsFound: 0,
          webhookSent: false,
        };
      }

      // Check usage limit
      const canRun = await this.reportRunsService.checkUsageLimit(userId);
      if (!canRun) {
        return {
          success: false,
          message: "Monthly usage limit exceeded",
          errorType: "USAGE_LIMIT_EXCEEDED",
          commitsFound: 0,
          webhookSent: false,
        };
      }

      // Get the report configuration
      const config = await this.supabaseService.getReportConfigurationById(id);
      if (!config || config.user_id !== userId) {
        return {
          success: false,
          message: "Report configuration not found",
          errorType: "NOT_FOUND",
          commitsFound: 0,
          webhookSent: false,
        };
      }

      // Get repository details
      const repository = await this.supabaseService.getRepositoryById(
        config.repository_id,
      );
      if (!repository) {
        return {
          success: false,
          message: "Repository not found",
          errorType: "REPOSITORY_NOT_FOUND",
          commitsFound: 0,
          webhookSent: false,
        };
      }

      // Create report run record
      const reportRun = await this.reportRunsService.createReportRun({
        user_id: userId,
        repository_id: config.repository_id,
        report_configuration_id: config.id,
        configuration_snapshot: config,
        model_used: "gpt-4o-mini",
      });

      let commits = [];
      let summaryResult = null;
      let webhookSuccess = false;
      let errorType = null;
      let errorMessage = null;

      try {
        // Decrypt PAT
        const pat = repository.encrypted_access_token
          ? this.encryptionService.decrypt(repository.encrypted_access_token)
          : null;

        // Fetch commits for the specified date range
        commits = await this.githubService.fetchCommits(
          repository.github_url,
          config.branch,
          pat,
          fromDate,
        );

        if (commits.length === 0) {
          await this.reportRunsService.markRunAsSuccess(reportRun.id, userId, {
            tokens_used: 0,
            cost_usd: 0,
            commits_processed: 0,
            commit_range_from: fromDate.toISOString(),
            commit_range_to: toDate.toISOString(),
            report_content: "No commits found in the specified date range",
          });

          return {
            success: true,
            message:
              "Manual report completed - No commits found in the specified date range",
            commitsFound: 0,
            webhookSent: false,
          };
        }

        // Filter commits to the specified date range (since fetchCommits only supports since parameter)
        commits = commits.filter((commit) => {
          const commitDate = new Date(commit.commit.author.date);
          return commitDate >= fromDate && commitDate <= toDate;
        });

        // Determine period type based on date range
        let periodType = "custom";
        if (diffDays <= 1) {
          periodType = "day";
        } else if (diffDays <= 7) {
          periodType = "week";
        } else if (diffDays <= 31) {
          periodType = "month";
        }

        // Generate summary
        summaryResult = await this.llmService.generateCommitSummary(
          commits,
          periodType,
        );
      } catch (error) {
        if (error instanceof HttpException) {
          if (error.getStatus() === HttpStatus.UNAUTHORIZED) {
            errorType = "GITHUB_TOKEN_INVALID";
            errorMessage =
              "GitHub token is invalid or expired. Please update your repository access token.";
          } else if (error.getStatus() === HttpStatus.NOT_FOUND) {
            errorType = "GITHUB_REPOSITORY_NOT_FOUND";
            errorMessage =
              "Repository not found on GitHub. Check if the repository URL and branch are correct.";
          } else {
            errorType = "GITHUB_ERROR";
            errorMessage =
              "Failed to fetch commits from GitHub. Please check your repository settings.";
          }
        } else {
          errorType = "INTERNAL_ERROR";
          errorMessage = "Internal error while processing repository data.";
        }

        await this.reportRunsService.markRunAsFailed(
          reportRun.id,
          userId,
          errorMessage,
          errorType,
        );

        return {
          success: false,
          message: errorMessage,
          errorType,
          commitsFound: 0,
          webhookSent: false,
        };
      }

      // Try to send webhook
      try {
        webhookSuccess = await this.notificationService.sendWebhook(
          config.webhook_url,
          `# [MANUAL] ${summaryResult.summary}`,
          {
            repository: repository.github_url,
            branch: config.branch,
            commitsCount: commits.length,
            dateRange: {
              since: fromDate.toISOString(),
              until: toDate.toISOString(),
            },
            isManual: true,
          },
        );

        if (!webhookSuccess) {
          errorType = "WEBHOOK_DELIVERY_FAILED";
          errorMessage =
            "Failed to deliver webhook. Check if the webhook URL is correct and accessible.";
        }
      } catch (error) {
        webhookSuccess = false;
        errorType = "WEBHOOK_ERROR";
        errorMessage =
          "Error occurred while sending webhook. Please verify the webhook URL.";
      }

      // Update webhook delivery status
      await this.reportRunsService.updateWebhookDelivery(
        reportRun.id,
        userId,
        webhookSuccess,
        webhookSuccess ? 200 : 500,
      );

      // Mark run as successful
      await this.reportRunsService.markRunAsSuccess(reportRun.id, userId, {
        tokens_used: summaryResult?.tokensUsed || 0,
        cost_usd: summaryResult?.costUsd || 0,
        commits_processed: commits.length,
        commit_range_from:
          commits[commits.length - 1]?.sha || fromDate.toISOString(),
        commit_range_to: commits[0]?.sha || toDate.toISOString(),
        report_content: summaryResult.summary,
      });

      return {
        success: webhookSuccess,
        message: webhookSuccess
          ? "Manual report generated and sent successfully"
          : errorMessage,
        errorType: webhookSuccess ? null : errorType,
        commitsFound: commits.length,
        webhookSent: webhookSuccess,
        dateRange: {
          since: fromDate.toISOString(),
          until: toDate.toISOString(),
        },
      };
    } catch (error) {
      console.error("Manual trigger error:", error);
      return {
        success: false,
        message: "Internal server error occurred during manual trigger",
        errorType: "INTERNAL_ERROR",
        commitsFound: 0,
        webhookSent: false,
      };
    }
  }
}
