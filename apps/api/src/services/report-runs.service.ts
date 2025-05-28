import { Injectable, Logger } from "@nestjs/common";
import { SupabaseService } from "./supabase.service";

export interface ReportRun {
  id: string;
  user_id: string;
  repository_id: string;
  report_configuration_id: string;
  started_at: string;
  completed_at?: string;
  status: "running" | "success" | "failed" | "cancelled";
  configuration_snapshot?: any;
  tokens_used: number;
  model_used?: string;
  cost_usd: number;
  commits_processed: number;
  commit_range_from?: string;
  commit_range_to?: string;
  report_content?: string;
  report_format: string;
  error_message?: string;
  error_code?: string;
  webhook_delivered: boolean;
  webhook_delivery_attempts: number;
  webhook_last_attempt_at?: string;
  webhook_response_status?: number;
  created_at: string;
  updated_at: string;
}

export interface MonthlyUsage {
  user_id: string;
  month: string;
  total_runs: number;
  successful_runs: number;
  failed_runs: number;
  total_tokens: number;
  total_cost_usd: number;
  last_run_at: string;
}

export interface CreateReportRunData {
  user_id: string;
  repository_id: string;
  report_configuration_id: string;
  configuration_snapshot?: any;
  model_used?: string;
}

export interface UpdateReportRunData {
  completed_at?: string;
  status?: "running" | "success" | "failed" | "cancelled";
  tokens_used?: number;
  cost_usd?: number;
  commits_processed?: number;
  commit_range_from?: string;
  commit_range_to?: string;
  report_content?: string;
  error_message?: string;
  error_code?: string;
  webhook_delivered?: boolean;
  webhook_delivery_attempts?: number;
  webhook_last_attempt_at?: string;
  webhook_response_status?: number;
}

@Injectable()
export class ReportRunsService {
  private readonly logger = new Logger(ReportRunsService.name);

  constructor(private supabaseService: SupabaseService) {}

  /**
   * Check if user has exceeded their monthly usage limit
   */
  async checkUsageLimit(userId: string, limit: number = 50): Promise<boolean> {
    try {
      // Get current month's start date
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      // Query successful runs for current month directly
      const { data, error } = await this.supabaseService["supabase"]
        .from("report_runs")
        .select("id", { count: "exact" })
        .eq("user_id", userId)
        .eq("status", "success")
        .gte("started_at", currentMonth.toISOString());

      if (error) {
        this.logger.error("Error checking usage limit:", error);
        return false; // Fail safe - deny if we can't check
      }

      const currentMonthRuns = data?.length || 0;
      return currentMonthRuns < limit;
    } catch (error) {
      this.logger.error("Error checking usage limit:", error);
      return false;
    }
  }

  /**
   * Get user's monthly usage statistics
   */
  async getMonthlyUsage(userId: string): Promise<MonthlyUsage | null> {
    try {
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      const { data, error } = await this.supabaseService["supabase"]
        .from("user_monthly_usage")
        .select("*")
        .eq("user_id", userId)
        .eq("month", currentMonth.toISOString())
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        this.logger.error("Error fetching monthly usage:", error);
        return null;
      }

      return data;
    } catch (error) {
      this.logger.error("Error fetching monthly usage:", error);
      return null;
    }
  }

  /**
   * Create a new report run record
   */
  async createReportRun(data: CreateReportRunData): Promise<ReportRun> {
    try {
      const { data: reportRun, error } = await this.supabaseService["supabase"]
        .from("report_runs")
        .insert({
          user_id: data.user_id,
          repository_id: data.repository_id,
          report_configuration_id: data.report_configuration_id,
          status: "running",
          configuration_snapshot: data.configuration_snapshot,
          model_used: data.model_used,
          tokens_used: 0,
          cost_usd: 0,
          commits_processed: 0,
          report_format: "markdown",
          webhook_delivered: false,
          webhook_delivery_attempts: 0,
        })
        .select()
        .single();

      if (error) {
        this.logger.error("Error creating report run:", error);
        throw error;
      }

      return reportRun;
    } catch (error) {
      this.logger.error("Error creating report run:", error);
      throw error;
    }
  }

  /**
   * Update an existing report run
   */
  async updateReportRun(
    runId: string,
    userId: string,
    updates: UpdateReportRunData,
  ): Promise<ReportRun> {
    try {
      const { data: reportRun, error } = await this.supabaseService["supabase"]
        .from("report_runs")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", runId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        this.logger.error("Error updating report run:", error);
        throw error;
      }

      return reportRun;
    } catch (error) {
      this.logger.error("Error updating report run:", error);
      throw error;
    }
  }

  /**
   * Mark report run as completed with success
   */
  async markRunAsSuccess(
    runId: string,
    userId: string,
    data: {
      tokens_used: number;
      cost_usd: number;
      commits_processed: number;
      commit_range_from?: string;
      commit_range_to?: string;
      report_content: string;
    },
  ): Promise<ReportRun> {
    return this.updateReportRun(runId, userId, {
      status: "success",
      completed_at: new Date().toISOString(),
      ...data,
    });
  }

  /**
   * Mark report run as failed
   */
  async markRunAsFailed(
    runId: string,
    userId: string,
    error_message: string,
    error_code?: string,
  ): Promise<ReportRun> {
    return this.updateReportRun(runId, userId, {
      status: "failed",
      completed_at: new Date().toISOString(),
      error_message,
      error_code,
    });
  }

  /**
   * Update webhook delivery status
   */
  async updateWebhookDelivery(
    runId: string,
    userId: string,
    delivered: boolean,
    responseStatus?: number,
  ): Promise<ReportRun> {
    return this.updateReportRun(runId, userId, {
      webhook_delivered: delivered,
      webhook_delivery_attempts: delivered ? 1 : 0,
      webhook_last_attempt_at: new Date().toISOString(),
      webhook_response_status: responseStatus,
    });
  }

  /**
   * Get report runs for a user
   */
  async getReportRunsByUserId(
    userId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<ReportRun[]> {
    try {
      const { data, error } = await this.supabaseService["supabase"]
        .from("report_runs")
        .select("*")
        .eq("user_id", userId)
        .order("started_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        this.logger.error("Error fetching report runs:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      this.logger.error("Error fetching report runs:", error);
      throw error;
    }
  }

  /**
   * Get a specific report run
   */
  async getReportRunById(
    runId: string,
    userId: string,
  ): Promise<ReportRun | null> {
    try {
      const { data, error } = await this.supabaseService["supabase"]
        .from("report_runs")
        .select("*")
        .eq("id", runId)
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        this.logger.error("Error fetching report run:", error);
        return null;
      }

      return data;
    } catch (error) {
      this.logger.error("Error fetching report run:", error);
      return null;
    }
  }
}
