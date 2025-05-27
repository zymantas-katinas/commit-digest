import { Module } from "@nestjs/common";
import { SupabaseService } from "./supabase.service";
import { GitHubService } from "./github.service";
import { LLMService } from "./llm.service";
import { NotificationService } from "./notification.service";
import { EncryptionService } from "./encryption.service";
import { SchedulerService } from "./scheduler.service";

@Module({
  providers: [
    SupabaseService,
    GitHubService,
    LLMService,
    NotificationService,
    EncryptionService,
    SchedulerService,
  ],
  exports: [
    SupabaseService,
    GitHubService,
    LLMService,
    NotificationService,
    EncryptionService,
    SchedulerService,
  ],
})
export class ServicesModule {}
