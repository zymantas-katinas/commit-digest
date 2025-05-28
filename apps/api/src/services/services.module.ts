import { Module } from "@nestjs/common";
import { SupabaseService } from "./supabase.service";
import { GitHubService } from "./github.service";
import { LLMService } from "./llm.service";
import { NotificationService } from "./notification.service";
import { EncryptionService } from "./encryption.service";
import { SchedulerService } from "./scheduler.service";
import { ReportRunsService } from "./report-runs.service";

@Module({
  providers: [
    SupabaseService,
    GitHubService,
    LLMService,
    NotificationService,
    EncryptionService,
    SchedulerService,
    ReportRunsService,
  ],
  exports: [
    SupabaseService,
    GitHubService,
    LLMService,
    NotificationService,
    EncryptionService,
    SchedulerService,
    ReportRunsService,
  ],
})
export class ServicesModule {}
