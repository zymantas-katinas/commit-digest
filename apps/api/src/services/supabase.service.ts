import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { isScheduleDue } from "../utils/cron-utils";

export interface Repository {
  id: string;
  user_id: string;
  github_url: string;
  encrypted_access_token: string;
  created_at: string;
  updated_at: string;
}

export interface ReportConfiguration {
  id: string;
  user_id: string;
  repository_id: string;
  branch: string;
  name?: string;
  schedule: string;
  webhook_url: string;
  enabled: boolean;
  last_run_status?: string;
  last_run_at?: string;
  last_run_content?: string;
  created_at: string;
  updated_at: string;
  // New report configuration settings
  report_style?: string;
  tone_of_voice?: string;
  author_display?: boolean;
  link_to_commits?: boolean;
  if_no_updates?: boolean;
}

export interface UsageStats {
  current_month_reports: number;
  current_month_tokens: number;
  current_month_cost_usd: number;
  plan_limit_reports: number;
  plan_limit_repositories: number;
}

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>("SUPABASE_URL")!,
      this.configService.get<string>("SUPABASE_SERVICE_ROLE_KEY")!,
    );
  }

  // Repository operations
  async createRepository(
    userId: string,
    githubUrl: string,
    encryptedPat: string | null,
  ): Promise<Repository> {
    const { data, error } = await this.supabase
      .from("repositories")
      .insert({
        user_id: userId,
        github_url: githubUrl,
        encrypted_access_token: encryptedPat,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getRepositoriesByUserId(userId: string): Promise<Repository[]> {
    const { data, error } = await this.supabase
      .from("repositories")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getRepositoryById(id: string): Promise<Repository | null> {
    const { data, error } = await this.supabase
      .from("repositories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return null;
    return data;
  }

  async updateRepository(
    id: string,
    userId: string,
    updates: {
      github_url?: string;
      encrypted_access_token?: string;
    },
  ): Promise<Repository> {
    const { data, error } = await this.supabase
      .from("repositories")
      .update(updates)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteRepository(id: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from("repositories")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;
  }

  // Report Configuration operations
  async createReportConfiguration(
    userId: string,
    repositoryId: string,
    branch: string,
    schedule: string,
    webhookUrl: string,
    name?: string,
    enabled: boolean = true,
    reportStyle?: string,
    toneOfVoice?: string,
    authorDisplay?: boolean,
    linkToCommits?: boolean,
    ifNoUpdates?: boolean,
  ): Promise<ReportConfiguration> {
    const { data, error } = await this.supabase
      .from("report_configurations")
      .insert({
        user_id: userId,
        repository_id: repositoryId,
        branch: branch,
        name: name,
        schedule: schedule,
        webhook_url: webhookUrl,
        enabled: enabled,
        report_style: reportStyle || "Standard",
        tone_of_voice: toneOfVoice || "Informative",
        author_display: authorDisplay || false,
        link_to_commits: linkToCommits || false,
        if_no_updates: ifNoUpdates || true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getReportConfigurationsByUserId(
    userId: string,
  ): Promise<ReportConfiguration[]> {
    const { data, error } = await this.supabase
      .from("report_configurations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getReportConfigurationById(
    id: string,
  ): Promise<ReportConfiguration | null> {
    const { data, error } = await this.supabase
      .from("report_configurations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return null;
    return data;
  }

  async updateReportConfiguration(
    id: string,
    userId: string,
    updates: Partial<ReportConfiguration>,
  ): Promise<ReportConfiguration> {
    const { data, error } = await this.supabase
      .from("report_configurations")
      .update(updates)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      throw error;
    }
    return data;
  }

  async deleteReportConfiguration(id: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from("report_configurations")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;
  }

  async getDueReportConfigurations(): Promise<ReportConfiguration[]> {
    try {
      // First, get all enabled configurations without any joins
      const { data: configurations, error } = await this.supabase
        .from("report_configurations")
        .select("*")
        .eq("enabled", true);

      if (error) {
        throw error;
      }

      if (!configurations || configurations.length === 0) {
        return [];
      }

      // Now check each configuration individually with proper timezone handling
      const dueConfigurations: ReportConfiguration[] = [];

      for (const config of configurations) {
        try {
          // Get the user's timezone for this configuration
          const userTimezone = await this.getUserTimezone(config.user_id);

          // Check if this configuration is due based on the user's timezone
          const isDue = isScheduleDue(
            config.schedule,
            config.last_run_at,
            userTimezone,
          );

          if (isDue) {
            dueConfigurations.push(config);
            console.log(
              `✅ Config ${config.id} (${config.name || "unnamed"}) is due for execution`,
            );
          }
        } catch (error) {
          console.error(
            `Error checking schedule for config ${config.id}:`,
            error,
          );

          // Fallback: use UTC timezone and basic logic
          const isDue = isScheduleDue(
            config.schedule,
            config.last_run_at,
            "UTC",
          );
          if (isDue) {
            dueConfigurations.push(config);
          }
        }
      }

      if (dueConfigurations.length > 0) {
        console.log(
          `🎯 Total due configurations found: ${dueConfigurations.length}`,
        );
      }
      return dueConfigurations;
    } catch (error) {
      console.error("Error in getDueReportConfigurations:", error);

      // Final fallback: get configurations and use basic logic with UTC
      try {
        const { data: fallbackData, error: fallbackError } = await this.supabase
          .from("report_configurations")
          .select("*")
          .eq("enabled", true);

        if (fallbackError) {
          throw fallbackError;
        }

        return this.filterDueConfigurations(fallbackData || [], "UTC");
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        return [];
      }
    }
  }

  private filterDueConfigurations(
    configurations: any[],
    defaultTimezone?: string,
  ): ReportConfiguration[] {
    const now = new Date();
    const dueConfigurations = configurations.filter((config: any) => {
      try {
        // If never run before, it's due
        if (!config.last_run_at) {
          return true;
        }

        const lastRun = new Date(config.last_run_at);

        // Get user timezone from the joined profile data or use default
        const userTimezone =
          config.user_profiles?.timezone || defaultTimezone || "UTC";

        // Use the new cron utility function with timezone support
        return isScheduleDue(config.schedule, config.last_run_at, userTimezone);
      } catch (error) {
        // If cron parsing fails, log the error and use fallback logic
        console.error(
          `Invalid cron expression for config ${config.id}: ${config.schedule}`,
          error,
        );

        // Fallback: treat as daily and run if it's been more than 23 hours
        if (config.last_run_at) {
          const lastRun = new Date(config.last_run_at);
          const timeSinceLastRun = now.getTime() - lastRun.getTime();
          return timeSinceLastRun > 23 * 60 * 60 * 1000;
        }
        return true; // Never run before
      }
    });

    // Clean up the response to match the original interface
    return dueConfigurations.map((config: any) => {
      const { user_profiles, ...reportConfig } = config;
      return reportConfig;
    });
  }

  async getUserTimezone(userId: string): Promise<string> {
    const { data, error } = await this.supabase
      .from("user_profiles")
      .select("timezone")
      .eq("id", userId)
      .single();

    if (error || !data) {
      return "UTC"; // Default timezone
    }

    return data.timezone || "UTC";
  }

  async updateUserTimezone(userId: string, timezone: string): Promise<void> {
    console.log(
      `Attempting to update timezone for user ${userId} to ${timezone}`,
    );

    const { data, error } = await this.supabase
      .from("user_profiles")
      .upsert(
        {
          id: userId,
          timezone: timezone,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        },
      )
      .select();

    if (error) {
      console.error("Supabase upsert error:", {
        error,
        userId,
        timezone,
        errorCode: error.code,
        errorMessage: error.message,
        errorDetails: error.details,
        errorHint: error.hint,
      });
      throw error;
    }

    console.log("Timezone update successful:", { userId, timezone, data });
  }
}
