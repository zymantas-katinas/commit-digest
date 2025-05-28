import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface Repository {
  id: string;
  user_id: string;
  github_url: string;
  branch: string;
  encrypted_access_token: string;
  created_at: string;
  updated_at: string;
}

export interface ReportConfiguration {
  id: string;
  user_id: string;
  repository_id: string;
  name?: string;
  schedule: string;
  webhook_url: string;
  enabled: boolean;
  last_run_status?: string;
  last_run_at?: string;
  last_run_content?: string;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get("SUPABASE_URL"),
      this.configService.get("SUPABASE_SERVICE_ROLE_KEY"),
    );
  }

  // Repository operations
  async createRepository(
    userId: string,
    githubUrl: string,
    branch: string,
    encryptedPat: string,
  ): Promise<Repository> {
    const { data, error } = await this.supabase
      .from("repositories")
      .insert({
        user_id: userId,
        github_url: githubUrl,
        branch: branch,
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
      .eq("user_id", userId);

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
    schedule: string,
    webhookUrl: string,
    name?: string,
    enabled: boolean = true,
  ): Promise<ReportConfiguration> {
    const { data, error } = await this.supabase
      .from("report_configurations")
      .insert({
        user_id: userId,
        repository_id: repositoryId,
        name: name,
        schedule: schedule,
        webhook_url: webhookUrl,
        enabled: enabled,
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
      .eq("user_id", userId);

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
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const { data, error } = await this.supabase
      .from("report_configurations")
      .select("*")
      .eq("enabled", true)
      .or(
        `and(schedule.eq.daily,or(last_run_at.is.null,last_run_at.lt.${oneDayAgo.toISOString()})),` +
          `and(schedule.eq.weekly,or(last_run_at.is.null,last_run_at.lt.${oneWeekAgo.toISOString()}))`,
      );

    if (error) throw error;
    return data || [];
  }
}
