import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from "@nestjs/common";
import { SupabaseAuthGuard } from "../guards/supabase-auth.guard";
import { ReportRunsService } from "../services/report-runs.service";

@Controller("report-runs")
@UseGuards(SupabaseAuthGuard)
export class ReportRunsController {
  constructor(private readonly reportRunsService: ReportRunsService) {}

  @Get()
  async getReportRuns(
    @Request() req,
    @Query("limit", new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query("offset", new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    const userId = req.user.id;
    return this.reportRunsService.getReportRunsByUserId(userId, limit, offset);
  }

  @Get("usage")
  async getUsageStats(@Request() req) {
    const userId = req.user.id;
    const monthlyUsage = await this.reportRunsService.getMonthlyUsage(userId);
    const userLimits = await this.reportRunsService.getUserLimits(userId);
    const canRun = await this.reportRunsService.checkUsageLimit(userId);

    // Get current repository count
    const { data: repositories } = await this.reportRunsService[
      "supabaseService"
    ]["supabase"]
      .from("repositories")
      .select("id")
      .eq("user_id", userId);
    const currentRepositories = repositories?.length || 0;

    // Get current total report configurations count
    const { data: reportConfigs } = await this.reportRunsService[
      "supabaseService"
    ]["supabase"]
      .from("report_configurations")
      .select("id")
      .in(
        "repository_id",
        (repositories || []).map((r) => r.id),
      );
    const currentReports = reportConfigs?.length || 0;

    const usage = monthlyUsage || {
      user_id: userId,
      month: new Date().toISOString().slice(0, 7) + "-01",
      total_runs: 0,
      successful_runs: 0,
      failed_runs: 0,
      total_tokens: 0,
      last_run_at: null,
    };

    // Remove cost information from response - users don't need to see operational costs
    const usageWithoutCost = {
      user_id: usage.user_id,
      month: usage.month,
      total_runs: usage.total_runs,
      successful_runs: usage.successful_runs,
      failed_runs: usage.failed_runs,
      total_tokens: usage.total_tokens,
      last_run_at: usage.last_run_at,
    };

    return {
      monthlyUsage: usageWithoutCost,
      canRunMore: canRun,
      limits: userLimits,
      monthlyLimit: userLimits.monthly_runs_limit,
      runsUsed: usage.successful_runs,
      runsRemaining: Math.max(
        0,
        userLimits.monthly_runs_limit - usage.successful_runs,
      ),
      currentRepositories,
      currentReports,
    };
  }

  @Get(":id")
  async getReportRun(@Request() req, @Param("id") id: string) {
    const userId = req.user.id;
    return this.reportRunsService.getReportRunById(id, userId);
  }
}
