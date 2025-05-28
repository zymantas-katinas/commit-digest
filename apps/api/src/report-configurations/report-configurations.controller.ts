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
import { CreateReportConfigurationDto } from "../dto/create-report-configuration.dto";
import { UpdateReportConfigurationDto } from "../dto/update-report-configuration.dto";

@Controller("report-configurations")
@UseGuards(SupabaseAuthGuard)
export class ReportConfigurationsController {
  constructor(
    private supabaseService: SupabaseService,
    private githubService: GitHubService,
    private llmService: LLMService,
    private notificationService: NotificationService,
    private encryptionService: EncryptionService,
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

      const reportConfiguration =
        await this.supabaseService.createReportConfiguration(
          userId,
          createReportConfigurationDto.repositoryId,
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
      return reportConfigurations;
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
        throw new HttpException(
          "Report configuration not found",
          HttpStatus.NOT_FOUND,
        );
      }

      // Get repository details
      const repository = await this.supabaseService.getRepositoryById(
        config.repository_id,
      );
      if (!repository) {
        throw new HttpException("Repository not found", HttpStatus.NOT_FOUND);
      }

      // Decrypt PAT
      const pat = this.encryptionService.decrypt(
        repository.encrypted_access_token,
      );

      // Calculate since date for testing (last 7 days for more commits)
      const sinceDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // Fetch commits
      const commits = await this.githubService.fetchCommits(
        repository.github_url,
        repository.branch,
        pat,
        sinceDate,
      );

      if (commits.length === 0) {
        return {
          success: true,
          message: "Test completed - No commits found in the last 7 days",
          commitsFound: 0,
          webhookSent: false,
        };
      }

      // Generate summary
      const summary = await this.llmService.generateCommitSummary(
        commits,
        "week",
      );

      // Send test webhook with metadata
      const webhookSuccess = await this.notificationService.sendWebhook(
        config.webhook_url,
        `[TEST] ${summary}`,
        {
          repository: repository.github_url,
          branch: repository.branch,
          commitsCount: commits.length,
          dateRange: {
            since: sinceDate.toISOString(),
            until: new Date().toISOString(),
          },
          isTest: true,
        },
      );

      return {
        success: webhookSuccess,
        message: webhookSuccess
          ? "Test webhook sent successfully"
          : "Test webhook failed to send",
        commitsFound: commits.length,
        webhookSent: webhookSuccess,
        dateRange: {
          since: sinceDate.toISOString(),
          until: new Date().toISOString(),
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to test webhook",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
