import { Module } from "@nestjs/common";
import { SupabaseService } from "./supabase.service";
import { GitHubService } from "./github.service";
import { GitLabService } from "./gitlab.service";
import { GitService } from "./git.service";
import { LLMService } from "./llm.service";
import { NotificationService } from "./notification.service";
import { EncryptionService } from "./encryption.service";
import { SchedulerService } from "./scheduler.service";
import { ReportRunsService } from "./report-runs.service";

@Module({
  providers: [
    SupabaseService,
    GitHubService,
    GitLabService,
    GitService,
    LLMService,
    NotificationService,
    EncryptionService,
    SchedulerService,
    ReportRunsService,
  ],
  exports: [
    SupabaseService,
    GitHubService,
    GitLabService,
    GitService,
    LLMService,
    NotificationService,
    EncryptionService,
    SchedulerService,
    ReportRunsService,
  ],
})
export class ServicesModule {}
